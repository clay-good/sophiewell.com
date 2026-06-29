// spec-v177 §2.2: SARC-F sarcopenia screen. 5 items 0-2, total 0-10, >= 4 positive.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sarcF } from '../../lib/ltcga-v177.js';

const z = { strength: 0, assistanceWalking: 0, riseFromChair: 0, climbStairs: 0, falls: 0 };

test('SARC-F 0/10 -> negative', () => {
  const r = sarcF(z);
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.positive, false);
});

test('SARC-F 3 -> negative, 4 -> positive (the >= 4 cut flip)', () => {
  assert.equal(sarcF({ ...z, strength: 1, assistanceWalking: 1, riseFromChair: 1 }).positive, false);
  const four = sarcF({ ...z, strength: 1, assistanceWalking: 1, riseFromChair: 1, climbStairs: 1 });
  assert.equal(four.total, 4);
  assert.equal(four.positive, true);
});

test('SARC-F 10/10 (all unable) -> positive', () => {
  const r = sarcF({ strength: 2, assistanceWalking: 2, riseFromChair: 2, climbStairs: 2, falls: 2 });
  assert.equal(r.total, 10);
  assert.equal(r.positive, true);
});

test('SARC-F rejects out-of-range and blank', () => {
  assert.equal(sarcF({ ...z, strength: 3 }).valid, false);
  assert.equal(sarcF({ ...z, strength: '' }).valid, false);
  assert.equal(sarcF({}).valid, false);
});
