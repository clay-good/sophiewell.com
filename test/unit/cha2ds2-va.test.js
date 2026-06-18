// spec-v101 2.2: CHA2DS2-VA (2024 ESC, sex point removed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cha2ds2Va } from '../../lib/cardio-v101.js';

test('blank age -> invalid', () => {
  assert.equal(cha2ds2Va({}).valid, false);
});

test('age 70 alone -> 1, below OAC threshold', () => {
  const r = cha2ds2Va({ age: 70 });
  assert.equal(r.total, 1);
  assert.equal(r.favorsOac, false);
});

test('age 70 + hypertension -> 2, at/above OAC threshold (flip)', () => {
  const r = cha2ds2Va({ age: 70, hypertension: true });
  assert.equal(r.total, 2);
  assert.equal(r.favorsOac, true);
});

test('age >= 75 scores 2 for age band', () => {
  const r = cha2ds2Va({ age: 80 });
  assert.equal(r.total, 2);
});

test('all factors at >= 75 -> max 8 (no sex point)', () => {
  const r = cha2ds2Va({ age: 80, chf: true, hypertension: true, diabetes: true, stroke: true, vascular: true });
  assert.equal(r.total, 8);
});
