// spec-v515: Simpson-Angus Scale (SAS).
// Worked-example tests: the mean-vs-total distinction (the point of the tile), the threshold at a mean above
// 0.3, the range, rounding, and the missing / out-of-range guards. Items and scale transcribed from Simpson
// and Angus 1970 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simpsonAngus, SAS_ITEMS } from '../../lib/simpson-angus-v515.js';

function rate(list) {
  const o = {};
  list.forEach((n, i) => { o[`q${i + 1}`] = n; });
  return o;
}
const ZEROS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

test('there are exactly ten items', () => {
  assert.equal(SAS_ITEMS.length, 10);
});

test('a mild presentation gives a mean of 0.8 (the META example)', () => {
  const r = simpsonAngus(rate([1, 1, 0, 2, 1, 0, 1, 1, 1, 0]));
  assert.equal(r.valid, true);
  assert.equal(r.total, 8);
  assert.equal(r.mean, 0.8);
  assert.equal(r.aboveThreshold, true);
  assert.match(r.band, /Simpson-Angus mean 0\.80 \(total 8 of 40\)/);
});

test('the mean is the total over ten, not the total', () => {
  const r = simpsonAngus(rate([2, 2, 2, 2, 2, 2, 2, 2, 2, 2]));
  assert.equal(r.total, 20);
  assert.equal(r.mean, 2);
});

test('the threshold is a mean ABOVE 0.3, so exactly 0.3 is not above it', () => {
  const three = [...ZEROS];
  three[0] = 1; three[1] = 1; three[2] = 1;
  const at = simpsonAngus(rate(three));
  assert.equal(at.total, 3);
  assert.equal(at.mean, 0.3);
  assert.equal(at.aboveThreshold, false);
  assert.match(at.band, /at or below the mean of 0\.3/);

  const four = [...three];
  four[3] = 1;
  const above = simpsonAngus(rate(four));
  assert.equal(above.mean, 0.4);
  assert.equal(above.aboveThreshold, true);
  assert.match(above.band, /above the mean of 0\.3/);
});

test('the floor is 0 and the ceiling is 40 (mean 4)', () => {
  const lo = simpsonAngus(rate(ZEROS));
  assert.equal(lo.total, 0);
  assert.equal(lo.mean, 0);
  assert.equal(lo.aboveThreshold, false);

  const hi = simpsonAngus(rate([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]));
  assert.equal(hi.total, 40);
  assert.equal(hi.mean, 4);
});

test('the mean is rounded to two decimals', () => {
  const one = [...ZEROS];
  one[0] = 1;
  assert.equal(simpsonAngus(rate(one)).mean, 0.1);

  const seven = [...ZEROS];
  seven[0] = 3; seven[1] = 2; seven[2] = 2;
  assert.equal(simpsonAngus(rate(seven)).mean, 0.7);
});

test('string ratings are accepted', () => {
  assert.equal(simpsonAngus(rate(['1', '1', '0', '2', '1', '0', '1', '1', '1', '0'])).total, 8);
});

test('a missing rating is invalid', () => {
  assert.equal(simpsonAngus({}).valid, false);
  const partial = rate(ZEROS);
  delete partial.q10;
  assert.equal(simpsonAngus(partial).valid, false);
});

test('out-of-range or non-integer ratings are invalid', () => {
  const bad = (i, v) => { const l = [...ZEROS]; l[i] = v; return simpsonAngus(rate(l)).valid; };
  assert.equal(bad(0, 5), false);
  assert.equal(bad(0, -1), false);
  assert.equal(bad(0, 1.5), false);
  assert.equal(bad(0, 'x'), false);
});
