// spec-v92 §2.2: spot urine albumin/protein-to-creatinine ratios.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uacrUpcr } from '../../lib/nephro-v92.js';

test('worked example: albumin 30 mg/dL, urine Cr 100 mg/dL -> UACR 300 (A2)', () => {
  const r = uacrUpcr({ albumin: 30, urineCr: 100 });
  assert.equal(r.uacr, 300);
  assert.equal(r.aStage, 'A2');
  assert.equal(r.albuminExcretion, 300);
  assert.match(r.band, /UACR 300 mg\/g \(A2\)/);
});

test('urine creatinine 0 or blank is a surfaced fallback, never NaN/Infinity', () => {
  assert.equal(uacrUpcr({ albumin: 30, urineCr: 0 }).valid, false);
  assert.equal(uacrUpcr({ albumin: 30 }).valid, false);
});

test('mg/L unit toggle agrees with mg/dL (1 mg/dL = 10 mg/L)', () => {
  // 300 mg/L = 30 mg/dL -> same UACR as the worked example
  assert.equal(uacrUpcr({ albumin: 300, albuminUnit: 'mg/L', urineCr: 100 }).uacr, 300);
});

test('A-stage band edge agrees with ckd-staging (< 30 = A1)', () => {
  assert.equal(uacrUpcr({ albumin: 2.99, urineCr: 100 }).aStage, 'A1'); // 29.9 mg/g
  assert.equal(uacrUpcr({ albumin: 3.001, urineCr: 100 }).aStage, 'A2'); // 30.01 mg/g
});

test('protein yields UPCR independently of albumin', () => {
  const r = uacrUpcr({ protein: 50, urineCr: 100 });
  assert.equal(r.upcr, 500);
  assert.equal(r.uacr, undefined);
  assert.equal(r.valid, true);
});
