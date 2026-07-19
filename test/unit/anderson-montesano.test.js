// spec-v447: Anderson-Montesano occipital condyle fracture classification (types I-III).
// Worked-example tests: each type and its morphology description, numeric input, and the invalid-type guard.
// Types transcribed from Anderson & Montesano 1988 (Spine) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { andersonMontesano } from '../../lib/anderson-montesano-v447.js';

test('type III: alar-ligament avulsion (the META example)', () => {
  const r = andersonMontesano({ type: 'III' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'III');
  assert.match(r.band, /avulsion fracture of the occipital condyle at the alar ligament/);
});

test('type I: impacted, comminuted, typically stable', () => {
  const r = andersonMontesano({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /impacted, comminuted/);
});

test('type II: extending from a basioccipital / skull-base fracture', () => {
  assert.match(andersonMontesano({ type: 'II' }).band, /basioccipital \/ skull-base fracture/);
});

test('numeric input maps to the types', () => {
  assert.equal(andersonMontesano({ type: 1 }).type, 'I');
  assert.equal(andersonMontesano({ type: 3 }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(andersonMontesano({}).valid, false);
  assert.equal(andersonMontesano({ type: 'IV' }).valid, false);
  assert.equal(andersonMontesano({ type: '0' }).valid, false);
});
