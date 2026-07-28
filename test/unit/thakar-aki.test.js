// spec-v568: the Cleveland Clinic (Thakar) score.
//
// The load-bearing tests are the unclassified tail (the score reaches 17 while the published categories
// stop at 13) and the deliberate absence of any quoted risk percentage.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  thakarAki, THAKAR_FACTORS, SURGERY_TYPES, CREATININE_BANDS,
  THAKAR_MAX, HIGHEST_PUBLISHED_SCORE,
} from '../../lib/thakar-aki-v568.js';

const base = (over = {}) => {
  const o = { surgeryType: 'cabg', creatinine: '1.0' };
  for (const f of THAKAR_FACTORS) o[f.key] = 'no';
  return { ...o, ...over };
};
const score = (over = {}) => thakarAki(base(over));
const allFactors = (v) => Object.fromEntries(THAKAR_FACTORS.map((f) => [f.key, v]));

test('the weights are the published ones and sum correctly', () => {
  assert.deepEqual(THAKAR_FACTORS.map((f) => [f.key, f.points]), [
    ['female', 1], ['congestiveHeartFailure', 1], ['lvefUnder35', 1], ['preoperativeIabp', 2],
    ['copd', 1], ['insulinDiabetes', 1], ['previousCardiacSurgery', 1], ['emergencySurgery', 2],
  ]);
  const factorMax = THAKAR_FACTORS.reduce((a, f) => a + f.points, 0);
  const surgeryMax = Math.max(...SURGERY_TYPES.map((s) => s.points));
  const creatinineMax = Math.max(...CREATININE_BANDS.map((b) => b.points));
  assert.equal(factorMax + surgeryMax + creatinineMax, THAKAR_MAX);
  assert.equal(THAKAR_MAX, 17);
});

test('the extremes are 0 and 17', () => {
  assert.equal(score().total, 0);
  const top = thakarAki({ ...allFactors('yes'), surgeryType: 'other', creatinine: '3.0' });
  assert.equal(top.total, THAKAR_MAX);
});

// THE unclassified tail.
test('the published categories stop at 13 while the score runs to 17', () => {
  assert.equal(HIGHEST_PUBLISHED_SCORE, 13);
  assert.ok(HIGHEST_PUBLISHED_SCORE < THAKAR_MAX);
});

test('a score above 13 gets no category rather than being stretched into the top band', () => {
  const top = thakarAki({ ...allFactors('yes'), surgeryType: 'other', creatinine: '3.0' });
  assert.equal(top.total, 17);
  assert.equal(top.bandAssigned, false);
  assert.equal(top.band, null);
  assert.match(top.bandText, /fall outside the published table/);
});

test('a score of exactly 13 is still banded', () => {
  // 6 factor points (chf 1 + lvef 1 + iabp 2 + copd 1 + insulin 1) + 2 surgery + 5 creatinine = 13.
  const r = thakarAki({
    ...allFactors('no'),
    congestiveHeartFailure: 'yes', lvefUnder35: 'yes', preoperativeIabp: 'yes',
    copd: 'yes', insulinDiabetes: 'yes',
    surgeryType: 'cabg-valve', creatinine: '3.0',
  });
  assert.equal(r.total, 13);
  assert.equal(r.bandAssigned, true);
  assert.match(r.band, /9 to 13/);
});

test('the band boundaries are the published ones', () => {
  assert.match(score().band, /0 to 2/);                                        // 0
  assert.match(score({ female: 'yes', copd: 'yes' }).band, /0 to 2/);          // 2
  assert.match(score({ creatinine: '1.5', female: 'yes' }).band, /3 to 5/);    // 2 + 1 = 3
  assert.match(score({ creatinine: '1.5', ...allFactors('no'), female: 'yes', copd: 'yes', lvefUnder35: 'yes' }).band, /3 to 5/); // 5
  assert.match(score({ creatinine: '2.5', female: 'yes' }).band, /6 to 8/);    // 5 + 1 = 6
  assert.match(score({ creatinine: '2.5', ...allFactors('no'), female: 'yes', copd: 'yes', lvefUnder35: 'yes', emergencySurgery: 'yes' }).band, /9 to 13/); // 5 + 5 = 10
});

// The withheld percentages.
test('no risk percentage is quoted anywhere in the result', () => {
  const r = score({ female: 'yes' });
  assert.doesNotMatch(r.bandText, /21\.3|21\.5|9\.5|7\.8|0\.4|1\.8|22\.1/);
  assert.match(r.bandText, /exact risk percentages are NOT reported/);
});

test('the result explains why the percentages are withheld', () => {
  assert.match(score().bandText, /primary table is paywalled/);
});

// The outcome definition.
test('the result and note both state the outcome is dialysis-requiring failure, not KDIGO AKI', () => {
  const r = score();
  assert.match(r.bandText, /REQUIRING DIALYSIS, not KDIGO acute kidney injury/);
  assert.match(r.note, /not KDIGO acute kidney injury/);
});

// Surgery type.
test('other cardiac surgery scores the same as CABG plus valve, and isolated CABG scores nothing', () => {
  const points = Object.fromEntries(SURGERY_TYPES.map((s) => [s.value, s.points]));
  assert.equal(points.cabg, 0);
  assert.equal(points.other, points['cabg-valve']);
  assert.equal(points.other, 2);
  assert.equal(score({ surgeryType: 'other' }).total, score({ surgeryType: 'cabg-valve' }).total);
});

test('the result states the surgery-type oddity', () => {
  assert.match(score().bandText, /counter-intuitive/);
});

// Creatinine.
test('creatinine is stepped, not interpolated', () => {
  assert.equal(score({ creatinine: '1.19' }).creatininePoints, 0);
  assert.equal(score({ creatinine: '1.2' }).creatininePoints, 2);
  assert.equal(score({ creatinine: '2.09' }).creatininePoints, 2);
  assert.equal(score({ creatinine: '2.1' }).creatininePoints, 5);
});

test('a small creatinine change at the upper threshold moves the score by three points', () => {
  const below = score({ creatinine: '2.0' });
  const above = score({ creatinine: '2.1' });
  assert.equal(above.total - below.total, 3);
});

// Input handling.
test('missing inputs are refused', () => {
  assert.equal(thakarAki({}).valid, false);
  assert.equal(thakarAki({ ...allFactors('no'), creatinine: '1' }).valid, false);
  assert.equal(thakarAki({ ...allFactors('no'), surgeryType: 'cabg' }).valid, false);
});

test('an unknown surgery type is refused and the oddity is explained', () => {
  const r = score({ surgeryType: 'transplant' });
  assert.equal(r.valid, false);
  assert.match(r.message, /"other" scores the same as CABG plus valve/);
});

test('the scope note refuses to defer an operation or predict other outcomes', () => {
  const r = score();
  assert.match(r.note, /not an indication to cancel or defer an operation/);
  assert.match(r.note, /including mortality, length of stay/);
});
