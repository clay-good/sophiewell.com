// spec-v482: Russell-Taylor subtrochanteric fracture classification (types IA/IB/IIA/IIB).
// Worked-example tests: each type and its piriformis/lesser-trochanter description, alias input, invalid guard.
// Types transcribed from Russell & Taylor (Skeletal Trauma) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { russellTaylorSubtroch } from '../../lib/russell-taylor-subtroch-v482.js';

test('type IA: piriformis intact, LT attached (the META example)', () => {
  const r = russellTaylorSubtroch({ type: 'IA' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 'IA');
  assert.match(r.band, /the piriformis fossa is intact and the lesser trochanter is attached/);
});

test('type IB: piriformis intact, LT detached', () => {
  assert.match(russellTaylorSubtroch({ type: 'IB' }).band, /intact but the lesser trochanter is detached/);
});

test('type IIA: piriformis involved, LT attached', () => {
  assert.match(russellTaylorSubtroch({ type: 'IIA' }).band, /extends into the piriformis fossa .* the lesser trochanter is attached/);
});

test('type IIB: piriformis involved, LT detached', () => {
  const r = russellTaylorSubtroch({ type: 'IIB' });
  assert.equal(r.type, 'IIB');
  assert.match(r.band, /the lesser trochanter is detached \(greater- and lesser-trochanter comminution\)/);
});

test('alias input maps to the types', () => {
  assert.equal(russellTaylorSubtroch({ type: '1a' }).type, 'IA');
  assert.equal(russellTaylorSubtroch({ type: '2B' }).type, 'IIB');
});

test('a missing or unknown type is invalid', () => {
  assert.equal(russellTaylorSubtroch({}).valid, false);
  assert.equal(russellTaylorSubtroch({ type: 'III' }).valid, false);
});
