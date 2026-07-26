// spec-v459: Thompson-Epstein posterior hip dislocation classification (types I-V).
// Worked-example tests: each type and its associated-fracture description, numeric input, invalid-type guard.
// Types transcribed from Thompson & Epstein 1951 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { thompsonEpstein } from '../../lib/thompson-epstein-v459.js';

test('type II: single large rim fracture (the META example)', () => {
  const r = thompsonEpstein({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /single large fracture of the posterior acetabular rim/);
});

test('type I: no or minor rim fracture', () => {
  assert.match(thompsonEpstein({ type: 'I' }).band, /no fracture or only a minor fracture/);
});

test('type III: comminuted rim fracture', () => {
  assert.match(thompsonEpstein({ type: 'III' }).band, /comminuted fracture of the posterior acetabular rim/);
});

test('type IV: acetabular rim and floor fracture', () => {
  assert.match(thompsonEpstein({ type: 'IV' }).band, /rim and floor/);
});

test('type V: femoral-head fracture', () => {
  const r = thompsonEpstein({ type: 'V' });
  assert.equal(r.type, 'V');
  assert.match(r.band, /fracture of the femoral head/);
});

test('numeric input maps to the types', () => {
  assert.equal(thompsonEpstein({ type: 1 }).type, 'I');
  assert.equal(thompsonEpstein({ type: 5 }).type, 'V');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(thompsonEpstein({}).valid, false);
  assert.equal(thompsonEpstein({ type: 'VI' }).valid, false);
  assert.equal(thompsonEpstein({ type: '0' }).valid, false);
});
