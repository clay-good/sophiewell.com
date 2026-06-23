// spec-v141 2.2: WHO 2006 weight/length-for-age z-score (WHO MGRS 2006).
// LMS transform; length-for-age uses L = 1 (the L -> 0-distinct linear case).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoGrowthZscore } from '../../lib/peds-growth-v141.js';

test('6mo boy 5.5 kg -> severely low (z below -3)', () => {
  const r = whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 6, value: 5.5 });
  assert.equal(r.valid, true);
  assert.equal(r.z, -3.27);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /severely low/);
});

test('median weight gives z ~ 0', () => {
  // WHO boy weight-for-age at 0 mo median M = 3.3464 kg.
  const r = whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 0, value: 3.3464 });
  assert.equal(r.valid, true);
  assert.ok(Math.abs(r.z) < 0.005, `expected z near 0, got ${r.z}`);
});

test('length-for-age uses L = 1 (linear)', () => {
  const r = whoGrowthZscore({ sex: 'male', measure: 'length', ageMonths: 24, value: 80 });
  assert.equal(r.valid, true);
  assert.match(r.measure, /length-for-age/);
  assert.match(r.band, /stunted/);
});

test('weight within reference range is flagged normal', () => {
  const r = whoGrowthZscore({ sex: 'female', measure: 'weight', ageMonths: 12, value: 9.5 });
  assert.equal(r.valid, true);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /within the WHO reference range/);
});

test('domain guards: age > 24, missing measure / value -> valid:false', () => {
  assert.equal(whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 30, value: 12 }).valid, false);
  assert.equal(whoGrowthZscore({ sex: 'male', ageMonths: 6, value: 7 }).valid, false);
  assert.equal(whoGrowthZscore({ sex: 'male', measure: 'weight', ageMonths: 6 }).valid, false);
  assert.equal(whoGrowthZscore({ measure: 'weight', ageMonths: 6, value: 7 }).valid, false);
  assert.equal(whoGrowthZscore(0).valid, false);
});
