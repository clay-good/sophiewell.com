// spec-v57 §2.10: YEARS algorithm (variable D-dimer threshold).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yearsPe } from '../../lib/scoring-v5.js';

test('0 items, D-dimer 400 < 1000 -> excluded', () => {
  const r = yearsPe({ dDimer: 400 });
  assert.equal(r.itemCount, 0); assert.equal(r.threshold, 1000); assert.equal(r.excluded, true);
});
test('0 items, D-dimer 1200 >= 1000 -> CTPA', () => {
  const r = yearsPe({ dDimer: 1200 });
  assert.equal(r.threshold, 1000); assert.equal(r.excluded, false);
});
test('1 item flips threshold to 500: D-dimer 600 -> CTPA', () => {
  const r = yearsPe({ peMostLikely: true, dDimer: 600 });
  assert.equal(r.itemCount, 1); assert.equal(r.threshold, 500); assert.equal(r.excluded, false);
});
test('1 item, D-dimer 400 < 500 -> excluded', () => {
  const r = yearsPe({ hemoptysis: true, dDimer: 400 });
  assert.equal(r.threshold, 500); assert.equal(r.excluded, true);
});
test('rejects bad D-dimer', () => {
  assert.throws(() => yearsPe({ dDimer: NaN }), /dDimer/);
});
