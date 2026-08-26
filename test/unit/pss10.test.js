// spec-v806: PSS-10 (Perceived Stress Scale).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { pss10, REVERSE_SCORED } from '../../lib/pss10-v806.js';

function fill(v) {
  const o = {};
  for (let n = 1; n <= 10; n += 1) o[`q${n}`] = v;
  return o;
}

test('exactly four items are reverse scored, and they are 4, 5, 7 and 8', () => {
  assert.deepEqual(REVERSE_SCORED, [4, 5, 7, 8]);
});

test('answering every item the same way does NOT give a uniform total', () => {
  // Six forward items and four reversed ones, so the totals are asymmetric.
  assert.equal(pss10(fill(0)).score, 16);
  assert.equal(pss10(fill(2)).score, 20);
  assert.equal(pss10(fill(4)).score, 24);
});

test('the true extremes need the reversed items answered the other way', () => {
  const worst = {};
  const best = {};
  for (let n = 1; n <= 10; n += 1) {
    const rev = REVERSE_SCORED.includes(n);
    worst[`q${n}`] = rev ? 0 : 4;
    best[`q${n}`] = rev ? 4 : 0;
  }
  assert.equal(pss10(worst).score, 40);
  assert.equal(pss10(best).score, 0);
});

test('a forward item and a reverse item move the total in opposite directions', () => {
  const base = fill(2);
  assert.equal(pss10({ ...base, q1: 4 }).score, 22, 'item 1 is forward');
  assert.equal(pss10({ ...base, q4: 4 }).score, 18, 'item 4 is reversed');
});

test('no cutoff is applied, so nothing is flagged however high the score', () => {
  const worst = {};
  for (let n = 1; n <= 10; n += 1) worst[`q${n}`] = REVERSE_SCORED.includes(n) ? 0 : 4;
  const r = pss10(worst);
  assert.equal(r.score, 40);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /No cutoff is published/);
});

test('every item is required and bounded to 0 through 4', () => {
  const o = fill(2);
  delete o.q6;
  assert.equal(pss10(o).field, 'q6');
  assert.equal(pss10({ ...fill(2), q3: 5 }).field, 'q3');
  assert.equal(pss10({}).valid, false);
});
