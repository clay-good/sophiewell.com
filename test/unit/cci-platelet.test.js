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
  assert.throws(() => cciPlatelet({ prePlt: 10, postPlt: 40, bsaM2: 1.8, doseE11: 0 }), /dose\sE11/);
});

// spec-v1753: the envelope lib/bounds.js declares; 1.5 times its ceiling was answered, ten times was refused.
test('spec-v1753: a pre- or post-transfusion platelet count past the 4000 envelope is refused', () => {
  // spec-v1763: bound widened (source in lib/bounds.js)
  const ex = { prePlt: 10, postPlt: 40, bsaM2: 1.8, doseE11: 3.0 };
  // spec-v1764: the lib's own cap is the envelope now (4000), so 4000 is the top value it answers and 4001 is refused.
  assert.throws(() => cciPlatelet({ ...ex, postPlt: 4001 }), RangeError);
  assert.throws(() => cciPlatelet({ ...ex, prePlt: 4001 }), RangeError);
  assert.equal(typeof cciPlatelet({ ...ex, postPlt: 4000 }).cci, 'number');
  assert.equal(typeof cciPlatelet({ ...ex, prePlt: 4000, postPlt: 4000 }).cci, 'number');
  assert.equal(cciPlatelet(ex).cci, 18000);
});
