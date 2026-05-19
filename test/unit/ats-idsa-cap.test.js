import { test } from 'node:test';
import assert from 'node:assert/strict';
import { atsIdsaCap } from '../../lib/scoring-v4.js';

const allFalse = {
  majorVasopressors: false, majorMechanicalVentilation: false,
  minorRrGe30: false, minorPfLe250: false, minorMultilobar: false,
  minorConfusion: false, minorUremiaBunGe20: false,
  minorLeukopeniaWbcLt4: false, minorThrombocytopeniaPltLt100: false,
  minorHypothermiaLt36: false, minorHypotensionAggressiveFluids: false,
};

test('ats-idsa not severe: no criteria', () => {
  const r = atsIdsaCap(allFalse);
  assert.equal(r.severe, false);
});

test('ats-idsa severe: 1 major (mechanical ventilation)', () => {
  const r = atsIdsaCap({ ...allFalse, majorMechanicalVentilation: true });
  assert.equal(r.severe, true);
  assert.equal(r.majorCount, 1);
});

test('ats-idsa severe: 3 minor', () => {
  const r = atsIdsaCap({ ...allFalse, minorRrGe30: true, minorPfLe250: true, minorMultilobar: true });
  assert.equal(r.severe, true);
  assert.equal(r.minorCount, 3);
});

test('ats-idsa not severe: 2 minor (below cutoff)', () => {
  const r = atsIdsaCap({ ...allFalse, minorRrGe30: true, minorPfLe250: true });
  assert.equal(r.severe, false);
  assert.equal(r.minorCount, 2);
});
