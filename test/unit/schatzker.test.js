// spec-v453: Schatzker tibial plateau fracture classification (types I-VI).
// Worked-example tests: each type and its pattern description, numeric input, and the invalid-type guard.
// Types transcribed from Schatzker 1979 (Clin Orthop Relat Res) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schatzker } from '../../lib/schatzker-v453.js';

test('type II: lateral split-depression (the META example)', () => {
  const r = schatzker({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /lateral tibial plateau split-depression/);
});

test('type I: lateral split, no depression', () => {
  assert.match(schatzker({ type: 'I' }).band, /split \(wedge\) fracture, no depression/);
});

test('type III: lateral pure depression', () => {
  assert.match(schatzker({ type: 'III' }).band, /pure \(central\) depression/);
});

test('type IV: medial plateau', () => {
  assert.match(schatzker({ type: 'IV' }).band, /medial tibial plateau/);
});

test('type V: bicondylar', () => {
  assert.match(schatzker({ type: 'V' }).band, /bicondylar/);
});

test('type VI: metaphyseal-diaphyseal dissociation', () => {
  const r = schatzker({ type: 'VI' });
  assert.equal(r.type, 'VI');
  assert.match(r.band, /metaphyseal-diaphyseal dissociation/);
});

test('numeric input maps to the types', () => {
  assert.equal(schatzker({ type: 1 }).type, 'I');
  assert.equal(schatzker({ type: 6 }).type, 'VI');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(schatzker({}).valid, false);
  assert.equal(schatzker({ type: 'VII' }).valid, false);
  assert.equal(schatzker({ type: '0' }).valid, false);
});
