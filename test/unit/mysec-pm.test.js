// spec-v199 2.4: mysecPm worked examples crossing the integer band boundaries.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mysecPm } from '../../lib/myeloid-prognosis-v199.js';

test('low (< 11): age 60, no factors', () => {
  const r = mysecPm({ age: 60 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 9);
  assert.match(r.band, /low risk/);
  assert.equal(r.abnormal, false);
});

test('intermediate-1 (>= 11 to < 14): age 65 + anemia + blasts', () => {
  const r = mysecPm({ age: 65, hb: true, blasts: true });
  assert.equal(r.score, 13.75);
  assert.match(r.band, /intermediate-1/);
});

test('intermediate-2 (>= 14 to < 16): age 70 + anemia + blasts', () => {
  const r = mysecPm({ age: 70, hb: true, blasts: true });
  assert.equal(r.score, 14.5);
  assert.match(r.band, /intermediate-2/);
});

test('high (>= 16): age 80 + anemia + blasts', () => {
  const r = mysecPm({ age: 80, hb: true, blasts: true });
  assert.equal(r.score, 16);
  assert.match(r.band, /high risk/);
});

test('guard: age required', () => {
  assert.equal(mysecPm({}).valid, false);
});
