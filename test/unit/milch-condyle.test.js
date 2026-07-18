// spec-v418: Milch classification of lateral humeral condyle fractures (types I/II).
// Worked-example tests: each type and its groove/stability description, numeric input, and the invalid-type
// guard. Types transcribed from Milch 1964 (J Trauma) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { milchCondyle } from '../../lib/milch-condyle-v418.js';

test('type I: lateral to the groove, stable (the META example)', () => {
  const r = milchCondyle({ type: 'I' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'I');
  assert.match(r.band, /lateral to the trochlear groove and does not reach it/);
  assert.match(r.band, /the elbow stays stable/);
});

test('type II: into the groove, unstable', () => {
  const r = milchCondyle({ type: 'II' });
  assert.equal(r.type, 'II');
  assert.match(r.band, /extends medially into the trochlear groove/);
  assert.match(r.band, /the elbow becomes unstable/);
});

test('numeric input maps to the types', () => {
  assert.equal(milchCondyle({ type: 1 }).type, 'I');
  assert.equal(milchCondyle({ type: 2 }).type, 'II');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(milchCondyle({}).valid, false);
  assert.equal(milchCondyle({ type: 'III' }).valid, false);
  assert.equal(milchCondyle({ type: '0' }).valid, false);
});
