// spec-v204 2.1: CCCR worked examples spanning FHH / gray-zone / PHPT bands.
// CCCR = (urine Ca * serum Cr) / (serum Ca * urine Cr); < 0.01 FHH, > 0.02 PHPT,
// 0.01-0.02 indeterminate. Bands spec-v97 cross-verified.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cccr } from '../../lib/nephro-fluids-v204.js';

test('FHH band (< 0.01) worked example', () => {
  const r = cccr({ urineCa: 6, serumCa: 10, serumCr: 1.0, urineCr: 100 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0.006);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /FHH/);
});

test('PHPT band (> 0.02)', () => {
  const r = cccr({ urineCa: 30, serumCa: 10, serumCr: 1.0, urineCr: 100 });
  assert.equal(r.score, 0.03);
  assert.match(r.band, /PHPT/);
});

test('indeterminate gray zone (0.01-0.02)', () => {
  const r = cccr({ urineCa: 15, serumCa: 10, serumCr: 1.0, urineCr: 100 });
  assert.equal(r.score, 0.015);
  assert.match(r.band, /indeterminate/);
});

test('ratio matches the formula (units cancel in matched pairs)', () => {
  const r = cccr({ urineCa: 8, serumCa: 10, serumCr: 1.2, urineCr: 120 });
  const expected = Math.round(((8 * 1.2) / (10 * 120)) * 10000) / 10000;
  assert.equal(r.score, expected);
});

test('zero denominator -> complete-the-fields (guarded)', () => {
  const r = cccr({ urineCa: 6, serumCa: 0, serumCr: 1.0, urineCr: 100 });
  assert.equal(r.valid, false);
  assert.match(r.message, /positive/);
});
