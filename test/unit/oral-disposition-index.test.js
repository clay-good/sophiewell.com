// spec-v197 2.5: oralDispositionIndex worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oralDispositionIndex } from '../../lib/endo-quant-v197.js';

test('DIo with insulinogenic sub-result', () => {
  const r = oralDispositionIndex({i0:8,i30:60,g0:90,g30:150});
  assert.equal(r.valid, true);
  assert.equal(r.value, 0.108);
  assert.equal(r.igi, 0.867);
});

test('guards: 30-min glucose must exceed fasting', () => {
  const r = oralDispositionIndex({i0:8,i30:60,g0:150,g30:150});
  assert.equal(r.valid, false);
});

test('guards: fasting insulin required', () => {
  const r = oralDispositionIndex({i30:60,g0:90,g30:150});
  assert.equal(r.valid, false);
});
