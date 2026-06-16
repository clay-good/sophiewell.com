// spec-v90 §2.2: ECG LVH voltage criteria (Sokolow-Lyon + Cornell voltage).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lvhCriteria } from '../../lib/cardio-v90.js';

test('worked example: Sokolow-Lyon positive, Cornell negative (male)', () => {
  const r = lvhCriteria({ sV1: 20, rV5: 18, rV6: 16, sV3: 12, rAVL: 10, sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.sokolowSum, 38); // 20 + max(18,16)=18
  assert.equal(r.sokolowMet, true);
  assert.equal(r.cornellSum, 22); // 12 + 10
  assert.equal(r.cornellMet, false); // 22 not > 28
  assert.equal(r.anyMet, true);
});

test('Sokolow-Lyon 35 mm edge is met (>= 35)', () => {
  const at = lvhCriteria({ sV1: 17, rV5: 18, sex: 'male' });
  assert.equal(at.sokolowSum, 35);
  assert.equal(at.sokolowMet, true);
  const below = lvhCriteria({ sV1: 16, rV5: 18, sex: 'male' });
  assert.equal(below.sokolowSum, 34);
  assert.equal(below.sokolowMet, false);
});

test('Cornell threshold is sex-specific: sum 25 is positive for women, negative for men', () => {
  const female = lvhCriteria({ sV3: 13, rAVL: 12, sex: 'female' });
  assert.equal(female.cornellSum, 25);
  assert.equal(female.cornellThreshold, 20);
  assert.equal(female.cornellMet, true);
  const male = lvhCriteria({ sV3: 13, rAVL: 12, sex: 'male' });
  assert.equal(male.cornellThreshold, 28);
  assert.equal(male.cornellMet, false);
});

test('the larger of RV5/RV6 is used for Sokolow-Lyon', () => {
  const r = lvhCriteria({ sV1: 20, rV5: 10, rV6: 19, sex: 'male' });
  assert.equal(r.sokolowSum, 39); // 20 + 19
});

test('voltages clamp to a non-negative magnitude', () => {
  const r = lvhCriteria({ sV1: -20, rV5: 18, sex: 'male' });
  assert.equal(r.sokolowSum, 18); // -20 clamped to 0
});

test('a partial limb is reported as unknown, not a false negative', () => {
  // Sokolow complete (SV1 + RV5), Cornell partial (no SV3/RaVL).
  const r = lvhCriteria({ sV1: 20, rV5: 18, sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.sokolowMet, true);
  assert.equal(r.cornellMet, null);
});

test('no amplitudes at all renders the complete-the-fields fallback', () => {
  assert.equal(lvhCriteria({ sex: 'male' }).valid, false);
});
