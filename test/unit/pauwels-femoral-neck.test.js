// spec-v374: Pauwels classification of a femoral neck fracture (types I-III). Worked-example tests: each
// type and its angle/force description, the high-shear flag on type III, roman + numeric +
// case-insensitive input, and the invalid-type guard. Angles transcribed from Pauwels 1935, cross-
// verified against orthopedic references (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pauwelsFemoralNeck } from '../../lib/pauwels-femoral-neck-v374.js';

test('type III: > 50 degrees, shear dominant, flagged (the META example)', () => {
  const r = pauwelsFemoralNeck({ type: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'III');
  assert.equal(r.highShear, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /greater than 50 degrees/);
  assert.match(r.band, /nonunion/);
});

test('types I-II are not flagged (compression-dominant / intermediate)', () => {
  assert.match(pauwelsFemoralNeck({ type: 'I' }).band, /less than 30 degrees/);
  assert.match(pauwelsFemoralNeck({ type: 'II' }).band, /30 to 50 degrees/);
  for (const t of ['I', 'II']) {
    assert.equal(pauwelsFemoralNeck({ type: t }).highShear, false, t);
  }
});

test('type I is the most stable (compression dominant)', () => {
  assert.match(pauwelsFemoralNeck({ type: 'I' }).band, /compressive forces dominate/);
});

test('numeric and case-insensitive input map to the types', () => {
  assert.equal(pauwelsFemoralNeck({ type: 3 }).type, 'III');
  assert.equal(pauwelsFemoralNeck({ type: '2' }).type, 'II');
  assert.equal(pauwelsFemoralNeck({ type: 'i' }).type, 'I');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(pauwelsFemoralNeck({}).valid, false);
  assert.equal(pauwelsFemoralNeck({ type: 'IV' }).valid, false);
  assert.equal(pauwelsFemoralNeck({ type: '0' }).valid, false);
});
