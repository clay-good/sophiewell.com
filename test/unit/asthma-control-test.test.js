// spec-v516: Asthma Control Test (ACT).
// Worked-example tests: the sum, both band boundaries (20 and 25), the floor of 5 (there is no zero on this
// scale), and the missing / out-of-range guards. Items and bands transcribed from Nathan and colleagues 2004
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asthmaControlTest, ACT_ITEMS } from '../../lib/asthma-control-test-v516.js';

function answers(list) {
  const o = {};
  list.forEach((n, i) => { o[`q${i + 1}`] = n; });
  return o;
}

test('there are five items, each with five anchors', () => {
  assert.equal(ACT_ITEMS.length, 5);
  for (const item of ACT_ITEMS) assert.equal(item.options.length, 5);
});

test('a partly controlled patient scores 17, not well controlled (the META example)', () => {
  const r = asthmaControlTest(answers([4, 3, 3, 3, 4]));
  assert.equal(r.valid, true);
  assert.equal(r.total, 17);
  assert.equal(r.controlled, false);
  assert.match(r.band, /Asthma Control Test 17 of 25/);
  assert.match(r.bandLabel, /Not well controlled/);
});

test('the not-well-controlled boundary sits at 19 versus 20', () => {
  const nineteen = asthmaControlTest(answers([4, 4, 4, 4, 3]));
  assert.equal(nineteen.total, 19);
  assert.equal(nineteen.controlled, false);
  assert.match(nineteen.bandLabel, /Not well controlled/);

  const twenty = asthmaControlTest(answers([4, 4, 4, 4, 4]));
  assert.equal(twenty.total, 20);
  assert.equal(twenty.controlled, true);
  assert.match(twenty.bandLabel, /Well controlled/);
});

test('only a perfect 25 is totally controlled', () => {
  const twentyFour = asthmaControlTest(answers([5, 5, 5, 5, 4]));
  assert.equal(twentyFour.total, 24);
  assert.match(twentyFour.bandLabel, /Well controlled/);

  const twentyFive = asthmaControlTest(answers([5, 5, 5, 5, 5]));
  assert.equal(twentyFive.total, 25);
  assert.match(twentyFive.bandLabel, /Totally controlled/);
});

test('the floor is 5: there is no zero on this scale', () => {
  const lo = asthmaControlTest(answers([1, 1, 1, 1, 1]));
  assert.equal(lo.total, 5);
  assert.equal(lo.controlled, false);
  assert.equal(asthmaControlTest(answers([0, 1, 1, 1, 1])).valid, false);
});

test('string answers are accepted', () => {
  assert.equal(asthmaControlTest(answers(['4', '3', '3', '3', '4'])).total, 17);
});

test('a missing answer is invalid', () => {
  assert.equal(asthmaControlTest({}).valid, false);
  const partial = answers([3, 3, 3, 3, 3]);
  delete partial.q5;
  assert.equal(asthmaControlTest(partial).valid, false);
});

test('out-of-range or non-integer answers are invalid', () => {
  assert.equal(asthmaControlTest(answers([6, 3, 3, 3, 3])).valid, false);
  assert.equal(asthmaControlTest(answers([-1, 3, 3, 3, 3])).valid, false);
  assert.equal(asthmaControlTest(answers([3.5, 3, 3, 3, 3])).valid, false);
  assert.equal(asthmaControlTest(answers(['x', 3, 3, 3, 3])).valid, false);
});
