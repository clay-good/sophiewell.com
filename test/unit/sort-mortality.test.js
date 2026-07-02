// spec-v203 2.1: SORT worked examples spanning a mortality range. logit =
// -7.366 + ASA/urgency/age/specialty/severity/cancer terms; mortality =
// 100/(1+e^-logit). Coefficients spec-v97 cross-verified against the open-access
// development paper (PMC4240514, Table 4) and an independent reproduction.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sort } from '../../lib/periop-frailty-v203.js';

test('high-risk case (worked example)', () => {
  const r = sort({ asa: 'III', urgency: 'urgent', age: 70, highRiskSpecialty: true, majorComplex: true, cancer: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 14.67);
  assert.equal(r.abnormal, true);
});

test('low-risk elective ASA II young -> < 1%', () => {
  const r = sort({ asa: 'II', urgency: 'elective', age: 50 });
  assert.equal(r.score, 0.06);
  assert.equal(r.abnormal, false);
});

test('formula matches the verbatim published coefficients', () => {
  const logit = -7.366 + 1.411 + 1.657 + 0.712 + 0.381 + 0.667 + 0.777;
  const expected = Math.round((1 / (1 + Math.exp(-logit))) * 100 * 100) / 100;
  assert.equal(sort({ asa: 'III', urgency: 'urgent', age: 70, highRiskSpecialty: true, majorComplex: true, cancer: true }).score, expected);
});

test('ASA I/II, elective, age <65 are the reference (0 coefficient)', () => {
  const asa1 = sort({ asa: 'I', urgency: 'elective', age: 40 });
  const asa2 = sort({ asa: 'II', urgency: 'elective', age: 40 });
  assert.equal(asa1.score, asa2.score); // both reference -> identical logit
});

test('age bands step at 65 and 80', () => {
  const base = { asa: 'II', urgency: 'elective' };
  assert.ok(sort({ ...base, age: 64 }).score < sort({ ...base, age: 65 }).score);
  assert.ok(sort({ ...base, age: 79 }).score < sort({ ...base, age: 80 }).score);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = sort({ asa: 'III' });
  assert.equal(r.valid, false);
  assert.match(r.message, /urgency/);
});

test('mortality stays within 0..100%', () => {
  const r = sort({ asa: 'V', urgency: 'immediate', age: 90, highRiskSpecialty: true, majorComplex: true, cancer: true });
  assert.ok(r.score >= 0 && r.score <= 100);
});
