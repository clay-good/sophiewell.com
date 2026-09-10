// spec-v112 2.5: MRC sum score (De Jonghe 2002). Six movements graded
// bilaterally (12 groups), each 0-5, sum 0-60; < 48 = ICU-acquired weakness,
// < 36 = severe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mrcSumScore } from '../../lib/critcare-v112.js';

const G = ['shoulderL', 'shoulderR', 'elbowL', 'elbowR', 'wristL', 'wristR', 'hipL', 'hipR', 'kneeL', 'kneeR', 'ankleL', 'ankleR'];
const all = (n) => Object.fromEntries(G.map((k) => [k, n]));

test('all groups graded 4 -> sum 48, at or above the threshold (not weakness)', () => {
  const r = mrcSumScore(all(4));
  assert.equal(r.valid, true);
  assert.equal(r.total, 48);
  assert.equal(r.weakness, false);
  assert.match(r.band, /at or above 48 -- ICU-acquired weakness is not met/);
});

test('the threshold is strictly < 48: 47 is weakness, 48 is not', () => {
  const weak = { ...all(4), ankleR: 3 }; // 47
  assert.equal(mrcSumScore(weak).total, 47);
  assert.equal(mrcSumScore(weak).weakness, true);
  assert.match(mrcSumScore(weak).band, /below 48 -- ICU-acquired weakness/);
  assert.equal(mrcSumScore(all(4)).weakness, false);
});

test('a sum below 36 is severe weakness', () => {
  const r = mrcSumScore(all(2)); // 24
  assert.equal(r.total, 24);
  assert.equal(r.severe, true);
  assert.match(r.band, /below 36 -- severe/);
});

test('the maximum sum is 60 (all groups 5), not weakness', () => {
  const r = mrcSumScore(all(5));
  assert.equal(r.total, 60);
  assert.equal(r.weakness, false);
});

test('a missing muscle group returns a complete-the-fields fallback', () => {
  const partial = all(4);
  delete partial.ankleR;
  assert.equal(mrcSumScore(partial).valid, false);
});

// spec-v1209: `clampInt(v, 0, 5)` mapped an impossible grade to full strength.

test('twelve impossible grades used to score 60/60 and read "not met"', () => {
  const r = mrcSumScore(all(500));
  assert.equal(r.valid, false);
  assert.match(r.band, /must be between 0 and 5/);
  assert.ok(!/not met/.test(r.band), 'must not report full strength from a grade nobody gave');
});

test('the grade is named the way a reader knows it, not by its key', () => {
  const r = mrcSumScore({ ...all(3), ankleR: -2 });
  assert.match(r.band, /Right ankle dorsiflexion/);
  assert.ok(!/ankleR/.test(r.band));
});

test('the full-strength score still computes', () => {
  assert.equal(mrcSumScore(all(5)).total, 60);
});

test('a blank group is still asked for, not reported out of range', () => {
  const partial = all(3);
  delete partial.hipL;
  assert.match(mrcSumScore(partial).band, /Grade all 12 muscle groups/);
});
