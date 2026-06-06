// spec-v57 §2.1: PHQ-2 / GAD-2 ultra-brief screeners.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phq2Gad2 } from '../../lib/scoring-v5.js';

test('both positive at >=3', () => {
  const r = phq2Gad2({ d1: 2, d2: 2, a1: 2, a2: 1 });
  assert.equal(r.phq2, 4); assert.equal(r.gad2, 3);
  assert.equal(r.phqPositive, true); assert.equal(r.gadPositive, true);
});
test('boundary: exactly 3 is positive, 2 is negative', () => {
  const r = phq2Gad2({ d1: 2, d2: 1, a1: 1, a2: 1 });
  assert.equal(r.phq2, 3); assert.equal(r.phqPositive, true);
  assert.equal(r.gad2, 2); assert.equal(r.gadPositive, false);
});
test('all zero', () => {
  const r = phq2Gad2({ d1: 0, d2: 0, a1: 0, a2: 0 });
  assert.equal(r.phq2, 0); assert.equal(r.phqPositive, false);
});
test('rejects out-of-range items', () => {
  assert.throws(() => phq2Gad2({ d1: 4, d2: 0, a1: 0, a2: 0 }), /d1/);
  assert.throws(() => phq2Gad2({ d1: NaN, d2: 0, a1: 0, a2: 0 }), /d1/);
});
