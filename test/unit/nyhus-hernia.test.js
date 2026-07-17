// spec-v400: Nyhus classification of groin hernias (types I/II/IIIa/IIIb/IIIc/IVa/IVb/IVc/IVd).
// Worked-example tests: representative types and their anatomic descriptions, roman + numeric + subtype
// input, the ambiguous-bare-III/IV guard, and the invalid-type guard. Types transcribed from Nyhus
// 1991/2004 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nyhusHernia } from '../../lib/nyhus-hernia-v400.js';

test('type IIIa: direct inguinal hernia (the META example)', () => {
  const r = nyhusHernia({ type: 'IIIa' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'IIIa');
  assert.match(r.band, /direct inguinal hernia/);
});

test('type I vs II: normal vs dilated internal ring, posterior wall intact', () => {
  const one = nyhusHernia({ type: 'I' });
  assert.equal(one.type, 'I');
  assert.match(one.band, /normal internal ring/);
  const two = nyhusHernia({ type: 'II' });
  assert.equal(two.type, 'II');
  assert.match(two.band, /dilated \/ enlarged internal ring/);
});

test('type IIIc: femoral hernia', () => {
  const r = nyhusHernia({ type: 'IIIc' });
  assert.equal(r.type, 'IIIc');
  assert.match(r.band, /femoral hernia/);
});

test('type IV subtypes: recurrent direct / indirect / femoral / combined', () => {
  assert.match(nyhusHernia({ type: 'IVa' }).band, /recurrent direct/);
  assert.match(nyhusHernia({ type: 'IVb' }).band, /recurrent indirect/);
  assert.match(nyhusHernia({ type: 'IVc' }).band, /recurrent femoral/);
  assert.match(nyhusHernia({ type: 'IVd' }).band, /recurrent combined/);
});

test('numeric and subtype input map to the types', () => {
  assert.equal(nyhusHernia({ type: 2 }).type, 'II');
  assert.equal(nyhusHernia({ type: '3a' }).type, 'IIIa');
  assert.equal(nyhusHernia({ type: '4d' }).type, 'IVd');
});

test('a missing, ambiguous, or out-of-range type is invalid', () => {
  assert.equal(nyhusHernia({}).valid, false);
  assert.equal(nyhusHernia({ type: 'III' }).valid, false);
  assert.equal(nyhusHernia({ type: 'IV' }).valid, false);
  assert.equal(nyhusHernia({ type: 'V' }).valid, false);
});
