// spec-v207 2.4: CART score worked examples. RR/HR/DBP/age banded to 0-57; >20
// = markedly elevated risk. Table spec-v97 cross-verified (PMC3673668 Table 4 /
// Churpek 2012 + max-57 constraint).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cartScore as cart } from '../../lib/resus-trauma-v207.js';

test('high-risk worked example (CART 43)', () => {
  const r = cart({ rr: 27, hr: 145, dbp: 38, age: 72 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 43); // 15 + 13 + 6 + 9
  assert.equal(r.abnormal, true);
  assert.match(r.band, /markedly elevated/);
});

test('all-normal -> 0, below threshold', () => {
  const r = cart({ rr: 18, hr: 80, dbp: 70, age: 50 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('maximum score 57', () => {
  const r = cart({ rr: 35, hr: 150, dbp: 30, age: 80 });
  assert.equal(r.score, 57); // 22 + 13 + 13 + 9
});

test('respiratory-rate bands step correctly', () => {
  const base = { hr: 80, dbp: 70, age: 50 };
  assert.equal(cart({ ...base, rr: 20 }).score, 0);
  assert.equal(cart({ ...base, rr: 22 }).score, 8);
  assert.equal(cart({ ...base, rr: 25 }).score, 12);
  assert.equal(cart({ ...base, rr: 28 }).score, 15);
  assert.equal(cart({ ...base, rr: 30 }).score, 22);
});

test('threshold at > 20', () => {
  // rr 21-23 (8) + hr 110-139 (4) + dbp 40-49 (4) + age 55-69 (4) = 20 -> not > 20
  assert.equal(cart({ rr: 22, hr: 115, dbp: 45, age: 60 }).abnormal, false);
  // add one more RR band -> 24 -> > 20
  assert.equal(cart({ rr: 25, hr: 115, dbp: 45, age: 60 }).abnormal, true);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = cart({ rr: 27, hr: 145 });
  assert.equal(r.valid, false);
});
