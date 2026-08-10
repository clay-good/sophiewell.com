// spec-v685: Free Androgen Index (FAI).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { freeAndrogenIndex } from '../../lib/free-androgen-index-v685.js';

test('worked example: female, T 2.5, SHBG 30 -> FAI 8.3 (elevated)', () => {
  const r = freeAndrogenIndex({ sex: 'female', testosterone: '2.5', shbg: '30' });
  assert.equal(r.valid, true);
  assert.equal(r.fai, 8.3);
  assert.equal(r.tier, 'elevated');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /androgen excess/);
});

test('formula is 100 * T / SHBG', () => {
  const r = freeAndrogenIndex({ sex: 'female', testosterone: '1.2', shbg: '60' });
  assert.equal(r.fai, Math.round(100 * 1.2 / 60 * 10) / 10); // 2.0
  assert.equal(r.fai, 2);
});

test('female band: <= 5 normal, > 5 elevated', () => {
  assert.equal(freeAndrogenIndex({ sex: 'female', testosterone: '1.5', shbg: '30' }).tier, 'normal'); // 5.0
  assert.equal(freeAndrogenIndex({ sex: 'female', testosterone: '1.53', shbg: '30' }).tier, 'elevated'); // 5.1
});

test('male band: <30 low, 30-150 normal, >150 elevated', () => {
  assert.equal(freeAndrogenIndex({ sex: 'male', testosterone: '5', shbg: '40' }).tier, 'low');     // 12.5
  assert.equal(freeAndrogenIndex({ sex: 'male', testosterone: '20', shbg: '40' }).tier, 'normal'); // 50
  assert.equal(freeAndrogenIndex({ sex: 'male', testosterone: '70', shbg: '40' }).tier, 'elevated'); // 175
  assert.equal(freeAndrogenIndex({ sex: 'male', testosterone: '20', shbg: '40' }).fai, 50);
});

test('inputs are validated', () => {
  assert.equal(freeAndrogenIndex({}).valid, false);
  assert.equal(freeAndrogenIndex({}).code, 'MISSING_INPUT');
  assert.equal(freeAndrogenIndex({ sex: 'female', testosterone: '2' }).field, 'shbg');
  assert.equal(freeAndrogenIndex({ sex: 'x', testosterone: '2', shbg: '30' }).field, 'sex');
});
