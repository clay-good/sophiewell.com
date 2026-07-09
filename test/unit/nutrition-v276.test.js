// spec-v276: worked examples for the Buzby Nutritional Risk Index (NRI). Formula/bands
// spec-v97 verified against Buzby 1991 (NEJM, VA-TPN) and standard nutrition references:
// NRI = 1.519 x albumin (g/L) + 41.7 x (current weight / usual weight).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nri } from '../../lib/nutrition-v276.js';

test('nri: a moderate-risk worked example', () => {
  const r = nri({ albumin: 40, currentWeight: 60, usualWeight: 70 });
  // 1.519*40 + 41.7*(60/70) = 60.76 + 35.743 = 96.503 -> r2 96.5.
  assert.equal(r.valid, true);
  assert.equal(r.score, 96.5);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('Nutritional Risk Index 96.5'));
  assert.ok(r.band.includes('moderate nutritional risk'));
});

test('nri: a well-nourished (> 100) case is not flagged', () => {
  const r = nri({ albumin: 42, currentWeight: 70, usualWeight: 70 });
  // 1.519*42 + 41.7*1 = 63.798 + 41.7 = 105.498 -> r2 105.5.
  assert.equal(r.score, 105.5);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('no nutritional risk'));
});

test('nri: a severe (< 83.5) case', () => {
  const r = nri({ albumin: 25, currentWeight: 55, usualWeight: 75 });
  // 1.519*25 + 41.7*(55/75) = 37.975 + 30.58 = 68.555 -> r2 68.55 (float).
  assert.equal(r.score, 68.55);
  assert.ok(r.band.includes('severe nutritional risk'));
});

test('nri: missing / out-of-range inputs are invalid', () => {
  assert.equal(nri({ albumin: 40, currentWeight: 60 }).valid, false);
  assert.equal(nri({}).valid, false);
  assert.equal(nri().valid, false);
  assert.equal(nri({ albumin: 40, currentWeight: 60, usualWeight: 0 }).valid, false);
});
