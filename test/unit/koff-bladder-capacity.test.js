// spec-v140 2.5: Koff expected bladder capacity (Koff 1983). EBC (mL) = (age + 2) x 30.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { koffBladderCapacity } from '../../lib/peds-v140.js';

test('age 4 -> (4 + 2) x 30 = 180 mL', () => {
  const r = koffBladderCapacity({ age: 4 });
  assert.equal(r.valid, true);
  assert.equal(r.capacity, 180);
  assert.match(r.band, /180 mL/);
});

test('age 2 -> 120 mL; age 8 -> 300 mL', () => {
  assert.equal(koffBladderCapacity({ age: 2 }).capacity, 120);
  assert.equal(koffBladderCapacity({ age: 8 }).capacity, 300);
});

test('out-of-range age still computes but flags the validated range', () => {
  const r = koffBladderCapacity({ age: 15 });
  assert.equal(r.capacity, 510);
  assert.match(r.band, /1 to 12 years/);
});

test('negative age -> valid:false', () => {
  assert.equal(koffBladderCapacity({ age: -1 }).valid, false);
});

test('missing age -> valid:false', () => {
  assert.equal(koffBladderCapacity({}).valid, false);
  assert.equal(koffBladderCapacity(0).valid, false);
});
