// spec-v197 2.1: spinaGt worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spinaGt } from '../../lib/endo-quant-v197.js';

test('within reference band (validated worked example)', () => {
  const r = spinaGt({tsh:1,ft4:16.5});
  assert.equal(r.valid, true);
  assert.equal(r.value, 4.7);
  assert.equal(r.abnormal, false);
});

test('below reference band', () => {
  const r = spinaGt({tsh:30,ft4:3});
  assert.equal(r.value, 0.25);
  assert.equal(r.abnormal, true);
});

test('guards: TSH must be positive', () => {
  const r = spinaGt({tsh:0,ft4:16.5});
  assert.equal(r.valid, false);
});
