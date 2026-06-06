// spec-v58 §2.3: Silverman-Andersen respiratory severity.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { silvermanAndersen } from '../../lib/scoring-v6.js';

const mk = (v) => ({ chestMovement: v, intercostal: v, xiphoid: v, naresDilatation: v, grunt: v });
test('example: all 1 -> total 5, moderate', () => {
  const r = silvermanAndersen(mk(1));
  assert.equal(r.total, 5);
  assert.match(r.band, /moderate/i);
});
test('0 -> none; 2 each (10) -> severe', () => {
  assert.match(silvermanAndersen(mk(0)).band, /No respiratory distress/);
  assert.match(silvermanAndersen(mk(2)).band, /Severe/);
});
test('out-of-range item throws', () => {
  assert.throws(() => silvermanAndersen(mk(3)));
});
