// spec-v137 2.1: ISARIC 4C Mortality Score (Knight SR, et al, BMJ 2020;370:m3339).
// Additive 0-21; corrected Table 2 uses urea < 7 mmol/L and CRP mg/L. Tests pin
// the risk-group boundaries (4-8 -> 9-14 at total 8 vs 9), the urea unit
// conversion (BUN 19.6 mg/dL == urea 7 mmol/L -> +1), and the max-score ceiling.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isaric4cMortality } from '../../lib/id-v137.js';

const base = { age: 62, sex: 'male', comorbidities: 2, rr: 22, spo2: 95, gcs: 15, urea: 5, ureaUnit: 'mmol', crp: 30 };

test('worked example: total 8 -> Intermediate (upper edge of 4-8)', () => {
  const r = isaric4cMortality(base);
  assert.equal(r.valid, true);
  assert.equal(r.total, 8);
  assert.equal(r.group, 'Intermediate');
});

test('CRP 60 bumps the total to 9 -> High (lower edge of 9-14)', () => {
  const r = isaric4cMortality({ ...base, crp: 60 });
  assert.equal(r.total, 9);
  assert.equal(r.group, 'High');
  assert.equal(r.abnormal, true);
});

test('urea unit: BUN 19.6 mg/dL equals urea 7 mmol/L -> +1', () => {
  const mmol = isaric4cMortality({ ...base, urea: 7, ureaUnit: 'mmol', crp: 0, comorbidities: 0, rr: 18, age: 40, sex: 'female' });
  const bun = isaric4cMortality({ ...base, urea: 19.6, ureaUnit: 'bun-mgdl', crp: 0, comorbidities: 0, rr: 18, age: 40, sex: 'female' });
  assert.equal(bun.total, mmol.total);
  assert.equal(bun.total, 1); // only the urea +1 scores
});

test('urea band edges: < 7 = 0, exactly 7 = +1, > 14 = +3', () => {
  const z = { age: 40, sex: 'female', comorbidities: 0, rr: 18, spo2: 95, gcs: 15, crp: 0 };
  assert.equal(isaric4cMortality({ ...z, urea: 6.9, ureaUnit: 'mmol' }).total, 0);
  assert.equal(isaric4cMortality({ ...z, urea: 7, ureaUnit: 'mmol' }).total, 1);
  assert.equal(isaric4cMortality({ ...z, urea: 14, ureaUnit: 'mmol' }).total, 1);
  assert.equal(isaric4cMortality({ ...z, urea: 14.1, ureaUnit: 'mmol' }).total, 3);
});

test('maximum score is 21 -> Very high', () => {
  const r = isaric4cMortality({ age: 85, sex: 'male', comorbidities: 3, rr: 35, spo2: 80, gcs: 10, urea: 20, ureaUnit: 'mmol', crp: 200 });
  assert.equal(r.total, 21);
  assert.equal(r.group, 'Very high');
});

test('all-zero minimum is 0 -> Low', () => {
  const r = isaric4cMortality({ age: 40, sex: 'female', comorbidities: 0, rr: 18, spo2: 95, gcs: 15, urea: 5, ureaUnit: 'mmol', crp: 10 });
  assert.equal(r.total, 0);
  assert.equal(r.group, 'Low');
});

test('missing or out-of-range inputs surface the fallback', () => {
  assert.equal(isaric4cMortality({}).valid, false);
  assert.equal(isaric4cMortality({ ...base, sex: '' }).valid, false);
  assert.equal(isaric4cMortality({ ...base, ureaUnit: '' }).valid, false);
  assert.equal(isaric4cMortality({ ...base, gcs: 2 }).valid, false);
  assert.equal(isaric4cMortality({ ...base, gcs: 16 }).valid, false);
  assert.equal(isaric4cMortality({ ...base, crp: null }).valid, false);
});

// spec-v1741: an entered age past 130 is told its range, not asked for again as if blank.
test('spec-v1741: an age of 1300 names its range; a blank is still asked for; 120 and the worked example answer', () => {
  assert.equal(isaric4cMortality(base).valid, true);
  const r = isaric4cMortality({ ...base, age: 1300 });
  assert.equal(r.valid, false);
  assert.match(r.message, /age in years must be between 0 and 130/);
  assert.match(isaric4cMortality({ ...base, age: '' }).message, /^Enter age/);
  assert.equal(isaric4cMortality({ ...base, age: 120 }).valid, true);
});

test('spec-v1743: an entered GCS outside 3-15 is told its range, not asked for again', () => {
  const r = isaric4cMortality({ ...base, gcs: 20 });
  assert.equal(r.valid, false);
  assert.match(r.message, /GCS must be between 3 and 15/);
  assert.equal(isaric4cMortality({ ...base, gcs: 15 }).valid, true);
});

test('spec-v1748: an impossible urea is refused in the unit it was entered in', () => {
  assert.match(isaric4cMortality({ ...base, urea: 10000000 }).message, /mmol\/L/);
  assert.match(isaric4cMortality({ ...base, urea: 10000000, ureaUnit: 'bun-mgdl' }).message, /BUN 1 to 310 mg\/dL/); // spec-v1765: bound widened (source in lib/bounds.js)
  assert.equal(isaric4cMortality({ ...base, urea: 40, ureaUnit: 'bun-mgdl' }).valid, true);
});

test('spec-v1755: a fractional comorbidity count is refused; whole counts and the worked example answer', () => {
  const r = isaric4cMortality({ ...base, comorbidities: 2.5 });
  assert.equal(r.valid, false);
  assert.match(r.message, /whole number/);
  assert.equal(isaric4cMortality({ ...base, comorbidities: 3 }).valid, true);
  assert.equal(isaric4cMortality(base).total, 8);
});
