// spec-v201 2.5: Agile 3+ worked examples spanning the dual cut-points.
// Agile 3+ = 1/(1+e^-logit), logit = -3.92368 + 2.29714*ln(LSM) - 0.00902*plt
// - 0.98633*(ALT/AST) + 1.08636*DM - 0.38581*sex(male=1) + 0.03018*age.
// Coefficients + AAR^-1 = ALT/AST disambiguation spec-v97 cross-verified.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { agile3plus } from '../../lib/hepatology-gibleed-v201.js';

test('rule-in: stiff liver, diabetic -> >= 0.679', () => {
  const r = agile3plus({ lsm: 12, ast: 50, alt: 40, platelets: 180, diabetes: true, sex: 'male', age: 60 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0.868);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /ruled IN/);
});

test('rule-out: soft liver, healthy -> < 0.451', () => {
  const r = agile3plus({ lsm: 5, ast: 25, alt: 30, platelets: 250, diabetes: false, sex: 'female', age: 40 });
  assert.equal(r.score, 0.079);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /ruled OUT/);
});

test('indeterminate: mid-range -> 0.451-0.679', () => {
  const r = agile3plus({ lsm: 9, ast: 45, alt: 40, platelets: 180, diabetes: false, sex: 'male', age: 58 });
  assert.equal(r.score, 0.497);
  assert.match(r.band, /indeterminate/);
});

test('formula matches a hand computation', () => {
  const lsm = 9, ast = 45, alt = 40, plt = 180, age = 58;
  const logit = -3.92368 + 2.29714 * Math.log(lsm) - 0.00902 * plt - 0.98633 * (alt / ast) - 0.38581 + 0.03018 * age;
  const expected = Math.round((1 / (1 + Math.exp(-logit))) * 1000) / 1000;
  assert.equal(agile3plus({ lsm, ast, alt, platelets: plt, diabetes: false, sex: 'male', age }).score, expected);
});

test('non-positive LSM -> complete-the-fields (ln guarded)', () => {
  const r = agile3plus({ lsm: 0, ast: 50, alt: 40, platelets: 180, diabetes: true, sex: 'male', age: 60 });
  assert.equal(r.valid, false);
  assert.match(r.message, /positive/);
});

test('score always within 0..1', () => {
  const r = agile3plus({ lsm: 75, ast: 500, alt: 20, platelets: 30, diabetes: true, sex: 'male', age: 80 });
  assert.ok(r.score >= 0 && r.score <= 1);
});
