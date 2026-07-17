// spec-v396: Sievers classification of a bicuspid aortic valve (types 0/1/2). Worked-example tests: each
// type and its raphe description, numeric input, and the invalid-type guard. Types transcribed from
// Sievers 2007 (J Thorac Cardiovasc Surg) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sieversBav } from '../../lib/sievers-bav-v396.js';

test('type 1: one raphe, most common (the META example)', () => {
  const r = sieversBav({ type: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.type, '1');
  assert.match(r.band, /one raphe/);
  assert.match(r.band, /the most common type/);
});

test('type 0: no raphe, two symmetrical leaflets', () => {
  const r = sieversBav({ type: '0' });
  assert.equal(r.type, '0');
  assert.match(r.band, /no raphe/);
});

test('type 2: two raphes, least common', () => {
  const r = sieversBav({ type: '2' });
  assert.equal(r.type, '2');
  assert.match(r.band, /two raphes/);
  assert.match(r.band, /the least common type/);
});

test('numeric input maps to the types', () => {
  assert.equal(sieversBav({ type: 0 }).type, '0');
  assert.equal(sieversBav({ type: 2 }).type, '2');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(sieversBav({}).valid, false);
  assert.equal(sieversBav({ type: '3' }).valid, false);
  assert.equal(sieversBav({ type: 'I' }).valid, false);
});
