// spec-v134 2.1: Multiple myeloma ISS (Greipp PR, et al, J Clin Oncol
// 2005;23:3412-3420). Stage I = beta2M < 3.5 AND albumin >= 3.5; Stage III =
// beta2M >= 5.5 (governs over albumin); Stage II = neither. The boundary tests
// pin the 3.5 and 5.5 edges.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { myelomaIss } from '../../lib/onc-v134.js';

test('stage I requires both beta2M < 3.5 and albumin >= 3.5', () => {
  assert.equal(myelomaIss({ b2m: 3.0, albumin: 4.0 }).stage, 'I');
  // low beta2M but low albumin -> not stage I
  assert.equal(myelomaIss({ b2m: 3.0, albumin: 3.4 }).stage, 'II');
});

test('beta2M = 3.5 is no longer stage I (boundary)', () => {
  assert.equal(myelomaIss({ b2m: 3.5, albumin: 4.5 }).stage, 'II');
  assert.equal(myelomaIss({ b2m: 3.49, albumin: 4.5 }).stage, 'I');
});

test('albumin = 3.5 is the stage-I inclusive edge', () => {
  assert.equal(myelomaIss({ b2m: 2.0, albumin: 3.5 }).stage, 'I');
  assert.equal(myelomaIss({ b2m: 2.0, albumin: 3.49 }).stage, 'II');
});

test('beta2M >= 5.5 is stage III whatever the albumin (boundary)', () => {
  assert.equal(myelomaIss({ b2m: 5.5, albumin: 4.5 }).stage, 'III');
  assert.equal(myelomaIss({ b2m: 5.49, albumin: 2.0 }).stage, 'II');
  assert.equal(myelomaIss({ b2m: 8.0, albumin: 4.8 }).stage, 'III');
});

test('blank or non-positive inputs surface the fallback', () => {
  assert.equal(myelomaIss({}).valid, false);
  assert.equal(myelomaIss({ b2m: 4 }).valid, false);
  assert.equal(myelomaIss({ b2m: 0, albumin: 4 }).valid, false);
});
