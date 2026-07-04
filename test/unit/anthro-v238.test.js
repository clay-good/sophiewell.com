// spec-v238: worked examples for the anthropometric / metabolic estimators.
// Formulas spec-v97 verified (Woolcott 2018; Thomas 2013; Hodgdon-Beckett 1984;
// Williams 2000).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relativeFatMass, bodyRoundnessIndex, navyBodyFat, egdr } from '../../lib/anthro-v238.js';

test('relative-fat-mass: female adds 12', () => {
  assert.equal(relativeFatMass({ height: 170, waist: 90, sex: 'female' }).score, 38.2);
  assert.equal(relativeFatMass({ height: 170, waist: 90, sex: 'male' }).score, 26.2);
});
test('relative-fat-mass: needs a valid sex', () => {
  assert.equal(relativeFatMass({ height: 170, waist: 90, sex: '' }).valid, false);
});

test('body-roundness-index: computed', () => {
  assert.equal(bodyRoundnessIndex({ waist: 90, height: 170 }).score, 3.93);
});
test('body-roundness-index: guards impossible geometry', () => {
  assert.equal(bodyRoundnessIndex({ waist: 250, height: 60 }).valid, false);
});

test('navy-body-fat: male estimate', () => {
  assert.equal(navyBodyFat({ sex: 'male', height: 70, neck: 15, waist: 34 }).score, 11.1);
});
test('navy-body-fat: waist must exceed neck', () => {
  assert.equal(navyBodyFat({ sex: 'male', height: 70, neck: 40, waist: 34 }).valid, false);
});

test('egdr: lower with more risk factors', () => {
  assert.equal(egdr({ waist: 100, hypertension: true, a1c: 8 }).score, 4.34);
  const sensitive = egdr({ waist: 80, hypertension: false, a1c: 5 });
  assert.ok(sensitive.score > 4.34);
});
