// spec-v525: Cornell Assessment of Pediatric Delirium (CAPD).
// Worked-example tests: the REVERSED anchors between items 1-4 and 5-8 (the point of the tile), the cut at
// 9, the range, and the missing / out-of-range guards. Items and scoring transcribed from Traube and
// colleagues 2014 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capd, CAPD_ITEMS } from '../../lib/capd-v525.js';

function score(o = {}) {
  const args = {};
  for (const item of CAPD_ITEMS) args[item.key] = o[item.key] === undefined ? 0 : o[item.key];
  return capd(args);
}
const answerOf = (i, text) => CAPD_ITEMS[i].options.find((o) => o.text.endsWith(text)).value;

test('there are eight items, the first four reversed against the last four', () => {
  assert.equal(CAPD_ITEMS.length, 8);
  assert.deepEqual(CAPD_ITEMS.map((i) => i.reversed), [true, true, true, true, false, false, false, false]);
  for (const item of CAPD_ITEMS) assert.equal(item.options.length, 5);
});

test('the anchors run opposite ways in the two halves', () => {
  // "never" is the WORST answer on items 1-4 and the BEST answer on items 5-8.
  assert.equal(answerOf(0, 'never'), '4');
  assert.equal(answerOf(0, 'always'), '0');
  assert.equal(answerOf(4, 'never'), '0');
  assert.equal(answerOf(4, 'always'), '4');
});

test('a delirious child scores 12, a positive screen (the META example)', () => {
  const r = score({ q1: 2, q2: 2, q3: 1, q4: 2, q5: 2, q6: 1, q7: 0, q8: 2 });
  assert.equal(r.valid, true);
  assert.equal(r.total, 12);
  assert.equal(r.positive, true);
  assert.match(r.band, /CAPD total 12 of 32: at or above the positive cut of 9/);
});

test('a well child answering through the real anchors scores 0', () => {
  // Always makes eye contact / purposeful / aware / communicates, and never restless / inconsolable /
  // underactive / slow. Through each item's own anchors that is 0 on all eight.
  const args = {};
  CAPD_ITEMS.forEach((item, i) => {
    args[item.key] = answerOf(i, item.reversed ? 'always' : 'never');
  });
  const r = capd(args);
  assert.equal(r.total, 0);
  assert.equal(r.positive, false);
});

test('the same child scored with one shared anchor direction would flip the result', () => {
  // Reading "always" as 4 on every item (the mistake) turns the well child above into a 16.
  const wrong = score({ q1: 4, q2: 4, q3: 4, q4: 4, q5: 0, q6: 0, q7: 0, q8: 0 });
  assert.equal(wrong.total, 16);
  assert.equal(wrong.positive, true);
});

test('the positive cut sits at 9', () => {
  const eight = score({ q1: 4, q2: 4 });
  assert.equal(eight.total, 8);
  assert.equal(eight.positive, false);
  assert.match(eight.band, /below the positive cut of 9/);

  const nine = score({ q1: 4, q2: 4, q3: 1 });
  assert.equal(nine.total, 9);
  assert.equal(nine.positive, true);
});

test('the floor is 0 and the ceiling is 32', () => {
  assert.equal(score().total, 0);
  const hi = score({ q1: 4, q2: 4, q3: 4, q4: 4, q5: 4, q6: 4, q7: 4, q8: 4 });
  assert.equal(hi.total, 32);
  assert.equal(hi.positive, true);
});

test('string answers are accepted', () => {
  assert.equal(score({ q1: '2', q2: '2', q3: '1', q4: '2', q5: '2', q6: '1', q7: '0', q8: '2' }).total, 12);
});

test('a missing answer is invalid, and the message names the reversed anchors', () => {
  assert.equal(capd({}).valid, false);
  assert.match(capd({}).message, /items 1 to 4 never scores 4/);
  assert.equal(capd({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0, q7: 0 }).valid, false);
});

test('out-of-range or non-integer answers are invalid', () => {
  assert.equal(score({ q1: 5 }).valid, false);
  assert.equal(score({ q1: -1 }).valid, false);
  assert.equal(score({ q5: 2.5 }).valid, false);
  assert.equal(score({ q8: 'x' }).valid, false);
});
