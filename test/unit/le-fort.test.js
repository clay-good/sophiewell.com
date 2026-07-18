// spec-v406: Le Fort classification of midface fractures (types I/II/III).
// Worked-example tests: each type and its fracture-level description, roman + numeric input, and the
// invalid-type guard. Types transcribed from Le Fort 1901 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leFort } from '../../lib/le-fort-v406.js';

test('type II: pyramidal floating maxilla (the META example)', () => {
  const r = leFort({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /pyramidal/);
  assert.match(r.band, /floating maxilla/);
});

test('type I: horizontal floating palate (Guerin)', () => {
  const r = leFort({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /floating palate/);
  assert.match(r.band, /Guerin/);
});

test('type III: craniofacial disjunction (floating face)', () => {
  const r = leFort({ type: 'III' });
  assert.equal(r.type, 'III');
  assert.match(r.band, /craniofacial disjunction/);
  assert.match(r.band, /floating face/);
});

test('numeric input maps to the types', () => {
  assert.equal(leFort({ type: 1 }).type, 'I');
  assert.equal(leFort({ type: 3 }).type, 'III');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(leFort({}).valid, false);
  assert.equal(leFort({ type: 'IV' }).valid, false);
  assert.equal(leFort({ type: '0' }).valid, false);
});
