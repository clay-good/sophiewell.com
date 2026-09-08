// spec-v208 2.2: GLIM criteria worked examples. Malnutrition = >=1 phenotypic AND
// >=1 etiologic; severity from phenotypic (Stage 2 = severe weight loss / BMI).
// Criteria spec-v97 cross-verified (Cederholm 2019 + ESPEN fact sheet).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { glim } from '../../lib/nutrition-maternal-v208.js';

test('severe weight loss + reduced intake -> Stage 2 (worked example)', () => {
  const r = glim({ weightLoss: 'severe', reducedIntake: true });
  assert.equal(r.valid, true);
  assert.equal(r.diagnosed, true);
  assert.equal(r.stage, 2);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /Stage 2/);
});

test('moderate weight loss + inflammation -> Stage 1', () => {
  const r = glim({ weightLoss: 'moderate', inflammation: true });
  assert.equal(r.diagnosed, true);
  assert.equal(r.stage, 1);
});

test('phenotypic without etiologic -> not diagnosed', () => {
  const r = glim({ weightLoss: 'moderate' });
  assert.equal(r.diagnosed, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /not diagnosed/);
});

test('etiologic without phenotypic -> not diagnosed', () => {
  const r = glim({ reducedIntake: true, inflammation: true });
  assert.equal(r.diagnosed, false);
});

test('reduced muscle mass counts as a phenotypic criterion', () => {
  const r = glim({ reducedMuscle: true, inflammation: true });
  assert.equal(r.diagnosed, true);
  assert.equal(r.stage, 1); // muscle-only phenotypic defaults to Stage 1
});

test('severe low BMI drives Stage 2', () => {
  const r = glim({ lowBmi: 'severe', reducedIntake: true });
  assert.equal(r.stage, 2);
});

test('spec-v1119: an unstated phenotypic criterion blocks only the exclusion it could change', () => {
  // Both graded criteria are PHENOTYPIC, and GLIM needs one of each kind. With
  // the etiologic side met and the phenotypic side empty, an unstated weight
  // loss or BMI could complete the pair, so the exclusion waits.
  const open = glim({ reducedIntake: 'yes' });
  assert.equal(open.floorOnly, true);
  assert.match(open.band, /Not yet assessable by GLIM/);
  assert.deepEqual(open.unstated, ['the weight loss', 'the body mass index']);

  // With them stated, the exclusion is earned.
  const stated = glim({ reducedIntake: 'yes', weightLoss: 'none', lowBmi: 'none' });
  assert.equal(stated.floorOnly, false);
  assert.match(stated.band, /not diagnosed by GLIM/);

  // And with NO etiologic criterion, no phenotypic one could complete the pair,
  // so the exclusion stands however the two selects would have read. The
  // etiologic side is checkboxes, and an unticked box is a real "no".
  const noEtiologic = glim({});
  assert.equal(noEtiologic.floorOnly, false);
  assert.match(noEtiologic.band, /not diagnosed by GLIM/);
});
