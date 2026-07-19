// spec-v449: Fielding-Hawkins atlantoaxial rotatory subluxation classification (types I-IV).
// Worked-example tests: each type and its displacement description, numeric input, and the invalid-type guard.
// Types transcribed from Fielding & Hawkins 1977 (J Bone Joint Surg Am) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fieldingHawkins } from '../../lib/fielding-hawkins-v449.js';

test('type II: anterior 3-5 mm (the META example)', () => {
  const r = fieldingHawkins({ type: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'II');
  assert.match(r.band, /anterior displacement of 3 to 5 mm/);
});

test('type I: no anterior displacement', () => {
  const r = fieldingHawkins({ type: 'I' });
  assert.equal(r.type, 'I');
  assert.match(r.band, /without anterior displacement/);
});

test('type III: anterior > 5 mm', () => {
  assert.match(fieldingHawkins({ type: 'III' }).band, /greater than 5 mm/);
});

test('type IV: posterior displacement', () => {
  const r = fieldingHawkins({ type: 'IV' });
  assert.equal(r.type, 'IV');
  assert.match(r.band, /posterior displacement of the atlas/);
});

test('numeric input maps to the types', () => {
  assert.equal(fieldingHawkins({ type: 1 }).type, 'I');
  assert.equal(fieldingHawkins({ type: 4 }).type, 'IV');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(fieldingHawkins({}).valid, false);
  assert.equal(fieldingHawkins({ type: 'V' }).valid, false);
  assert.equal(fieldingHawkins({ type: '0' }).valid, false);
});
