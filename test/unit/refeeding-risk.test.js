// spec-v99 2.5: NICE CG32 refeeding-syndrome risk stratification.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { refeedingRisk } from '../../lib/idcrit-v99.js';

test('one major criterion (BMI < 16) -> high risk', () => {
  const r = refeedingRisk({ bmi: 15, weightLoss: 5, daysNoIntake: 2 });
  assert.equal(r.highRisk, true);
  assert.equal(r.majorCount, 1);
  assert.equal(r.minorCount, 0);
});

test('two minor criteria -> high risk', () => {
  const r = refeedingRisk({ bmi: 17, weightLoss: 12, daysNoIntake: 2 });
  assert.equal(r.highRisk, true);
  assert.ok(r.minorCount >= 2);
});

test('one minor criterion alone -> not high risk', () => {
  const r = refeedingRisk({ bmi: 17, weightLoss: 5, daysNoIntake: 2 });
  assert.equal(r.highRisk, false);
  assert.equal(r.majorCount, 0);
  assert.equal(r.minorCount, 1);
});

test('a major threshold is not double-counted as a minor', () => {
  // BMI < 16 is a major; it must not also count as a BMI < 18.5 minor.
  const r = refeedingRisk({ bmi: 15, weightLoss: 5, daysNoIntake: 2 });
  assert.equal(r.major.length, 1);
  assert.equal(r.minor.length, 0);
});

test('low electrolytes is a major; history flag is a minor', () => {
  const r = refeedingRisk({ bmi: 20, weightLoss: 5, daysNoIntake: 2, lowElectrolytes: true, historyFlag: true });
  assert.equal(r.majorCount, 1);
  assert.equal(r.minorCount, 1);
  assert.equal(r.highRisk, true);
});

test('blank BMI surfaces the complete-the-fields fallback', () => {
  const r = refeedingRisk({ weightLoss: 5, daysNoIntake: 2 });
  assert.equal(r.valid, false);
  assert.ok(!/NaN/.test(r.band));
});
