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

// spec-v1207: the three numeric criteria are now checked against lib/bounds.js.
// The BMI direction is the one worth pinning: an impossible BMI matches neither
// `< 16` nor `< 18.5`, so it REMOVES a criterion and the error lands on the
// reassuring side.
test('an impossible BMI used to remove a minor criterion and read "not high risk"', () => {
  const real = refeedingRisk({ bmi: 17, weightLoss: 12, daysNoIntake: 2 });
  assert.equal(real.highRisk, true, 'BMI 17 + 12% loss is two minor criteria');
  const mistyped = refeedingRisk({ bmi: 9999, weightLoss: 12, daysNoIntake: 2 });
  assert.equal(mistyped.valid, false);
  assert.match(mistyped.band, /body mass index/);
  assert.ok(!/[Nn]ot high risk/.test(mistyped.band), 'must not reassure from a BMI nobody has');
});

test('a BMI of 200 is the top of the envelope and still scores', () => {
  // The envelope is the frankly impossible, not the abnormal: the heaviest
  // recorded human reached ~185 kg/m^2. Pinning the edge says where it stops.
  const r = refeedingRisk({ bmi: 200, weightLoss: 12, daysNoIntake: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.minorCount, 1);
});

test('a weight loss above 100% and an impossible fast are both refused', () => {
  const wl = refeedingRisk({ bmi: 25, weightLoss: 9999, daysNoIntake: 2 });
  assert.equal(wl.valid, false);
  assert.match(wl.band, /unintentional weight loss/);
  const days = refeedingRisk({ bmi: 25, weightLoss: 2, daysNoIntake: 9999 });
  assert.equal(days.valid, false);
  assert.match(days.band, /little or no nutritional intake/);
});

test('an unmeasurable value is checked AFTER the missing-value branch', () => {
  // The rule that must not break: a reader who left BMI blank is asked for BMI,
  // not told that the value they did enter is out of range.
  const r = refeedingRisk({ weightLoss: 9999, daysNoIntake: 2 });
  assert.equal(r.valid, false);
  assert.match(r.band, /enter BMI/);
});
