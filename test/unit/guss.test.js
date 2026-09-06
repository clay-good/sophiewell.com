import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guss } from '../../lib/scoring-v4.js';

const sub = (sw, cg = 1, dr = 1, vc = 1) => ({ Swallow: sw, NoCough: cg, NoDrool: dr, NoVoiceChange: vc });
function make(stage1, semi, liq, sol) {
  const expand = (prefix, sub) => ({
    [`${prefix}Swallow`]: sub.Swallow,
    [`${prefix}NoCough`]: sub.NoCough,
    [`${prefix}NoDrool`]: sub.NoDrool,
    [`${prefix}NoVoiceChange`]: sub.NoVoiceChange,
  });
  return {
    vigilance: stage1[0], coughClear: stage1[1], salivaSwallow: stage1[2],
    salivaNoDrool: stage1[3], salivaNoVoiceChange: stage1[4],
    ...expand('semisolid', semi),
    ...expand('liquid', liq),
    ...expand('solid', sol),
  };
}
const pass5 = sub(2, 1, 1, 1); // 5 points
const fail = sub(0, 0, 0, 0);  // 0 points

test('guss perfect (tile example) -> 20, slight/no dysphagia', () => {
  const r = guss(make([1, 1, 1, 1, 1], pass5, pass5, pass5));
  assert.equal(r.score, 20);
  assert.equal(r.band, 'slight / no dysphagia');
  assert.deepEqual(r.gated, []);
  assert.match(r.text, /Normal diet/);
});

test('guss stage 1 = 4 -> gated, total 4, severe dysphagia', () => {
  const r = guss(make([1, 1, 1, 1, 0], pass5, pass5, pass5));
  assert.equal(r.stage1, 4);
  assert.equal(r.score, 4);
  assert.equal(r.band, 'severe dysphagia');
  // spec-v1084: a gated trial reports null, not 0. It used to say 0, which on
  // this scale means the patient failed the trial outright -- a total failure on
  // a trial that was never performed. The three are named in `gated` and the
  // tile no longer prints a per-stage score for them.
  assert.equal(r.semisolid, null);
  assert.equal(r.liquid, null);
  assert.equal(r.solid, null);
  assert.deepEqual(r.gated, ['semisolid', 'liquid', 'solid']);
});

test('guss stage 1 = 5, semisolid = 4 -> total 9, severe (lower edge)', () => {
  const r = guss(make([1, 1, 1, 1, 1], sub(2, 1, 1, 0), pass5, pass5));
  assert.equal(r.stage1, 5);
  assert.equal(r.semisolid, 4);
  assert.equal(r.score, 9);
  assert.equal(r.band, 'severe dysphagia');
  assert.deepEqual(r.gated, ['liquid', 'solid']);
});

test('guss stage 1 = 5, semisolid = 5, liquid = 4 -> total 14, moderate (upper edge)', () => {
  const r = guss(make([1, 1, 1, 1, 1], pass5, sub(2, 1, 1, 0), pass5));
  assert.equal(r.score, 14);
  assert.equal(r.band, 'moderate dysphagia');
  assert.deepEqual(r.gated, ['solid']);
});

test('guss stage 1 = 5, semisolid = 5, liquid = 5, solid = 4 -> total 19, slight (upper edge)', () => {
  const r = guss(make([1, 1, 1, 1, 1], pass5, pass5, sub(2, 1, 1, 0)));
  assert.equal(r.score, 19);
  assert.equal(r.band, 'slight dysphagia');
  assert.deepEqual(r.gated, []);
});

test('guss boundary: 10 -> moderate (lower edge)', () => {
  // stage1=5, semisolid=5 (=10 so far), liquid=0 (gates out solid)
  const r = guss(make([1, 1, 1, 1, 1], pass5, fail, pass5));
  assert.equal(r.score, 10);
  assert.equal(r.band, 'moderate dysphagia');
  assert.deepEqual(r.gated, ['solid']);
});

test('guss boundary: 15 -> slight (lower edge)', () => {
  // stage1=5, semisolid=5, liquid=5, solid=0 -> 15
  const r = guss(make([1, 1, 1, 1, 1], pass5, pass5, fail));
  assert.equal(r.score, 15);
  assert.equal(r.band, 'slight dysphagia');
  assert.deepEqual(r.gated, []);
});

