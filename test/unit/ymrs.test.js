// spec-v514: Young Mania Rating Scale (YMRS).
// Worked-example tests: the unequal item weights (the point of the tile), the 0-60 range, the double-weighted
// subtotal, the remission convention at 12, and the per-item range guards. Items and weights transcribed from
// Young and colleagues 1978 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ymrs, YMRS_ITEMS } from '../../lib/ymrs-v514.js';

function rate(list) {
  const o = {};
  list.forEach((n, i) => { o[`q${i + 1}`] = n; });
  return o;
}
const ZEROS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

test('eleven items, four of them double-weighted', () => {
  assert.equal(YMRS_ITEMS.length, 11);
  assert.deepEqual(YMRS_ITEMS.map((i) => i.max), [4, 4, 4, 4, 8, 8, 4, 8, 8, 4, 4]);
  assert.equal(YMRS_ITEMS.filter((i) => i.max === 8).length, 4);
  assert.equal(YMRS_ITEMS.reduce((a, i) => a + i.max, 0), 60);
});

test('a moderate presentation scores 24 (the META example)', () => {
  const r = ymrs(rate([3, 3, 1, 3, 4, 4, 2, 2, 0, 1, 1]));
  assert.equal(r.valid, true);
  assert.equal(r.total, 24);
  assert.equal(r.doubleWeighted, 10); // items 5, 6, 8, 9
  assert.equal(r.inRemissionRange, false);
  assert.match(r.band, /YMRS total 24 of 60/);
});

test('the floor is 0 and the ceiling is 60', () => {
  const lo = ymrs(rate(ZEROS));
  assert.equal(lo.total, 0);
  assert.equal(lo.inRemissionRange, true);

  const hi = ymrs(rate([4, 4, 4, 4, 8, 8, 4, 8, 8, 4, 4]));
  assert.equal(hi.total, 60);
  assert.equal(hi.doubleWeighted, 32);
});

test('the double-weighted items reach 8 and the others stop at 4', () => {
  const eights = [...ZEROS];
  eights[4] = 8; eights[5] = 8; eights[7] = 8; eights[8] = 8;
  const r = ymrs(rate(eights));
  assert.equal(r.total, 32);
  assert.equal(r.doubleWeighted, 32);

  // A 5 on a 0-4 item is out of range even though 5 is a legal rating elsewhere on the scale.
  const overshoot = [...ZEROS];
  overshoot[0] = 5;
  assert.equal(ymrs(rate(overshoot)).valid, false);
});

test('the remission convention sits at 12', () => {
  const twelve = [...ZEROS];
  twelve[0] = 4; twelve[1] = 4; twelve[2] = 4;
  const at = ymrs(rate(twelve));
  assert.equal(at.total, 12);
  assert.equal(at.inRemissionRange, true);
  assert.match(at.band, /at or below the total of 12/);

  const thirteen = [...twelve];
  thirteen[4] = 1;
  const above = ymrs(rate(thirteen));
  assert.equal(above.total, 13);
  assert.equal(above.inRemissionRange, false);
  assert.match(above.band, /above the total of 12/);
});

test('string ratings are accepted', () => {
  assert.equal(ymrs(rate(['3', '3', '1', '3', '4', '4', '2', '2', '0', '1', '1'])).total, 24);
});

test('a missing rating is invalid', () => {
  assert.equal(ymrs({}).valid, false);
  const partial = rate(ZEROS);
  delete partial.q11;
  assert.equal(ymrs(partial).valid, false);
});

test('negative or non-integer ratings are invalid', () => {
  const bad = (i, v) => { const l = [...ZEROS]; l[i] = v; return ymrs(rate(l)).valid; };
  assert.equal(bad(0, -1), false);
  assert.equal(bad(4, 9), false);
  assert.equal(bad(4, 2.5), false);
  assert.equal(bad(2, 'x'), false);
});
