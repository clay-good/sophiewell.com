// spec-v177 §2.3: SARC-CalF. SARC-F + calf add-on (+10 if calf < cutoff), >= 11 positive.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sarcCalf } from '../../lib/ltcga-v177.js';

const z = { strength: 0, assistanceWalking: 0, riseFromChair: 0, climbStairs: 0, falls: 0 };

test('Calf below cutoff fires +10; women cutoff 33', () => {
  const below = sarcCalf({ ...z, strength: 1, calfCm: 32, sex: 'female' });
  assert.equal(below.addon, 10);
  assert.equal(below.total, 11);
  assert.equal(below.positive, true);
  const at = sarcCalf({ ...z, strength: 1, calfCm: 33, sex: 'female' });
  assert.equal(at.addon, 0);
  assert.equal(at.total, 1);
});

test('Men cutoff 34', () => {
  assert.equal(sarcCalf({ ...z, calfCm: 33.9, sex: 'male' }).addon, 10);
  assert.equal(sarcCalf({ ...z, calfCm: 34, sex: 'male' }).addon, 0);
});

test('SARC-CalF 10 -> negative, 11 -> positive boundary', () => {
  // SARC-F 1 + add-on 10 = 11 positive; SARC-F 10 + 0 = 10 negative
  assert.equal(sarcCalf({ strength: 2, assistanceWalking: 2, riseFromChair: 2, climbStairs: 2, falls: 2, calfCm: 40, sex: 'male' }).total, 10);
  assert.equal(sarcCalf({ strength: 2, assistanceWalking: 2, riseFromChair: 2, climbStairs: 2, falls: 2, calfCm: 40, sex: 'male' }).positive, false);
});

test('SARC-CalF blank/invalid calf or sex -> complete-the-fields', () => {
  assert.equal(sarcCalf({ ...z, calfCm: 32 }).valid, false);
  assert.equal(sarcCalf({ ...z, sex: 'male' }).valid, false);
  assert.equal(sarcCalf({ ...z, calfCm: 0, sex: 'male' }).valid, false);
});
