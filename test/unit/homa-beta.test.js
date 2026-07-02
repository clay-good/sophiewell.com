// spec-v197 2.4: homaBeta worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { homaBeta } from '../../lib/endo-quant-v197.js';

test('steady-state beta-cell function', () => {
  const r = homaBeta({insulin:8,glucose:5});
  assert.equal(r.valid, true);
  assert.equal(r.value, 106.7);
});

test('guards: glucose above 3.5 required', () => {
  const r = homaBeta({insulin:8,glucose:3.5});
  assert.equal(r.valid, false);
});

test('guards: insulin required', () => {
  const r = homaBeta({glucose:5});
  assert.equal(r.valid, false);
});
