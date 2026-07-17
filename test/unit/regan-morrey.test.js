// spec-v404: Regan-Morrey classification of coronoid process fractures (types I/II/III).
// Worked-example tests: each type and its height description, roman + numeric + A/B subtype input, and the
// invalid-type guard. Types transcribed from Regan-Morrey 1989 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reganMorrey } from '../../lib/regan-morrey-v404.js';

test('type II: <=50% of the coronoid height (the META example)', () => {
  const r = reganMorrey({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /50% or less of the coronoid height/);
});

test('type I: avulsion of the coronoid tip', () => {
  const r = reganMorrey({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /avulsion fracture of the tip/);
});

test('type III: >50% of the coronoid height', () => {
  const r = reganMorrey({ type: 'III' });
  assert.equal(r.type, 'III');
  assert.match(r.band, /more than 50% of the coronoid height/);
});

test('numeric and A/B subtype input map to the base types', () => {
  assert.equal(reganMorrey({ type: 3 }).type, 'III');
  assert.equal(reganMorrey({ type: 'IIa' }).type, 'II');
  assert.equal(reganMorrey({ type: 'iiib' }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(reganMorrey({}).valid, false);
  assert.equal(reganMorrey({ type: 'IV' }).valid, false);
  assert.equal(reganMorrey({ type: '0' }).valid, false);
});
