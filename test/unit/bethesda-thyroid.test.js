// spec-v424: Bethesda System for Reporting Thyroid Cytopathology (categories I-VI).
// Worked-example tests: each category and its meaning, numeric input, and the invalid-category guard.
// Categories transcribed from Cibas & Ali 2017 (Thyroid) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bethesdaThyroid } from '../../lib/bethesda-thyroid-v424.js';

test('category IV: follicular neoplasm (the META example)', () => {
  const r = bethesdaThyroid({ category: 'IV' });
  assert.equal(r.valid, true);
  assert.equal(r.category, 'IV');
  assert.match(r.band, /follicular neoplasm/);
});

test('category II: benign', () => {
  const r = bethesdaThyroid({ category: 'II' });
  assert.equal(r.category, 'II');
  assert.match(r.band, /benign/);
});

test('category III: atypia of undetermined significance', () => {
  assert.match(bethesdaThyroid({ category: 'III' }).band, /atypia of undetermined significance/);
});

test('category VI: malignant', () => {
  const r = bethesdaThyroid({ category: 'VI' });
  assert.equal(r.category, 'VI');
  assert.match(r.band, /malignant/);
});

test('numeric input maps to the categories', () => {
  assert.equal(bethesdaThyroid({ category: 1 }).category, 'I');
  assert.equal(bethesdaThyroid({ category: 5 }).category, 'V');
});

test('a missing or out-of-range category is invalid', () => {
  assert.equal(bethesdaThyroid({}).valid, false);
  assert.equal(bethesdaThyroid({ category: 'VII' }).valid, false);
  assert.equal(bethesdaThyroid({ category: '0' }).valid, false);
});
