// spec-v197 2.3: jostelTshIndex worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jostelTshIndex } from '../../lib/endo-quant-v197.js';

test('index and standardized index', () => {
  const r = jostelTshIndex({tsh:1.5,ft4:15});
  assert.equal(r.valid, true);
  assert.equal(r.tshi, 2.42);
  assert.equal(r.stshi, -0.41);
});

test('low index suggests central hypothyroidism', () => {
  const r = jostelTshIndex({tsh:0.2,ft4:8});
  assert.equal(r.abnormal, true);
});

test('guards: TSH must be positive for log', () => {
  const r = jostelTshIndex({tsh:0,ft4:15});
  assert.equal(r.valid, false);
});
