// spec-v176 §2.2: 30-Second Chair Stand vs CDC STEADI below-average age/sex norm.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chairStand30s } from '../../lib/ltcga-v176.js';

test('Chair stand below-norm flip at a band edge (women 75-79, cut-point 10)', () => {
  const below = chairStand30s({ stands: 9, age: 75, sex: 'female' });
  assert.equal(below.valid, true);
  assert.equal(below.threshold, 10);
  assert.equal(below.belowAverage, true);
  const at = chairStand30s({ stands: 10, age: 75, sex: 'female' });
  assert.equal(at.belowAverage, false);
});

test('Chair stand men 60-64 cut-point 14', () => {
  assert.equal(chairStand30s({ stands: 13, age: 62, sex: 'male' }).belowAverage, true);
  assert.equal(chairStand30s({ stands: 14, age: 62, sex: 'male' }).belowAverage, false);
});

test('Chair stand women 90-94 cut-point 4', () => {
  assert.equal(chairStand30s({ stands: 3, age: 92, sex: 'female' }).threshold, 4);
  assert.equal(chairStand30s({ stands: 3, age: 92, sex: 'female' }).belowAverage, true);
});

test('Chair stand outside the 60-94 norm range -> valid:false (no guessed band)', () => {
  assert.equal(chairStand30s({ stands: 10, age: 55, sex: 'female' }).valid, false);
  assert.equal(chairStand30s({ stands: 10, age: 99, sex: 'male' }).valid, false);
});

test('Chair stand blank inputs -> complete-the-fields fallback', () => {
  assert.equal(chairStand30s({ stands: 10, age: 75 }).valid, false);
  assert.equal(chairStand30s({ age: 75, sex: 'female' }).valid, false);
  assert.equal(chairStand30s({}).valid, false);
});
