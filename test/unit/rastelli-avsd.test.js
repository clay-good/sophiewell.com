// spec-v474: Rastelli complete-AVSD classification (types A/B/C).
// Worked-example tests: each type and its bridging-leaflet description, numeric alias, invalid-type guard.
// Types transcribed from Rastelli 1966 (Mayo Clin Proc) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rastelliAvsd } from '../../lib/rastelli-avsd-v474.js';

test('type A: attached to the septal crest (the META example)', () => {
  const r = rastelliAvsd({ type: 'A' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'A');
  assert.match(r.band, /attached by chordae to the crest of the interventricular septum/);
});

test('type B: RV papillary muscle attachment', () => {
  assert.match(rastelliAvsd({ type: 'B' }).band, /a papillary muscle in the right ventricle/);
});

test('type C: free-floating leaflet', () => {
  const r = rastelliAvsd({ type: 'C' });
  assert.equal(r.type, 'C');
  assert.match(r.band, /free-floating, with no chordal attachment to the septum/);
});

test('numeric alias maps to the types', () => {
  assert.equal(rastelliAvsd({ type: 1 }).type, 'A');
  assert.equal(rastelliAvsd({ type: 3 }).type, 'C');
});

test('lowercase input works', () => {
  assert.equal(rastelliAvsd({ type: 'b' }).type, 'B');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(rastelliAvsd({}).valid, false);
  assert.equal(rastelliAvsd({ type: 'D' }).valid, false);
});
