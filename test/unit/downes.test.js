// spec-v58 §2.4: Downes score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { downes } from '../../lib/scoring-v6.js';

const mk = (v) => ({ respiratoryRate: v, cyanosis: v, airEntry: v, grunting: v, retractions: v });
test('example: all 1 -> total 5, moderate', () => {
  const r = downes(mk(1));
  assert.equal(r.total, 5);
  assert.match(r.band, /moderate/i);
});
test('3 -> mild boundary; 7+ -> severe', () => {
  assert.match(downes({ respiratoryRate: 2, cyanosis: 1, airEntry: 0, grunting: 0, retractions: 0 }).band, /Mild/);
  assert.match(downes(mk(2)).band, /Severe/);
});
test('out-of-range item throws', () => {
  assert.throws(() => downes(mk(-1)));
});
