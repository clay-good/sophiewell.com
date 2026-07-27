// spec-v513: ASRS v1.1 Part A adult ADHD screener.
// Worked-example tests: the per-item thresholds (the whole point of the tile), the cut of 4, the case where
// a high raw total is still a negative screen, and the missing / out-of-range guards. Items and thresholds
// transcribed from Kessler and colleagues 2005 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asrs, ASRS_ITEMS, FREQUENCY_SCALE } from '../../lib/asrs-v513.js';

function answers(list) {
  const o = {};
  list.forEach((n, i) => { o[`q${i + 1}`] = n; });
  return o;
}

test('there are six items on a 0-4 scale, with the published threshold split', () => {
  assert.equal(ASRS_ITEMS.length, 6);
  assert.equal(FREQUENCY_SCALE.length, 5);
  assert.deepEqual(ASRS_ITEMS.map((i) => i.countsAt), [2, 2, 2, 3, 3, 3]);
});

test('five counting answers is a positive screen (the META example)', () => {
  const r = asrs(answers([2, 3, 2, 3, 1, 3]));
  assert.equal(r.valid, true);
  assert.deepEqual(r.counting, [true, true, true, true, false, true]);
  assert.equal(r.countingTotal, 5);
  assert.equal(r.positive, true);
  assert.match(r.band, /5 of 6 items at or above their own threshold, a positive screen/);
});

test('items 1-3 count at 2, items 4-6 only at 3', () => {
  // A 2 on every item: the first three count, the last three do not.
  const twos = asrs(answers([2, 2, 2, 2, 2, 2]));
  assert.deepEqual(twos.counting, [true, true, true, false, false, false]);
  assert.equal(twos.countingTotal, 3);
  assert.equal(twos.positive, false);

  // A 3 on every item: all six count.
  const threes = asrs(answers([3, 3, 3, 3, 3, 3]));
  assert.equal(threes.countingTotal, 6);
  assert.equal(threes.positive, true);
});

test('a high raw total can still be a negative screen', () => {
  // Raw total 12, but only three items reach their own threshold.
  const r = asrs(answers([2, 2, 2, 2, 2, 2]));
  assert.equal(r.rawTotal, 12);
  assert.equal(r.positive, false);
  assert.match(r.band, /below the positive cut of 4/);
});

test('the cut sits at 4 counting items', () => {
  const three = asrs(answers([2, 2, 2, 0, 0, 0]));
  assert.equal(three.countingTotal, 3);
  assert.equal(three.positive, false);

  const four = asrs(answers([2, 2, 2, 3, 0, 0]));
  assert.equal(four.countingTotal, 4);
  assert.equal(four.positive, true);
});

test('the floor is 0 counting items and the ceiling is 6', () => {
  const lo = asrs(answers([0, 0, 0, 0, 0, 0]));
  assert.equal(lo.countingTotal, 0);
  assert.equal(lo.rawTotal, 0);

  const hi = asrs(answers([4, 4, 4, 4, 4, 4]));
  assert.equal(hi.countingTotal, 6);
  assert.equal(hi.rawTotal, 24);
});

test('string answers are accepted', () => {
  assert.equal(asrs(answers(['2', '3', '2', '3', '1', '3'])).countingTotal, 5);
});

test('a missing answer is invalid', () => {
  assert.equal(asrs({}).valid, false);
  const partial = answers([2, 2, 2, 2, 2, 2]);
  delete partial.q4;
  assert.equal(asrs(partial).valid, false);
});

test('out-of-range or non-integer answers are invalid', () => {
  assert.equal(asrs(answers([5, 2, 2, 2, 2, 2])).valid, false);
  assert.equal(asrs(answers([-1, 2, 2, 2, 2, 2])).valid, false);
  assert.equal(asrs(answers([2.5, 2, 2, 2, 2, 2])).valid, false);
  assert.equal(asrs(answers(['x', 2, 2, 2, 2, 2])).valid, false);
});
