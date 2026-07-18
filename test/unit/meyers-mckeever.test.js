// spec-v408: Meyers-McKeever classification of tibial eminence fractures (types I/II/III/IV).
// Worked-example tests: each type and its displacement description, roman + numeric input, and the
// invalid-type guard. Types transcribed from Meyers-McKeever 1959 (+ Zaricznyj 1977 type IV) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meyersMckeever } from '../../lib/meyers-mckeever-v408.js';

test('type II: anterior beak, hinged posteriorly (the META example)', () => {
  const r = meyersMckeever({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /producing a beak/);
  assert.match(r.band, /hinged posteriorly/);
});

test('type I: minimally / non-displaced', () => {
  const r = meyersMckeever({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /minimally displaced or non-displaced/);
});

test('type III vs IV: completely displaced vs comminuted', () => {
  const three = meyersMckeever({ type: 'III' });
  assert.equal(three.type, 'III');
  assert.match(three.band, /completely separated \/ displaced/);
  const four = meyersMckeever({ type: 'IV' });
  assert.equal(four.type, 'IV');
  assert.match(four.band, /comminuted/);
});

test('numeric input maps to the types', () => {
  assert.equal(meyersMckeever({ type: 1 }).type, 'I');
  assert.equal(meyersMckeever({ type: 4 }).type, 'IV');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(meyersMckeever({}).valid, false);
  assert.equal(meyersMckeever({ type: 'V' }).valid, false);
  assert.equal(meyersMckeever({ type: '0' }).valid, false);
});
