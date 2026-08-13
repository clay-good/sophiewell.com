// spec-v710: G8 (Geriatric 8) screening tool.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { g8Geriatric } from '../../lib/g8-geriatric-v710.js';

const MAX = { foodIntake: '2', weightLoss: '3', mobility: '2', neuropsych: '2', bmi: '3', medications: '1', selfHealth: '2', age: '2' };

test('maximum is 17 -> negative screen', () => {
  const r = g8Geriatric(MAX);
  assert.equal(r.valid, true);
  assert.equal(r.score, 17);
  assert.equal(r.tier, 'not-refer');
  assert.equal(r.abnormal, false);
});

test('worked example sums to 13 -> positive screen (refer)', () => {
  const r = g8Geriatric({ foodIntake: '1', weightLoss: '2', mobility: '2', neuropsych: '2', bmi: '2', medications: '1', selfHealth: '1', age: '2' });
  assert.equal(r.score, 13);
  assert.equal(r.tier, 'refer');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /G8 13 of 17/);
});

test('the 14 cut-point: 14 positive, 15 negative', () => {
  // 14 = MAX (17) minus 3
  const fourteen = g8Geriatric({ ...MAX, weightLoss: '0' }); // 17 - 3 = 14
  assert.equal(fourteen.score, 14);
  assert.equal(fourteen.tier, 'refer');
  const fifteen = g8Geriatric({ ...MAX, bmi: '1' }); // 17 - 2 = 15
  assert.equal(fifteen.score, 15);
  assert.equal(fifteen.tier, 'not-refer');
});

test('self-rated health allows the half-point value 0.5', () => {
  const r = g8Geriatric({ ...MAX, selfHealth: '0.5' }); // 17 - 1.5 = 15.5
  assert.equal(r.score, 15.5);
  assert.equal(r.tier, 'not-refer');
});

test('per-item value sets are enforced; required', () => {
  assert.equal(g8Geriatric({}).valid, false);
  assert.equal(g8Geriatric({}).code, 'MISSING_INPUT');
  assert.equal(g8Geriatric({ ...MAX, medications: '2' }).valid, false); // meds only 0/1
  assert.equal(g8Geriatric({ ...MAX, selfHealth: '1.5' }).valid, false); // not an allowed value
});
