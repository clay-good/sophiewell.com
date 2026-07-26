// spec-v454: Bado Monteggia fracture classification (types I-IV).
// Worked-example tests: each type and its dislocation/fracture description, numeric input, and the
// invalid-type guard. Types transcribed from Bado 1967 (Clin Orthop Relat Res) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bado } from '../../lib/bado-v454.js';

test('type I: anterior dislocation (the META example)', () => {
  const r = bado({ type: 'I' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'I');
  assert.match(r.band, /anterior dislocation of the radial head/);
  assert.match(r.band, /most common/);
});

test('type II: posterior dislocation', () => {
  assert.match(bado({ type: 'II' }).band, /posterior or posterolateral dislocation/);
});

test('type III: lateral dislocation, ulnar metaphysis', () => {
  const r = bado({ type: 'III' });
  assert.equal(r.type, 'III');
  assert.match(r.band, /ulnar metaphyseal fracture/);
});

test('type IV: both-bone proximal-third fracture', () => {
  assert.match(bado({ type: 'IV' }).band, /both the radius and the ulna/);
});

test('numeric input maps to the types', () => {
  assert.equal(bado({ type: 1 }).type, 'I');
  assert.equal(bado({ type: 4 }).type, 'IV');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(bado({}).valid, false);
  assert.equal(bado({ type: 'V' }).valid, false);
  assert.equal(bado({ type: '0' }).valid, false);
});
