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

test('meows rejects non-finite and implausible vitals', () => {
  assert.throws(() => meows({ ...normal, rr: NaN }));
  assert.throws(() => meows({ ...normal, hr: -5 }));
  assert.throws(() => meows({ ...normal, spo2: 105 }));
});
