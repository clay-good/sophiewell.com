// spec-v518: Childhood Asthma Control Test (c-ACT).
// Worked-example tests: the two different per-item maxima (child 0-3, caregiver 0-5), the 27 ceiling that
// distinguishes it from the adult ACT's 25, the cut at 19 versus 20, and the missing / out-of-range guards.
// Items and cut point transcribed from Liu and colleagues 2007 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { childhoodAct, CHILD_ITEMS, PARENT_ITEMS } from '../../lib/childhood-act-v518.js';

function score({ c1 = 0, c2 = 0, c3 = 0, c4 = 0, p1 = 0, p2 = 0, p3 = 0 } = {}) {
  return childhoodAct({ c1, c2, c3, c4, p1, p2, p3 });
}

test('four child items scored 0-3 and three caregiver items scored 0-5', () => {
  assert.equal(CHILD_ITEMS.length, 4);
  assert.equal(PARENT_ITEMS.length, 3);
  for (const item of CHILD_ITEMS) assert.equal(item.options.length, 4);
  for (const item of PARENT_ITEMS) assert.equal(item.options.length, 6);
});

test('a partly controlled child scores 17, not well controlled (the META example)', () => {
  const r = score({ c1: 2, c2: 2, c3: 1, c4: 2, p1: 3, p2: 4, p3: 3 });
  assert.equal(r.valid, true);
  assert.equal(r.childTotal, 7);
  assert.equal(r.parentTotal, 10);
  assert.equal(r.total, 17);
  assert.equal(r.controlled, false);
  assert.match(r.band, /Childhood ACT 17 of 27/);
});

test('the ceiling is 27, not the adult ACT 25', () => {
  const hi = score({ c1: 3, c2: 3, c3: 3, c4: 3, p1: 5, p2: 5, p3: 5 });
  assert.equal(hi.childTotal, 12);
  assert.equal(hi.parentTotal, 15);
  assert.equal(hi.total, 27);
  assert.equal(hi.controlled, true);
});

test('the floor is 0, unlike the adult ACT whose floor is 5', () => {
  const lo = score();
  assert.equal(lo.total, 0);
  assert.equal(lo.controlled, false);
});

test('the boundary sits at 19 versus 20', () => {
  const nineteen = score({ c1: 3, c2: 3, c3: 3, c4: 3, p1: 5, p2: 2, p3: 0 });
  assert.equal(nineteen.total, 19);
  assert.equal(nineteen.controlled, false);
  assert.match(nineteen.band, /not well controlled/);

  const twenty = score({ c1: 3, c2: 3, c3: 3, c4: 3, p1: 5, p2: 3, p3: 0 });
  assert.equal(twenty.total, 20);
  assert.equal(twenty.controlled, true);
  assert.match(twenty.band, /well controlled/);
});

test('the two item groups have different maxima', () => {
  // 4 is legal on a caregiver item and out of range on a child item.
  assert.equal(score({ p1: 4 }).valid, true);
  assert.equal(score({ c1: 4 }).valid, false);
  assert.equal(score({ p1: 6 }).valid, false);
});

test('string answers are accepted', () => {
  assert.equal(score({ c1: '2', c2: '2', c3: '1', c4: '2', p1: '3', p2: '4', p3: '3' }).total, 17);
});

test('a missing answer is invalid', () => {
  assert.equal(childhoodAct({}).valid, false);
  assert.equal(childhoodAct({ c1: 0, c2: 0, c3: 0, c4: 0, p1: 0, p2: 0 }).valid, false);
  assert.equal(childhoodAct({ c2: 0, c3: 0, c4: 0, p1: 0, p2: 0, p3: 0 }).valid, false);
});

test('negative or non-integer answers are invalid', () => {
  assert.equal(score({ c1: -1 }).valid, false);
  assert.equal(score({ p1: 2.5 }).valid, false);
  assert.equal(score({ c3: 'x' }).valid, false);
});
