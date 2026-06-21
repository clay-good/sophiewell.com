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
