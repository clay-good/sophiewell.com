// spec-v785: OLBI (Oldenburg Burnout Inventory).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { olbi, REVERSE_SCORED } from '../../lib/olbi-v785.js';

function fill(answer) {
  const o = {};
  for (let n = 1; n <= 16; n += 1) o[`q${n}`] = answer;
  return o;
}

test('answering every item the same way lands on the midpoint, proving the reverse scoring runs', () => {
  // Each subscale holds four forward and four reverse items, so a straight line of
  // identical answers must cancel to 20 of 32. A naive summer would give 8 or 32.
  for (const a of ['strongly-agree', 'agree', 'disagree', 'strongly-disagree']) {
    const r = olbi(fill(a));
    assert.equal(r.valid, true, a);
    assert.equal(r.exhaustion, 20, a);
    assert.equal(r.disengagement, 20, a);
    assert.equal(r.total, 40, a);
  }
});

test('each subscale really does hold four reverse-scored items', () => {
  const exhaustion = [2, 4, 5, 8, 10, 12, 14, 16];
  const disengagement = [1, 3, 6, 7, 9, 11, 13, 15];
  assert.equal(exhaustion.filter((n) => REVERSE_SCORED.includes(n)).length, 4);
  assert.equal(disengagement.filter((n) => REVERSE_SCORED.includes(n)).length, 4);
});

test('the maximum burnout answer set reaches 32 and 32', () => {
  const o = {};
  for (let n = 1; n <= 16; n += 1) {
    o[`q${n}`] = REVERSE_SCORED.includes(n) ? 'strongly-agree' : 'strongly-disagree';
  }
  const r = olbi(o);
  assert.equal(r.exhaustion, 32);
  assert.equal(r.disengagement, 32);
  assert.equal(r.total, 64);
});

test('the minimum burnout answer set reaches 8 and 8', () => {
  const o = {};
  for (let n = 1; n <= 16; n += 1) {
    o[`q${n}`] = REVERSE_SCORED.includes(n) ? 'strongly-disagree' : 'strongly-agree';
  }
  const r = olbi(o);
  assert.equal(r.exhaustion, 8);
  assert.equal(r.disengagement, 8);
  assert.equal(r.total, 16);
});

test('a forward item and a reverse item move the score in opposite directions', () => {
  const base = fill('agree');
  const forward = olbi({ ...base, q5: 'strongly-disagree' }); // item 5, exhaustion, as worded
  const reverse = olbi({ ...base, q2: 'strongly-disagree' }); // item 2, exhaustion, reversed
  assert.equal(forward.exhaustion, 22);
  assert.equal(reverse.exhaustion, 18);
});

test('items land in the subscale the source assigns them to', () => {
  const base = fill('agree');
  assert.equal(olbi({ ...base, q16: 'strongly-disagree' }).disengagement, 20, 'item 16 is exhaustion');
  assert.equal(olbi({ ...base, q15: 'strongly-disagree' }).exhaustion, 20, 'item 15 is disengagement');
});

test('a missing or unrecognised answer falls back rather than scoring', () => {
  const o = fill('agree');
  delete o.q9;
  assert.equal(olbi(o).field, 'q9');
  assert.equal(olbi({ ...fill('agree'), q3: 'maybe' }).field, 'q3');
  assert.equal(olbi({}).valid, false);
});
