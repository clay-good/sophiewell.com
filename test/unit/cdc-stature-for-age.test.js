// spec-v169 2.2: CDC 2000 stature-for-age percentile & z-score (Kuczmarski 2002).
// LMS transform z = ((height/M)^L - 1) / (L*S); percentile = standard-normal CDF.
// Worked examples are pinned to the verbatim CDC statage.csv percentile columns:
// feeding a published P-column value back through the compute must return that
// percentile (the data file cross-verifies itself, spec-v97).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cdcStatureForAge } from '../../lib/peds-percentile-v169.js';

test('male 10.04 y at the published P50 height -> 50th percentile, z 0', () => {
  // statage.csv male age 120.5 mo: P50 = 138.8234114 cm.
  const r = cdcStatureForAge({ sex: 'male', ageYears: 120.5 / 12, heightCm: 138.8234114 });
  assert.equal(r.valid, true);
  assert.equal(r.percentile, '50th');
  assert.ok(r.z === 0); // -0 === 0 is true; r2 may yield negative zero
  assert.equal(r.abnormal, false);
  assert.match(r.band, /within the CDC reference range/);
});

test('male 10.04 y at the published P95 height -> high boundary, abnormal', () => {
  // statage.csv male age 120.5 mo: P95 = 149.9053151 cm.
  const r = cdcStatureForAge({ sex: 'male', ageYears: 120.5 / 12, heightCm: 149.9053151 });
  assert.equal(r.valid, true);
  assert.equal(r.percentile, '95th');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /95th percentile or above \(high stature-for-age\)/);
});

test('female 8.04 y at the published P3 height -> low (below the 5th)', () => {
  // statage.csv female age 96.5 mo: P3 = 117.2736916 cm.
  const r = cdcStatureForAge({ sex: 'female', ageYears: 96.5 / 12, heightCm: 117.2736916 });
  assert.equal(r.valid, true);
  assert.equal(r.percentile, '3rd');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /below the 5th percentile \(low stature-for-age\)/);
});

test('round example: male 10 y, 138 cm -> 46th percentile (z -0.09)', () => {
  const r = cdcStatureForAge({ sex: 'male', ageYears: 10, heightCm: 138 });
  assert.equal(r.valid, true);
  assert.equal(r.percentile, '46th');
  assert.equal(r.z, -0.09);
});

test('domain guards: age < 2, age > 20, missing sex/height -> valid:false', () => {
  assert.equal(cdcStatureForAge({ sex: 'male', ageYears: 1, heightCm: 80 }).valid, false);
  assert.equal(cdcStatureForAge({ sex: 'male', ageYears: 21, heightCm: 170 }).valid, false);
  assert.equal(cdcStatureForAge({ ageYears: 10, heightCm: 138 }).valid, false);
  assert.equal(cdcStatureForAge({ sex: 'male', ageYears: 10 }).valid, false);
});
