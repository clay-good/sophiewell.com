// spec-v201 2.3: Hepamet Fibrosis Score worked examples, spanning all three
// cut-point bands. Categorical logistic HFS = 1 / (1 + e^E) with the published
// Ampuero 2020 coefficients (spec-v97 cross-verified).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hepamet } from '../../lib/hepatology-gibleed-v201.js';

test('rule-in: high-risk diabetic -> >= 0.47', () => {
  const r = hepamet({ age: 68, sex: 'male', ast: 90, albumin: 3.5, platelets: 120, diabetes: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0.948);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /ruled IN/);
});

test('rule-out: young healthy non-diabetic -> < 0.12', () => {
  const r = hepamet({ age: 35, sex: 'female', ast: 25, albumin: 4.8, platelets: 250, diabetes: false, homa: 1.5 });
  assert.equal(r.score, 0.005);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /ruled OUT/);
});

test('indeterminate: mid-range -> 0.12-0.47', () => {
  const r = hepamet({ age: 50, sex: 'female', ast: 40, albumin: 4.2, platelets: 200, diabetes: false, homa: 3 });
  assert.equal(r.score, 0.154);
  assert.match(r.band, /indeterminate/);
});

test('diabetes term replaces HOMA term (HOMA not required when diabetic)', () => {
  const r = hepamet({ age: 68, sex: 'male', ast: 90, albumin: 3.5, platelets: 120, diabetes: true });
  assert.equal(r.valid, true);
  assert.match(r.detail, /diabetic/);
});

test('non-diabetic without HOMA -> complete-the-fields', () => {
  const r = hepamet({ age: 50, sex: 'female', ast: 40, albumin: 4.2, platelets: 200, diabetes: false });
  assert.equal(r.valid, false);
  assert.match(r.message, /HOMA-IR/);
});

test('score always within 0..1', () => {
  const r = hepamet({ age: 80, sex: 'male', ast: 500, albumin: 2.0, platelets: 40, diabetes: true });
  assert.ok(r.score >= 0 && r.score <= 1);
});
