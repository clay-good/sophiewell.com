// spec-v735: Kessler K6 psychological distress scale.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { k6 } from '../../lib/k6-v735.js';

const all = (v) => ({ q1: v, q2: v, q3: v, q4: v, q5: v, q6: v });

test('all fours -> 24, serious', () => {
  const r = k6(all('4'));
  assert.equal(r.valid, true);
  assert.equal(r.score, 24);
  assert.equal(r.tier, 'serious');
  assert.equal(r.abnormal, true);
});

test('worked example: total 13 -> serious (band edge)', () => {
  const r = k6({ q1: '3', q2: '3', q3: '3', q4: '2', q5: '1', q6: '1' }); // 13
  assert.equal(r.score, 13);
  assert.equal(r.tier, 'serious');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /K6 13 of 24 /);
});

test('the 13 cut: 12 mild-moderate, 13 serious', () => {
  const twelve = k6({ q1: '2', q2: '2', q3: '2', q4: '2', q5: '2', q6: '2' }); // 12
  assert.equal(twelve.score, 12);
  assert.equal(twelve.tier, 'mild-moderate');
  assert.equal(twelve.abnormal, false);
  const thirteen = k6({ q1: '3', q2: '2', q3: '2', q4: '2', q5: '2', q6: '2' }); // 13
  assert.equal(thirteen.tier, 'serious');
  assert.equal(thirteen.abnormal, true);
});

test('the 5 cut: 4 low, 5 mild-moderate', () => {
  const four = k6({ q1: '4', q2: '0', q3: '0', q4: '0', q5: '0', q6: '0' }); // 4
  assert.equal(four.tier, 'low');
  const five = k6({ q1: '4', q2: '1', q3: '0', q4: '0', q5: '0', q6: '0' }); // 5
  assert.equal(five.tier, 'mild-moderate');
});

test('all zeros -> 0, low', () => {
  const r = k6(all('0'));
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'low');
  assert.equal(r.abnormal, false);
});

test('items require an integer 0-4; all required', () => {
  assert.equal(k6({}).valid, false);
  assert.equal(k6({}).code, 'MISSING_INPUT');
  assert.equal(k6({ ...all('2'), q6: '5' }).valid, false);
  assert.equal(k6({ ...all('2'), q6: '' }).field, 'q6');
});
