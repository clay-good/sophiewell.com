// spec-v169 2.3: CDC 2000 weight-for-age percentile & z-score (Kuczmarski 2002).
// LMS transform z = ((weight/M)^L - 1) / (L*S); percentile = standard-normal CDF.
// Worked examples are pinned to the verbatim CDC wtage.csv percentile columns:
// feeding a published P-column value back through the compute must return that
// percentile (the data file cross-verifies itself, spec-v97).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cdcWeightForAge } from '../../lib/peds-percentile-v169.js';

test('female 8.04 y at the published P50 weight -> 50th percentile, z 0', () => {
  // wtage.csv female age 96.5 mo: P50 = 25.7570168 kg.
  const r = cdcWeightForAge({ sex: 'female', ageYears: 96.5 / 12, weightKg: 25.7570168 });
  assert.equal(r.valid, true);
  assert.equal(r.percentile, '50th');
  assert.ok(r.z === 0); // -0 === 0 is true; r2 may yield negative zero
  assert.equal(r.abnormal, false);
  assert.match(r.band, /within the CDC reference range/);
});

test('female 8 y, 38.5 kg -> 97th percentile, high boundary (abnormal)', () => {
  // wtage.csv female age 96.5 mo: P97 = 38.53536809 kg (38.5 lands at the 97th).
  const r = cdcWeightForAge({ sex: 'female', ageYears: 8, weightKg: 38.5 });
  assert.equal(r.valid, true);
  assert.equal(r.percentile, '97th');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /95th percentile or above \(high weight-for-age\)/);
});

test('male 10.04 y at the published P95 weight -> high boundary, abnormal', () => {
  // wtage.csv male age 120.5 mo: P95 = 46.15753154 kg.
  const r = cdcWeightForAge({ sex: 'male', ageYears: 120.5 / 12, weightKg: 46.15753154 });
  assert.equal(r.valid, true);
  assert.equal(r.percentile, '95th');
  assert.equal(r.abnormal, true);
});

test('female 8.04 y at the published P3 weight -> low (below the 5th)', () => {
  // wtage.csv female age 96.5 mo: P3 = 19.54481057 kg.
  const r = cdcWeightForAge({ sex: 'female', ageYears: 96.5 / 12, weightKg: 19.54481057 });
  assert.equal(r.valid, true);
  assert.equal(r.percentile, '3rd');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /below the 5th percentile \(low weight-for-age\)/);
});

test('domain guards: age < 2, age > 20, missing sex/weight -> valid:false', () => {
  assert.equal(cdcWeightForAge({ sex: 'female', ageYears: 1, weightKg: 10 }).valid, false);
  assert.equal(cdcWeightForAge({ sex: 'female', ageYears: 21, weightKg: 60 }).valid, false);
  assert.equal(cdcWeightForAge({ ageYears: 8, weightKg: 25 }).valid, false);
  assert.equal(cdcWeightForAge({ sex: 'female', ageYears: 8 }).valid, false);
});
