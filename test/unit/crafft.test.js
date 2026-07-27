// spec-v511: CRAFFT adolescent substance-use screen.
// Worked-example tests: the sum, the cut-point boundary at 2, the floor and ceiling, the accepted answer
// spellings, and the missing / unrecognized-answer guards. Items and cut point transcribed from Knight and
// colleagues 1999 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crafft, CRAFFT_ITEMS } from '../../lib/crafft-v511.js';

function answers(list) {
  const o = {};
  list.forEach((v, i) => { o[`q${i + 1}`] = v; });
  return o;
}

test('there are exactly six items, spelling the mnemonic', () => {
  assert.equal(CRAFFT_ITEMS.length, 6);
  assert.equal(CRAFFT_ITEMS.map((i) => i.letter).join(''), 'CRAFFT');
});

test('three yes answers score 3, a positive screen (the META example)', () => {
  const r = crafft(answers(['yes', 'no', 'yes', 'no', 'yes', 'no']));
  assert.equal(r.valid, true);
  assert.equal(r.total, 3);
  assert.equal(r.positive, true);
  assert.match(r.band, /CRAFFT 3 of 6/);
});

test('the cut point sits at 2', () => {
  const one = crafft(answers(['yes', 'no', 'no', 'no', 'no', 'no']));
  assert.equal(one.total, 1);
  assert.equal(one.positive, false);
  assert.match(one.band, /below the positive cut point/);

  const two = crafft(answers(['yes', 'yes', 'no', 'no', 'no', 'no']));
  assert.equal(two.total, 2);
  assert.equal(two.positive, true);
  assert.match(two.band, /at or above the positive cut point/);
});

test('the floor is 0 and the ceiling is 6', () => {
  const lo = crafft(answers(['no', 'no', 'no', 'no', 'no', 'no']));
  assert.equal(lo.total, 0);
  assert.equal(lo.positive, false);

  const hi = crafft(answers(['yes', 'yes', 'yes', 'yes', 'yes', 'yes']));
  assert.equal(hi.total, 6);
  assert.equal(hi.positive, true);
});

test('booleans and 0/1 are accepted alongside yes/no', () => {
  assert.equal(crafft(answers([true, false, true, false, true, false])).total, 3);
  assert.equal(crafft(answers([1, 0, 1, 0, 1, 0])).total, 3);
  assert.equal(crafft(answers(['1', '0', '1', '0', '1', '0'])).total, 3);
});

test('a missing answer is invalid', () => {
  assert.equal(crafft({}).valid, false);
  const partial = answers(['no', 'no', 'no', 'no', 'no', 'no']);
  delete partial.q6;
  assert.equal(crafft(partial).valid, false);
});

test('an unrecognized answer is invalid', () => {
  assert.equal(crafft(answers(['maybe', 'no', 'no', 'no', 'no', 'no'])).valid, false);
  assert.equal(crafft(answers([2, 'no', 'no', 'no', 'no', 'no'])).valid, false);
});
