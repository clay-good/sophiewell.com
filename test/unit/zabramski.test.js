// spec-v442: Zabramski classification of cerebral cavernous malformation (types I-IV).
// Worked-example tests: each type and its MRI description, numeric input, and the invalid-type guard.
// Types transcribed from Zabramski 1994 (J Neurosurg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zabramski } from '../../lib/zabramski-v442.js';

test('type II: popcorn with hemosiderin rim (the META example)', () => {
  const r = zabramski({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /hemosiderin rim/);
});

test('type I: subacute, hyperintense', () => {
  const r = zabramski({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /subacute hemorrhage/);
});

test('type III: chronic, iso- to hypointense', () => {
  assert.match(zabramski({ type: 'III' }).band, /chronic hemorrhage/);
});

test('type IV: punctate microhemorrhages on GRE/SWI', () => {
  const r = zabramski({ type: 'IV' });
  assert.equal(r.type, 'IV');
  assert.match(r.band, /punctate microhemorrhages/);
});

test('numeric input maps to the types', () => {
  assert.equal(zabramski({ type: 1 }).type, 'I');
  assert.equal(zabramski({ type: 4 }).type, 'IV');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(zabramski({}).valid, false);
  assert.equal(zabramski({ type: 'V' }).valid, false);
  assert.equal(zabramski({ type: '0' }).valid, false);
});
