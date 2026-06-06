// spec-v55 §2.6: estimated average glucose from A1c (ADAG, Nathan 2008).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eagA1c } from '../../lib/clinical-v6.js';

test('eag A1c 6.0% -> 126 mg/dL (published ADAG value, .5 boundary)', () => {
  const r = eagA1c({ a1c: 6 });
  assert.equal(r.eagMgDl, 126);
  assert.equal(r.eagMmolL, 7.0);
});

test('eag A1c 7.0% -> 154 mg/dL', () => {
  assert.equal(eagA1c({ a1c: 7 }).eagMgDl, 154);
});

test('eag A1c 5.0% -> 97 mg/dL', () => {
  assert.equal(eagA1c({ a1c: 5 }).eagMgDl, 97);
});

test('eag A1c 9.0% -> 212 mg/dL', () => {
  assert.equal(eagA1c({ a1c: 9 }).eagMgDl, 212);
});

test('eag rejects impossible input', () => {
  assert.throws(() => eagA1c({ a1c: NaN }), /a1c/);
  assert.throws(() => eagA1c({ a1c: 25 }), /a1c/);
});
