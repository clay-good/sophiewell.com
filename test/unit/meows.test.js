import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meows } from '../../lib/scoring-v4.js';

const normal = {
  rr: 16, spo2: 98, temp: 37.0,
  sbp: 118, dbp: 72, hr: 82,
  neuro: 'A', pain: 0,
};

test('meows all-normal (tile example) -> no trigger', () => {
  const r = meows(normal);
  assert.equal(r.trigger, false);
  assert.equal(r.band, 'no trigger');
  assert.equal(r.redCount, 0);
  assert.equal(r.yellowCount, 0);
  for (const v of Object.values(r.flags)) assert.equal(v, 'normal');
});

test('meows single yellow (HR 110) -> no trigger', () => {
  const r = meows({ ...normal, hr: 110 });
  assert.equal(r.trigger, false);
  assert.equal(r.flags.hr, 'yellow');
  assert.equal(r.yellowCount, 1);
  assert.equal(r.redCount, 0);
});

test('meows two yellows (HR 110, SBP 95) -> trigger', () => {
  const r = meows({ ...normal, hr: 110, sbp: 95 });
  assert.equal(r.trigger, true);
  assert.equal(r.band, 'trigger');
  assert.equal(r.yellowCount, 2);
  assert.equal(r.redCount, 0);
});

test('meows single red (SBP 80) -> trigger', () => {
  const r = meows({ ...normal, sbp: 80 });
  assert.equal(r.trigger, true);
  assert.equal(r.flags.sbp, 'red');
  assert.equal(r.redCount, 1);
});

test('meows SpO2 94 -> red (Singh 2012 <95 cutoff)', () => {
  const r = meows({ ...normal, spo2: 94 });
  assert.equal(r.flags.spo2, 'red');
  assert.equal(r.trigger, true);
});

test('meows temp 35.5 -> yellow; temp 34.9 -> red', () => {
  const a = meows({ ...normal, temp: 35.5 });
  assert.equal(a.flags.temp, 'yellow');
  const b = meows({ ...normal, temp: 34.9 });
  assert.equal(b.flags.temp, 'red');
});

test('meows neuro V -> yellow; P -> red; U -> red', () => {
  assert.equal(meows({ ...normal, neuro: 'V' }).flags.neuro, 'yellow');
  assert.equal(meows({ ...normal, neuro: 'P' }).flags.neuro, 'red');
  assert.equal(meows({ ...normal, neuro: 'U' }).flags.neuro, 'red');
});

test('meows pain 2 -> yellow (single yellow alone does not trigger)', () => {
  const r = meows({ ...normal, pain: 2 });
  assert.equal(r.flags.pain, 'yellow');
  assert.equal(r.trigger, false);
});

test('meows text mentions Singh 2012', () => {
  assert.match(meows(normal).text, /Singh 2012/);
  assert.match(meows({ ...normal, sbp: 80 }).text, /Singh 2012/);
});

test('meows rejects invalid neuro and out-of-range pain', () => {
  assert.throws(() => meows({ ...normal, neuro: 'X' }));
  assert.throws(() => meows({ ...normal, pain: 4 }));
  assert.throws(() => meows({ ...normal, pain: 1.5 }));
});

test('meows rejects implausible vitals, and asks for the ones it does not have', () => {
  // spec-v1036: a non-finite respiratory rate is an observation that is not
  // there, not an implausible one. It used to throw; it now returns the same
  // prompt a blank field does, because that is what the reader has to act on.
  const notTaken = meows({ ...normal, rr: NaN });
  assert.deepEqual(notTaken.missing, ['rr']);
  assert.match(notTaken.text, /Enter respiratory rate/);
  // spec-v1200: a value that IS there and cannot be true used to throw, which the
  // output-safety layer turns into a bare COMPUTE_ERROR. Where lib/bounds.js
  // declares an envelope it now returns a refusal naming the range instead, in
  // the same shape as the missing branch above, so the page and an agent both
  // read it the way they already read that one.
  const impossible = meows({ ...normal, hr: -5 });
  assert.equal(impossible.valid, false);
  assert.equal(impossible.band, 'not scored');
  assert.equal(impossible.trigger, null);
  assert.match(impossible.text, /plausible range for heart rate/);
  assert.deepEqual(impossible.missing, [], 'an entered value is not a missing one');

  // Oxygen saturation carries no envelope in lib/bounds.js, so that path is
  // unchanged and still throws.
  assert.throws(() => meows({ ...normal, spo2: 105 }));
});

// spec-v1086: the pain score is an observation too.
//
// spec-v1036 gave the six vitals a blank-aware reader after an untaken
// observation set scored red on five parameters and called the obstetric
// rapid-response team. The pain score was left out of that set, because its
// control was a slider with no blank to read. The slider is gone, so it joins
// them -- an unrecorded pain score is not a pain score of nought.
test('spec-v1086: an unrecorded pain score is not a pain score of zero', () => {
  const vitals = { rr: 16, spo2: 98, temp: 37, sbp: 120, dbp: 75, hr: 80, neuro: 'A' };

  const complete = meows({ ...vitals, pain: 0 });
  assert.equal(complete.band, 'no trigger');
  assert.match(complete.text, /Continue routine monitoring/);

  const noPain = meows(vitals);
  assert.equal(noPain.band, 'not scored');
  assert.deepEqual(noPain.missing, ['pain']);
  assert.doesNotMatch(noPain.text, /Continue routine monitoring/);

  // The refusal names what is outstanding, not the whole observation set.
  assert.match(noPain.text, /Enter the pain score:/);
  const twoOut = meows({ ...vitals, pain: 1, spo2: null, hr: null });
  assert.match(twoOut.text, /Enter oxygen saturation, heart rate:/);
});
