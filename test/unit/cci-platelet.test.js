// spec-v55 §2.4: Corrected Count Increment (platelet refractoriness).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cciPlatelet } from '../../lib/clinical-v6.js';

test('cci adequate: 10->40 (x10^9/L), BSA 1.8, dose 3.0 -> 18000', () => {
  const r = cciPlatelet({ prePlt: 10, postPlt: 40, bsaM2: 1.8, doseE11: 3.0 });
  assert.equal(r.cci, 18000);
  assert.equal(r.refractory, false);
});

test('cci refractory: 10->15, BSA 1.7, dose 3.5 -> 2429', () => {
  const r = cciPlatelet({ prePlt: 10, postPlt: 15, bsaM2: 1.7, doseE11: 3.5 });
  assert.equal(r.cci, 2429);
  assert.equal(r.refractory, true);
  assert.match(r.band, /HLA-matched/);
});

test('cci boundary near 7500: 20->40, BSA 1.5, dose 4.0 -> 7500 (adequate)', () => {
  const r = cciPlatelet({ prePlt: 20, postPlt: 40, bsaM2: 1.5, doseE11: 4.0 });
  assert.equal(r.cci, 7500);
  assert.equal(r.refractory, false);
});

test('cci no rise: post equals pre -> 0, refractory', () => {
  const r = cciPlatelet({ prePlt: 30, postPlt: 30, bsaM2: 1.8, doseE11: 3.0 });
  assert.equal(r.cci, 0);
  assert.equal(r.refractory, true);
});

test('cci rejects impossible input', () => {
  assert.throws(() => cciPlatelet({ prePlt: 10, postPlt: 40, bsaM2: 1.8, doseE11: 0 }), /doseE11/);
});
