// spec-v141 2.1: CDC 2000 BMI-for-age percentile & z-score (Kuczmarski 2002).
// LMS transform z = ((BMI/M)^L - 1) / (L*S); percentile = standard-normal CDF.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedsBmiPercentile } from '../../lib/peds-growth-v141.js';

test('16y boy BMI 30 -> obese, crosses the 95th-percentile boundary', () => {
  const r = pedsBmiPercentile({ sex: 'male', ageYears: 16, bmi: 30 });
  assert.equal(r.valid, true);
  assert.equal(r.percentile, '98th');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /obese \(95th percentile or above\)/);
});

test('weight + height path derives BMI', () => {
  const r = pedsBmiPercentile({ sex: 'female', ageYears: 8, weightKg: 25, heightCm: 128 });
  assert.equal(r.valid, true);
  assert.equal(r.derived, true);
  assert.equal(r.bmi, 15.3);
  assert.match(r.band, /healthy weight/);
});

test('median BMI gives z near 0 (~50th percentile)', () => {
  // CDC male 120 mo (10 y) median BMI is ~16.6; feed M -> z ~ 0.
  const r = pedsBmiPercentile({ sex: 'male', ageYears: 10, bmi: 16.6 });
  assert.equal(r.valid, true);
  assert.ok(Math.abs(r.z) < 0.05, `expected z near 0, got ${r.z}`);
});

test('underweight below the 5th percentile', () => {
  const r = pedsBmiPercentile({ sex: 'male', ageYears: 5, bmi: 12.5 });
  assert.equal(r.valid, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /underweight \(under the 5th percentile\)/);
});

test('domain guards: age < 2 and missing inputs -> valid:false', () => {
  assert.equal(pedsBmiPercentile({ sex: 'male', ageYears: 1, bmi: 18 }).valid, false);
  assert.equal(pedsBmiPercentile({ sex: 'male', ageYears: 25, bmi: 22 }).valid, false);
  assert.equal(pedsBmiPercentile({ ageYears: 10, bmi: 18 }).valid, false);
  assert.equal(pedsBmiPercentile({ sex: 'male', ageYears: 10 }).valid, false);
  assert.equal(pedsBmiPercentile(0).valid, false);
});
