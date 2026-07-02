// spec-v197 2.2: spinaGd worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spinaGd } from '../../lib/endo-quant-v197.js';

test('within reference band (validated worked example)', () => {
  const r = spinaGd({ft4:16.5,ft3:4.5});
  assert.equal(r.valid, true);
  assert.equal(r.value, 25.22);
  assert.equal(r.abnormal, false);
});

test('second validated worked example', () => {
  const r = spinaGd({ft4:9,ft3:6.2});
  assert.equal(r.value, 63.7);
});

test('guards: FT4 must be positive', () => {
  const r = spinaGd({ft4:0,ft3:4.5});
  assert.equal(r.valid, false);
});
