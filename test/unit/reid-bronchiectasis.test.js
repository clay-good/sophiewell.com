// spec-v450: Reid classification of bronchiectasis (cylindrical/varicose/cystic).
// Worked-example tests: each type and its morphology, alias input, and the invalid-type guard.
// Types transcribed from Reid 1950 (Thorax) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reidBronchiectasis } from '../../lib/reid-bronchiectasis-v450.js';

test('varicose: beaded outline (the META example)', () => {
  const r = reidBronchiectasis({ type: 'varicose' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'varicose');
  assert.match(r.band, /irregular, beaded outline/);
});

test('cylindrical: uniform, regular outline', () => {
  const r = reidBronchiectasis({ type: 'cylindrical' });
  assert.equal(r.type, 'cylindrical');
  assert.match(r.band, /uniformly dilated with a regular outline/);
});

test('cystic: large cyst-like dilatations', () => {
  const r = reidBronchiectasis({ type: 'cystic' });
  assert.equal(r.type, 'cystic');
  assert.match(r.band, /large cyst-like/);
});

test('aliases: tubular/saccular and numbers map to the types', () => {
  assert.equal(reidBronchiectasis({ type: 'tubular' }).type, 'cylindrical');
  assert.equal(reidBronchiectasis({ type: 'saccular' }).type, 'cystic');
  assert.equal(reidBronchiectasis({ type: '2' }).type, 'varicose');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(reidBronchiectasis({}).valid, false);
  assert.equal(reidBronchiectasis({ type: 'tram-track' }).valid, false);
});
