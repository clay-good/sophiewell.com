// spec-v805: AMTS (Abbreviated Mental Test Score).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { amts, QUESTIONS } from '../../lib/amts-v805.js';

function firstN(n) {
  const o = {};
  QUESTIONS.slice(0, n).forEach((q) => { o[q.arg] = true; });
  return o;
}

test('the instrument has exactly ten questions, each worth one point', () => {
  assert.equal(QUESTIONS.length, 10);
  for (const q of QUESTIONS) {
    assert.equal(amts({ [q.arg]: true }).score, 1, q.arg);
  }
});

test('no correct answers -> 0, all correct -> 10', () => {
  assert.equal(amts({}).score, 0);
  assert.equal(amts(firstN(10)).score, 10);
});

test('the TWO cutoffs are reported separately and they disagree', () => {
  const six = amts(firstN(6));
  assert.equal(six.impairedByValidation, true);
  assert.equal(six.impairedByPractice, true);
  assert.equal(six.between, false);

  const eight = amts(firstN(8));
  assert.equal(eight.impairedByValidation, false);
  assert.equal(eight.impairedByPractice, false);
  assert.equal(eight.between, false);
});

test('a score of exactly 7 falls BETWEEN the two rules', () => {
  const r = amts(firstN(7));
  assert.equal(r.score, 7);
  assert.equal(r.impairedByValidation, false, 'not impaired by the 6-or-below rule');
  assert.equal(r.impairedByPractice, true, 'impaired by the under-8 rule');
  assert.equal(r.between, true);
  assert.match(r.band, /between the two rules/);
});

test('the flag follows the more inclusive rule, so a 7 is flagged', () => {
  assert.equal(amts(firstN(7)).abnormal, true);
  assert.equal(amts(firstN(8)).abnormal, false);
});

test('the score counts only correct answers, in any combination', () => {
  const r = amts({ age: true, monarch: true, countBackwards: true });
  assert.equal(r.score, 3);
  assert.equal(r.correct.length, 3);
});
