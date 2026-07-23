// spec-v508: Voice Handicap Index-10 (VHI-10).
// Worked-example tests: the sum, the threshold boundary at 11, the floor and ceiling, and the
// missing / out-of-range / non-integer guards. Items and threshold transcribed from Rosen and colleagues
// 2004 (Laryngoscope) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vhi10, VHI10_ITEMS } from '../../lib/vhi10-v508.js';

function answers(list) {
  const o = {};
  list.forEach((n, i) => { o[`v${i + 1}`] = n; });
  return o;
}

test('there are exactly ten items', () => {
  assert.equal(VHI10_ITEMS.length, 10);
});

test('a mixed set sums to 18, above the threshold (the META example)', () => {
  const r = vhi10(answers([2, 2, 2, 2, 1, 3, 2, 2, 1, 1]));
  assert.equal(r.valid, true);
  assert.equal(r.total, 18);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /VHI-10 total 18 of 40/);
});

test('the threshold boundary sits at 11', () => {
  const ten = vhi10(answers([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
  assert.equal(ten.total, 10);
  assert.equal(ten.abnormal, false);
  assert.match(ten.band, /below the commonly cited threshold/);

  const eleven = vhi10(answers([2, 1, 1, 1, 1, 1, 1, 1, 1, 1]));
  assert.equal(eleven.total, 11);
  assert.equal(eleven.abnormal, true);
  assert.match(eleven.band, /at or above the commonly cited threshold/);
});

test('the floor is 0 and the ceiling is 40', () => {
  const lo = vhi10(answers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  assert.equal(lo.total, 0);
  assert.equal(lo.abnormal, false);

  const hi = vhi10(answers([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]));
  assert.equal(hi.total, 40);
  assert.equal(hi.abnormal, true);
});

test('string answers are accepted', () => {
  const r = vhi10(answers(['2', '2', '2', '2', '1', '3', '2', '2', '1', '1']));
  assert.equal(r.total, 18);
});

test('a missing item is invalid', () => {
  assert.equal(vhi10({}).valid, false);
  const partial = answers([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  delete partial.v10;
  assert.equal(vhi10(partial).valid, false);
});

test('out-of-range or non-integer answers are invalid', () => {
  assert.equal(vhi10(answers([5, 1, 1, 1, 1, 1, 1, 1, 1, 1])).valid, false);
  assert.equal(vhi10(answers([-1, 1, 1, 1, 1, 1, 1, 1, 1, 1])).valid, false);
  assert.equal(vhi10(answers([1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1])).valid, false);
  assert.equal(vhi10(answers(['x', 1, 1, 1, 1, 1, 1, 1, 1, 1])).valid, false);
});
