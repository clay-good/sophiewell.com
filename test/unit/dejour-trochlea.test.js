// spec-v485: Dejour trochlear dysplasia classification (types A-D).
// Worked-example tests: each type and its trochlear-morphology description, numeric alias, invalid guard.
// Types transcribed from Dejour 2007 (Sports Med Arthrosc Rev) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dejourTrochlea } from '../../lib/dejour-trochlea-v485.js';

test('type B: flat/convex with a spur (the META example)', () => {
  const r = dejourTrochlea({ type: 'B' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'B');
  assert.match(r.band, /a flat or convex trochlea with a supratrochlear spur/);
});

test('type A: shallow but symmetric, low-grade', () => {
  assert.match(dejourTrochlea({ type: 'A' }).band, /shallow but still symmetric, concave trochlea/);
});

test('type C: facet asymmetry without a spur', () => {
  assert.match(dejourTrochlea({ type: 'C' }).band, /facet asymmetry.*without a spur/);
});

test('type D: both B and C features', () => {
  const r = dejourTrochlea({ type: 'D' });
  assert.equal(r.type, 'D');
  assert.match(r.band, /features of both B and C/);
});

test('numeric alias maps to the types', () => {
  assert.equal(dejourTrochlea({ type: 1 }).type, 'A');
  assert.equal(dejourTrochlea({ type: 4 }).type, 'D');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(dejourTrochlea({}).valid, false);
  assert.equal(dejourTrochlea({ type: 'E' }).valid, false);
  assert.equal(dejourTrochlea({ type: '0' }).valid, false);
});
