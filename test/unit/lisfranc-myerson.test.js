// spec-v412: Myerson classification of Lisfranc (tarsometatarsal) injuries (types A/B1/B2/C1/C2).
// Worked-example tests: each type and its incongruity/displacement description, the B/C partial aliases,
// and the invalid-type guard. Types transcribed from Myerson 1986 (Foot Ankle) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lisfrancMyerson } from '../../lib/lisfranc-myerson-v412.js';

test('type B2: partial, lateral (the META example)', () => {
  const r = lisfrancMyerson({ type: 'B2' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'B2');
  assert.match(r.band, /lateral displacement of one or more of the lateral four metatarsals/);
});

test('type A: total incongruity, all five same direction', () => {
  const r = lisfrancMyerson({ type: 'A' });
  assert.equal(r.type, 'A');
  assert.match(r.band, /all five metatarsals displaced in the same direction/);
});

test('type B1: partial, medial first metatarsal', () => {
  const r = lisfrancMyerson({ type: 'B1' });
  assert.equal(r.type, 'B1');
  assert.match(r.band, /medial displacement of the first metatarsal/);
});

test('type C1 and C2: divergent partial and total', () => {
  assert.match(lisfrancMyerson({ type: 'C1' }).band, /divergent, partial/);
  assert.match(lisfrancMyerson({ type: 'C2' }).band, /divergent, total/);
  assert.match(lisfrancMyerson({ type: 'C2' }).band, /all five metatarsals/);
});

test('bare B and C aliases map to the partial patterns', () => {
  assert.equal(lisfrancMyerson({ type: 'b' }).type, 'B1');
  assert.equal(lisfrancMyerson({ type: 'c' }).type, 'C1');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(lisfrancMyerson({}).valid, false);
  assert.equal(lisfrancMyerson({ type: 'D' }).valid, false);
  assert.equal(lisfrancMyerson({ type: 'B3' }).valid, false);
});
