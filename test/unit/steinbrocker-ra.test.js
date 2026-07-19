// spec-v469: Steinbrocker RA functional classification (classes I-IV).
// Worked-example tests: each class and its functional-capacity description, numeric input, invalid-class guard.
// Classes transcribed from Steinbrocker 1949 (JAMA) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { steinbrockerRa } from '../../lib/steinbrocker-ra-v469.js';

test('class II: adequate despite handicap (the META example)', () => {
  const r = steinbrockerRa({ cls: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.cls, 'II');
  assert.match(r.band, /adequate for normal activities despite the handicap/);
});

test('class I: complete functional capacity', () => {
  assert.match(steinbrockerRa({ cls: 'I' }).band, /complete functional capacity/);
});

test('class III: limited occupation or self-care', () => {
  assert.match(steinbrockerRa({ cls: 'III' }).band, /little or none of the duties of the usual occupation or of self-care/);
});

test('class IV: incapacitated', () => {
  const r = steinbrockerRa({ cls: 'IV' });
  assert.equal(r.cls, 'IV');
  assert.match(r.band, /largely or wholly incapacitated/);
});

test('numeric input maps to the classes', () => {
  assert.equal(steinbrockerRa({ cls: 1 }).cls, 'I');
  assert.equal(steinbrockerRa({ cls: 4 }).cls, 'IV');
});

test('a missing or out-of-range class is invalid', () => {
  assert.equal(steinbrockerRa({}).valid, false);
  assert.equal(steinbrockerRa({ cls: 'V' }).valid, false);
  assert.equal(steinbrockerRa({ cls: '0' }).valid, false);
});
