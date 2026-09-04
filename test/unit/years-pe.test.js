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
test('a D-dimer that is not there is asked for, not rejected', () => {
  // spec-v1037: NaN here is a result that has not come back, and the reader has
  // to be told which one is missing. A value that IS present and impossible
  // still throws, below.
  const r = yearsPe({ dDimer: NaN });
  assert.equal(r.excluded, null);
  assert.equal(r.incomplete, true);
  assert.match(r.band, /Enter the D-dimer/);
});
test('rejects an impossible D-dimer', () => {
  assert.throws(() => yearsPe({ dDimer: -5 }), /d\sdimer/);
  assert.throws(() => yearsPe({ dDimer: 500000 }), /d\sdimer/);
});
