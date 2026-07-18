// spec-v410: Anderson-D'Alonzo classification of odontoid (dens) fractures (types I/II/III).
// Worked-example tests: each type and its level description, roman + numeric input, the IIA->II subtype,
// and the invalid-type guard. Types transcribed from Anderson-D'Alonzo 1974 (J Bone Joint Surg Am)
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { andersonDalonzo } from '../../lib/anderson-dalonzo-v410.js';

test('type II: base of the dens, most common (the META example)', () => {
  const r = andersonDalonzo({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /base \(neck\) of the odontoid/);
  assert.match(r.band, /most prone to non-union/);
});

test('type I: through the tip, above the transverse ligament', () => {
  const r = andersonDalonzo({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /tip of the odontoid/);
  assert.match(r.band, /above the transverse ligament/);
});

test('type III: extends into the C2 body', () => {
  const r = andersonDalonzo({ type: 'III' });
  assert.equal(r.type, 'III');
  assert.match(r.band, /cancellous body of C2/);
});

test('numeric and IIA subtype input map to the types', () => {
  assert.equal(andersonDalonzo({ type: 1 }).type, 'I');
  assert.equal(andersonDalonzo({ type: 3 }).type, 'III');
  assert.equal(andersonDalonzo({ type: 'IIa' }).type, 'II');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(andersonDalonzo({}).valid, false);
  assert.equal(andersonDalonzo({ type: 'IV' }).valid, false);
  assert.equal(andersonDalonzo({ type: '0' }).valid, false);
});
