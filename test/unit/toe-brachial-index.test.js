// spec-v167 2.3: toe-brachial index. The 0.70 abnormal boundary is asserted; the
// brachial denominator is guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toeBrachialIndex } from '../../lib/oneformula-v167.js';

test('tile example: toe 50 / brachial 120 → TBI 0.42, abnormal', () => {
  const r = toeBrachialIndex({ toe: 50, brachial: 120 });
  assert.equal(r.valid, true);
  assert.equal(r.tbi, 0.42);
  assert.equal(r.abnormal, true);
});

test('0.70 boundary: 0.69 abnormal, 0.70 not', () => {
  const below = toeBrachialIndex({ toe: 69, brachial: 100 });
  assert.equal(below.tbi, 0.69);
  assert.equal(below.abnormal, true);
  const at = toeBrachialIndex({ toe: 70, brachial: 100 });
  assert.equal(at.tbi, 0.7);
  assert.equal(at.abnormal, false);
});

test('normal TBI', () => {
  const r = toeBrachialIndex({ toe: 100, brachial: 120 });
  assert.equal(r.tbi, 0.83);
  assert.equal(r.abnormal, false);
});

test('guards: blank inputs, zero brachial', () => {
  assert.equal(toeBrachialIndex({ toe: 50 }).valid, false);
  assert.equal(toeBrachialIndex({ toe: 50, brachial: 0 }).valid, false);
  assert.equal(toeBrachialIndex({}).valid, false);
});
