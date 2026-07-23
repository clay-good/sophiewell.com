// spec-v499: Dorr classification of proximal femoral morphology (types A, B, C).
// Worked-example tests: each type, the canal-to-calcar ratio cut points, alias input, invalid-type guard.
// Types transcribed from Dorr and colleagues 1993 (Bone) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dorrFemur } from '../../lib/dorr-femur-v499.js';

test('type B: intermediate (the META example)', () => {
  const r = dorrFemur({ type: 'B' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'B');
  assert.match(r.band, /canal-to-calcar ratio of 0\.5 to 0\.75/);
});

test('type A: the champagne-flute femur', () => {
  assert.match(dorrFemur({ type: 'A' }).band, /champagne-flute femur/);
  assert.match(dorrFemur({ type: 'A' }).band, /below 0\.5/);
});

test('type C: the stovepipe femur', () => {
  const r = dorrFemur({ type: 'C' });
  assert.equal(r.type, 'C');
  assert.match(r.band, /stovepipe femur/);
  assert.match(r.band, /above 0\.75/);
});

test('the types run from thick cortices to extensive cortical loss', () => {
  assert.match(dorrFemur({ type: 'A' }).band, /thick medial and posterior cortices/);
  assert.match(dorrFemur({ type: 'C' }).band, /extensive loss of the medial and posterior cortices/);
});

test('lowercase and numeric aliases map to the canonical types', () => {
  assert.equal(dorrFemur({ type: 'c' }).type, 'C');
  assert.equal(dorrFemur({ type: 1 }).type, 'A');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(dorrFemur({}).valid, false);
  assert.equal(dorrFemur({ type: 'D' }).valid, false);
  assert.equal(dorrFemur({ type: '0' }).valid, false);
});
