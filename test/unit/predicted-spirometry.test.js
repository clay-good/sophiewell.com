// spec-v91 §2.4: GLI-2012 predicted FEV1/FVC + lower limit of normal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { predictedSpirometry } from '../../lib/pulm-v91.js';

test('GLI-2012 predicted values: Caucasian male age 40, height 175 cm', () => {
  // Cross-checked against the published GLI-2012 reference (rspiro lookup):
  // predicted FEV1 ~4.08 L, FVC ~5.05 L, FEV1/FVC ~0.81.
  const r = predictedSpirometry({ age: 40, heightCm: 175, sex: 'male', ethnicity: 'caucasian' });
  assert.equal(r.valid, true);
  assert.equal(r.predFev1, 4.08);
  assert.equal(r.predFvc, 5.05);
  assert.equal(r.predRatio, 0.81);
});

test('lower limit of normal (5th percentile) is below predicted', () => {
  const r = predictedSpirometry({ age: 40, heightCm: 175, sex: 'male', ethnicity: 'caucasian' });
  assert.equal(r.llnFev1, 3.23);
  assert.ok(r.llnFev1 < r.predFev1);
  assert.equal(r.llnRatio, 0.7);
});

test('% predicted and below-LLN flag from a measured value', () => {
  const r = predictedSpirometry({
    age: 40, heightCm: 175, sex: 'male', ethnicity: 'caucasian',
    measuredFev1: 3.0, measuredFvc: 4.5,
  });
  // 3.0 / 4.077... = 73.6%
  assert.equal(r.fev1Pct, 73.6);
  assert.equal(r.fev1BelowLln, true); // 3.0 < LLN 3.23
  assert.ok(r.fvcPct > 80 && r.fvcPct < 95);
});

test('Caucasian female age 30, height 165 cm predicted FEV1', () => {
  const r = predictedSpirometry({ age: 30, heightCm: 165, sex: 'female', ethnicity: 'caucasian' });
  assert.equal(r.predFev1, 3.32);
  assert.equal(r.sex, 'female');
});

test('age outside the GLI 3-95 range is surfaced, never extrapolated', () => {
  assert.equal(predictedSpirometry({ age: 2, heightCm: 100, sex: 'male' }).valid, false);
  assert.equal(predictedSpirometry({ age: 100, heightCm: 175, sex: 'male' }).valid, false);
});

test('unknown ethnicity group falls back to other/mixed, surfaced', () => {
  const r = predictedSpirometry({ age: 40, heightCm: 175, sex: 'male', ethnicity: 'martian' });
  assert.equal(r.valid, true);
  assert.equal(r.ethnicityFallback, true);
  assert.equal(r.ethnicityUsed, 'other');
});

test('missing age/height -> surfaced fallback (no NaN leak)', () => {
  const r = predictedSpirometry({ heightCm: 175, sex: 'male' });
  assert.equal(r.valid, false);
  assert.ok(!/NaN|Infinity/.test(r.band));
});
