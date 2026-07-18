// spec-v417: Wassel classification of thumb polydactyly (types I-VII).
// Worked-example tests: each type and its duplication-level description, the odd=bifid/even=duplicated
// pattern, numeric input, and the invalid-type guard. Types transcribed from Wassel 1969 (Clin Orthop Relat
// Res) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wasselThumb } from '../../lib/wassel-thumb-v417.js';

test('type IV: duplicated proximal phalanx, most common (the META example)', () => {
  const r = wasselThumb({ type: 'IV' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'IV');
  assert.match(r.band, /duplicated proximal phalanx/);
  assert.match(r.band, /most common/);
});

test('type I and II: distal phalanx, bifid vs duplicated', () => {
  assert.match(wasselThumb({ type: 'I' }).band, /bifid distal phalanx/);
  assert.match(wasselThumb({ type: 'II' }).band, /duplicated distal phalanx/);
});

test('type V and VI: metacarpal, bifid vs duplicated', () => {
  assert.match(wasselThumb({ type: 'V' }).band, /bifid metacarpal/);
  assert.match(wasselThumb({ type: 'VI' }).band, /duplicated metacarpal/);
});

test('type VII: triphalangeal thumb', () => {
  const r = wasselThumb({ type: 'VII' });
  assert.equal(r.type, 'VII');
  assert.match(r.band, /triphalangeal thumb/);
});

test('numeric input maps to the types', () => {
  assert.equal(wasselThumb({ type: 3 }).type, 'III');
  assert.equal(wasselThumb({ type: 7 }).type, 'VII');
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(wasselThumb({}).valid, false);
  assert.equal(wasselThumb({ type: 'VIII' }).valid, false);
  assert.equal(wasselThumb({ type: '0' }).valid, false);
});
