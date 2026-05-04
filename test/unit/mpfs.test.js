// Unit tests for the MPFS calculator.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcMpfsPayment, calcMpfsBoth, chargeToMedicareRatio } from '../../lib/mpfs.js';

test('calcMpfsPayment: worked example with all GPCI = 1.0', () => {
  // 99213 components: work 1.30, PE facility 0.46, MP 0.10, CF 32.7442.
  const payment = calcMpfsPayment({
    workRvu: 1.30, peRvu: 0.46, mpRvu: 0.10,
    gpci: { workGpci: 1, peGpci: 1, mpGpci: 1 },
    conversionFactor: 32.7442,
  });
  // (1.30 + 0.46 + 0.10) * 32.7442 = 60.89
  assert.equal(payment, 60.90); // rounded
});

test('calcMpfsPayment: locality adjusted', () => {
  const payment = calcMpfsPayment({
    workRvu: 1.0, peRvu: 1.0, mpRvu: 1.0,
    gpci: { workGpci: 1.058, peGpci: 1.225, mpGpci: 1.483 },
    conversionFactor: 30.0,
  });
  // 1*1.058 + 1*1.225 + 1*1.483 = 3.766; *30 = 112.98.
  assert.equal(payment, 112.98);
});

test('calcMpfsPayment: rejects non-numeric input', () => {
  assert.throws(() => calcMpfsPayment({ workRvu: 'a', peRvu: 0, mpRvu: 0, conversionFactor: 1 }), /numeric/);
});

test('calcMpfsBoth: returns facility and non-facility', () => {
  const r = calcMpfsBoth({
    code: '99213',
    mpfs: { workRvu: 1.30, peRvuFacility: 0.46, peRvuNonFacility: 1.04, mpRvu: 0.10 },
    gpci: { workGpci: 1, peGpci: 1, mpGpci: 1 },
    conversionFactor: 32.7442,
  });
  assert.ok(r.facility < r.nonFacility, 'facility allowable should be lower than non-facility');
  assert.equal(r.facility, 60.90);
  // Non-facility: (1.30 + 1.04 + 0.10) * 32.7442 = 79.90.
  assert.equal(r.nonFacility, 79.90);
});

test('chargeToMedicareRatio: correct ratio', () => {
  assert.equal(chargeToMedicareRatio(150, 50), 3.0);
});

test('chargeToMedicareRatio: under-1 ratio', () => {
  assert.equal(chargeToMedicareRatio(40, 50), 0.8);
});

test('chargeToMedicareRatio: zero medicare throws', () => {
  assert.throws(() => chargeToMedicareRatio(100, 0), /positive/);
});

test('chargeToMedicareRatio: negative input throws', () => {
  assert.throws(() => chargeToMedicareRatio(-100, 50), /positive/);
});
