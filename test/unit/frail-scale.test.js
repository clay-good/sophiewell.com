// spec-v143 2.3: FRAIL Scale (Morley 2012). 0 robust / 1-2 pre-frail / >= 3 frail.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { frailScale } from '../../lib/frailty-v143.js';

test('zero items -> robust', () => {
  const r = frailScale({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.category, 'robust');
  assert.equal(r.abnormal, false);
});

test('one to two items -> pre-frail', () => {
  assert.equal(frailScale({ fatigue: 1 }).category, 'pre-frail');
  assert.equal(frailScale({ fatigue: 1, resistance: 1 }).category, 'pre-frail');
});

test('the pre-frail -> frail boundary flips at 3 (2 -> 3)', () => {
  assert.equal(frailScale({ fatigue: 1, resistance: 1 }).abnormal, false);              // 2
  const r = frailScale({ fatigue: 1, resistance: 1, ambulation: 1 });                   // 3
  assert.equal(r.score, 3);
  assert.equal(r.category, 'frail');
  assert.equal(r.abnormal, true);
});

test('all five -> 5, frail', () => {
  const r = frailScale({ fatigue: 1, resistance: 1, ambulation: 1, illnesses: 1, weightLoss: 1 });
  assert.equal(r.score, 5);
  assert.equal(r.category, 'frail');
});