test('guss all-zero -> total 0, severe, all gated', () => {
  const r = guss(make([0, 0, 0, 0, 0], fail, fail, fail));
  assert.equal(r.score, 0);
  assert.equal(r.band, 'severe dysphagia');
  assert.deepEqual(r.gated, ['semisolid', 'liquid', 'solid']);
});

test('guss text mentions Trapl 2007', () => {
  assert.match(guss(make([1, 1, 1, 1, 1], pass5, pass5, pass5)).text, /Trapl 2007/);
  assert.match(guss(make([0, 0, 0, 0, 0], fail, fail, fail)).text, /Trapl 2007/);
});

test('guss rejects bad inputs', () => {
  assert.throws(() => guss(make([2, 1, 1, 1, 1], pass5, pass5, pass5))); // vigilance > 1
  assert.throws(() => guss(make([1, 1, 1, 1, 1], sub(3, 1, 1, 1), pass5, pass5))); // swallow > 2
  assert.throws(() => guss(make([1, 1, 1, 1, 1], sub(1, 2, 1, 1), pass5, pass5))); // cough > 1
  assert.throws(() => guss(make([1.5, 1, 1, 1, 1], pass5, pass5, pass5))); // non-integer
});

// spec-v1084: on a staged protocol, "not attempted" and "not assessed" are
// different states, and only one of them is a gap.
//
// GUSS stops by design: semisolid is trialled only if the indirect swallow
// scores 5, liquid only if semisolid does, solid only if liquid does. A stopped
// protocol is a COMPLETE assessment with a low total, and refusing every partial
// screen would refuse most real ones. What the tile must not do is what it did:
// seventeen sliders parked at their best values read "GUSS 20 of 20 ... Normal
// diet, normal liquids" for a stroke patient nobody had given a spoonful of
// water.
const S1 = {
  vigilance: 1, coughClear: 1, salivaSwallow: 1, salivaNoDrool: 1, salivaNoVoiceChange: 1,
};
const trial = (p, swallow) => ({
  [`${p}Swallow`]: swallow, [`${p}NoCough`]: 1, [`${p}NoDrool`]: 1, [`${p}NoVoiceChange`]: 1,
});

test('spec-v1084: a stopped protocol scores; an interrupted one does not', () => {
  // Nothing rated: the indirect swallow gates everything, so there is nothing
  // to say at all.
  const none = guss({});
  assert.equal(none.valid, false);
  assert.equal(none.score, null);
  assert.doesNotMatch(none.text, /Normal diet/);

  // The indirect swallow fails. The protocol STOPS, and that is a finished
  // assessment with a real total -- the three trials are gated, not missing.
  const stopped = guss({ ...S1, salivaSwallow: 0, salivaNoDrool: 0 });
  assert.equal(stopped.valid, true);
  assert.equal(stopped.score, 3);
  assert.deepEqual(stopped.gated, ['semisolid', 'liquid', 'solid']);
  assert.deepEqual(stopped.outstanding, []);
  assert.match(stopped.text, /NPO/);

  // The indirect swallow passes and nobody recorded the semisolid trial. The
  // protocol did NOT stop -- it was interrupted, so there is no GUSS yet.
  const interrupted = guss(S1);
  assert.equal(interrupted.valid, false);
  assert.equal(interrupted.score, null);
  assert.deepEqual(interrupted.outstanding, ['semisolid']);
  assert.match(interrupted.text, /semisolid trial is outstanding/);

  // Passes semisolid, delays on liquids: stops before solids, scores 14.
  const partialPass = guss({ ...S1, ...trial('semisolid', 2), ...trial('liquid', 1) });
  assert.equal(partialPass.valid, true);
  assert.equal(partialPass.score, 14);
  assert.deepEqual(partialPass.gated, ['solid']);
  assert.deepEqual(partialPass.outstanding, []);

  // A clean sweep still clears the patient.
  const full = guss({ ...S1, ...trial('semisolid', 2), ...trial('liquid', 2), ...trial('solid', 2) });
  assert.equal(full.score, 20);
  assert.match(full.text, /Normal diet, normal liquids/);
});
