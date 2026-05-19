import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mustNutrition } from '../../lib/scoring-v4.js';

test('must low: BMI 22, 0 loss, no acute -> 0', () => {
  const r = mustNutrition({ bmi: 22, weightLossPct: 0, acuteDiseaseNoIntakeGt5d: false });
  assert.equal(r.score, 0);
});

test('must medium 1: BMI 22, 7% loss', () => {
  const r = mustNutrition({ bmi: 22, weightLossPct: 7, acuteDiseaseNoIntakeGt5d: false });
  assert.equal(r.score, 1);
  assert.match(r.band, /medium/);
});

test('must high: BMI 17, 12% loss, acute = 6 (maximum)', () => {
  const r = mustNutrition({ bmi: 17, weightLossPct: 12, acuteDiseaseNoIntakeGt5d: true });
  assert.equal(r.score, 6);
  assert.match(r.band, /high/);
});

test('must BMI bands per BAPEN 2003', () => {
  assert.equal(mustNutrition({ bmi: 21, weightLossPct: 0, acuteDiseaseNoIntakeGt5d: false }).parts.bmi, 0);
  assert.equal(mustNutrition({ bmi: 19, weightLossPct: 0, acuteDiseaseNoIntakeGt5d: false }).parts.bmi, 1);
  assert.equal(mustNutrition({ bmi: 17, weightLossPct: 0, acuteDiseaseNoIntakeGt5d: false }).parts.bmi, 2);
});
