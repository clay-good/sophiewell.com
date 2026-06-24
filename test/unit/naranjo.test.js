// spec-v148 2.7: Naranjo ADR probability (Naranjo 1981). 10 weighted yes/no/dk
// questions, -4 to +13. <=0 doubtful, 1-4 possible, 5-8 probable, >=9 definite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { naranjo } from '../../lib/rheum-v148.js';

const all = (v) => ({ q1: v, q2: v, q3: v, q4: v, q5: v, q6: v, q7: v, q8: v, q9: v, q10: v });

test('tile example: total 6 -> probable', () => {
  const r = naranjo({ q1: 'yes', q2: 'yes', q3: 'yes', q4: 'unknown', q5: 'no', q6: 'unknown', q7: 'unknown', q8: 'unknown', q9: 'unknown', q10: 'unknown' });
  assert.equal(r.score, 6);
  assert.equal(r.bandLabel, 'Probable');
});

test('probable -> definite flip at 8 -> 9', () => {
  // q2+2 plus six +1 items (q1,q3,q7,q8,q9,q10) = 8 (probable)
  const eight = { q1: 'yes', q2: 'yes', q3: 'yes', q4: 'unknown', q5: 'unknown', q6: 'unknown', q7: 'yes', q8: 'yes', q9: 'yes', q10: 'yes' };
  assert.equal(naranjo(eight).score, 8);
  assert.equal(naranjo(eight).bandLabel, 'Probable');
  // q6 No adds +1 -> 9 (definite)
  const nine = { ...eight, q6: 'no' };
  assert.equal(naranjo(nine).score, 9);
  assert.equal(naranjo(nine).bandLabel, 'Definite');
});

test('doubtful at <=0 (negatives)', () => {
  // q2 no (-1), q5 yes (-1), rest unknown -> -2 doubtful
  const r = naranjo({ q1: 'unknown', q2: 'no', q3: 'unknown', q4: 'unknown', q5: 'yes', q6: 'unknown', q7: 'unknown', q8: 'unknown', q9: 'unknown', q10: 'unknown' });
  assert.equal(r.score, -2);
  assert.equal(r.bandLabel, 'Doubtful');
});

test('possible 1-4', () => {
  const r = naranjo({ q1: 'yes', q2: 'yes', q3: 'unknown', q4: 'unknown', q5: 'unknown', q6: 'unknown', q7: 'unknown', q8: 'unknown', q9: 'unknown', q10: 'unknown' });
  assert.equal(r.score, 3);
  assert.equal(r.bandLabel, 'Possible');
});

test('minimum -4, maximum 13', () => {
  // min: q2 no -1, q4 no -1, q5 yes -1, q6 yes -1 = -4
  assert.equal(naranjo({ q1: 'unknown', q2: 'no', q3: 'unknown', q4: 'no', q5: 'yes', q6: 'yes', q7: 'unknown', q8: 'unknown', q9: 'unknown', q10: 'unknown' }).score, -4);
  // max: all yes except q5/q6 no -> 1+2+1+2+2+1+1+1+1+1 = 13
  const max = naranjo({ q1: 'yes', q2: 'yes', q3: 'yes', q4: 'yes', q5: 'no', q6: 'no', q7: 'yes', q8: 'yes', q9: 'yes', q10: 'yes' });
  assert.equal(max.score, 13);
  assert.equal(max.bandLabel, 'Definite');
});

test('unanswered question -> complete-the-fields', () => {
  const r = naranjo({ q1: 'yes' });
  assert.equal(r.valid, false);
  assert.match(r.message, /Answer all 10/);
});
