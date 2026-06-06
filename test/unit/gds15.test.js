// spec-v57 §2.4: GDS-15 (mixed scoring direction).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gds15 } from '../../lib/scoring-v5.js';

test('all "no": items 1,5,7,11,13 score -> total 5 (mild)', () => {
  const r = gds15({ items: Array(15).fill(false) });
  assert.equal(r.total, 5); assert.match(r.band, /Mild/);
});
test('checking two yes-scoring items raises to 7', () => {
  const items = Array(15).fill(false); items[1] = true; items[2] = true;
  assert.equal(gds15({ items }).total, 7);
});
test('normal band 0-4: answer the no-scoring items "yes"', () => {
  const items = Array(15).fill(false);
  [0, 4, 6, 10, 12].forEach((i) => { items[i] = true; }); // items 1,5,7,11,13 yes -> 0
  assert.equal(gds15({ items }).total, 0); assert.match(gds15({ items }).band, /Normal/);
});
test('severe at 12-15', () => {
  const items = Array(15).fill(true); // 10 yes-scoring -> 10; no-scoring yes -> 0
  // make the 5 no-scoring "no" to add 5 -> 15
  [0, 4, 6, 10, 12].forEach((i) => { items[i] = false; });
  assert.equal(gds15({ items }).total, 15); assert.match(gds15({ items }).band, /Severe/);
});
test('rejects wrong length', () => {
  assert.throws(() => gds15({ items: [true, false] }), /array of 15/);
});
