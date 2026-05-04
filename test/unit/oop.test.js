// Unit tests for the OOP cost estimator.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateOop } from '../../lib/oop.js';

test('estimateOop: spec worked example', () => {
  // allowed 1000, deductible 500 (250 met, 250 remaining), 20% coinsurance, copay 0,
  // OOP max 5000 (1000 met). Patient = 250 + 0.2*750 = 400.
  const r = estimateOop({
    allowedAmount: 1000,
    deductible: 500,
    deductibleMet: 250,
    coinsurance: 20,
    copay: 0,
    oopMax: 5000,
    oopMet: 1000,
  });
  assert.equal(r.patientResponsibility, 400);
  assert.equal(r.deductibleApplied, 250);
  assert.equal(r.coinsuranceApplied, 150);
  assert.equal(r.cappedByOopMax, false);
});

test('estimateOop: deductible already met', () => {
  const r = estimateOop({
    allowedAmount: 200, deductible: 1000, deductibleMet: 1000, coinsurance: 20, copay: 0, oopMax: 5000, oopMet: 0,
  });
  assert.equal(r.patientResponsibility, 40);
});

test('estimateOop: copay only (deductible met)', () => {
  const r = estimateOop({
    allowedAmount: 100, deductible: 0, deductibleMet: 0, coinsurance: 0, copay: 25, oopMax: 5000, oopMet: 0,
  });
  assert.equal(r.patientResponsibility, 25);
});

test('estimateOop: capped by remaining OOP max', () => {
  const r = estimateOop({
    allowedAmount: 5000, deductible: 0, deductibleMet: 0, coinsurance: 100, copay: 0, oopMax: 1000, oopMet: 800,
  });
  assert.equal(r.patientResponsibility, 200);
  assert.equal(r.cappedByOopMax, true);
});

test('estimateOop: 100% coinsurance', () => {
  const r = estimateOop({
    allowedAmount: 500, deductible: 0, deductibleMet: 0, coinsurance: 100, copay: 0, oopMax: 5000, oopMet: 0,
  });
  assert.equal(r.patientResponsibility, 500);
});

test('estimateOop: zero allowed', () => {
  const r = estimateOop({
    allowedAmount: 0, deductible: 1000, deductibleMet: 0, coinsurance: 20, copay: 0, oopMax: 5000, oopMet: 0,
  });
  assert.equal(r.patientResponsibility, 0);
  assert.equal(r.planPays, 0);
});

test('estimateOop: deductible exactly equal to allowed', () => {
  const r = estimateOop({
    allowedAmount: 500, deductible: 500, deductibleMet: 0, coinsurance: 20, copay: 0, oopMax: 5000, oopMet: 0,
  });
  assert.equal(r.patientResponsibility, 500);
  assert.equal(r.coinsuranceApplied, 0);
});

test('estimateOop: rejects negative input', () => {
  assert.throws(() => estimateOop({
    allowedAmount: -1, deductible: 0, deductibleMet: 0, coinsurance: 0, copay: 0, oopMax: 0, oopMet: 0,
  }), /non-negative/);
});

test('estimateOop: rejects deductibleMet > deductible', () => {
  assert.throws(() => estimateOop({
    allowedAmount: 100, deductible: 100, deductibleMet: 200, coinsurance: 0, copay: 0, oopMax: 5000, oopMet: 0,
  }), /deductibleMet/);
});

test('estimateOop: rejects coinsurance out of range', () => {
  assert.throws(() => estimateOop({
    allowedAmount: 100, deductible: 0, deductibleMet: 0, coinsurance: 150, copay: 0, oopMax: 5000, oopMet: 0,
  }), /coinsurance/);
});
