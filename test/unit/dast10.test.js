// spec-v57 §2.3: DAST-10 (item 3 reverse-scored).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dast10 } from '../../lib/scoring-v5.js';

test('item 3 reverse: all "no" still scores 1 (from item 3)', () => {
  const r = dast10({ items: [false, false, false, false, false, false, false, false, false, false] });
  assert.equal(r.total, 1); // item 3 "no" -> 1
});
test('two yes + item3 no -> total 3 (moderate)', () => {
  const r = dast10({ items: [true, true, false, false, false, false, false, false, false, false] });
  assert.equal(r.total, 3); assert.match(r.band, /Moderate/);
});
test('item 3 yes scores 0', () => {
  const r = dast10({ items: [true, true, true, false, false, false, false, false, false, false] });
  assert.equal(r.total, 2); assert.match(r.band, /Low/);
});
test('all yes -> 9 (item3 yes=0)', () => {
  const r = dast10({ items: Array(10).fill(true) });
  assert.equal(r.total, 9); assert.match(r.band, /Severe/);
});
test('rejects wrong length', () => {
  assert.throws(() => dast10({ items: [true] }), /array of 10/);
});
