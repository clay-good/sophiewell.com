// spec-v787: ECG criteria for atrial enlargement.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { atrialEnlargement } from '../../lib/atrial-enlargement-v787.js';

test('a normal P wave meets nothing', () => {
  const r = atrialEnlargement({ pDurationII: 90, pAmplitudeII: 1.5, pAmplitudeV1: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.leftMet, false);
  assert.equal(r.rightMet, false);
  assert.equal(r.abnormal, false);
});

test('the left-sided thresholds are OR-MORE: 120 ms exactly meets the criterion', () => {
  assert.equal(atrialEnlargement({ pDurationII: 119 }).leftMet, false);
  assert.equal(atrialEnlargement({ pDurationII: 120 }).leftMet, true);
  assert.equal(atrialEnlargement({ notchInterpeak: 39 }).leftMet, false);
  assert.equal(atrialEnlargement({ notchInterpeak: 40 }).leftMet, true);
});

test('the right-sided thresholds are STRICTLY GREATER: 2.5 mm exactly does not meet it', () => {
  assert.equal(atrialEnlargement({ pAmplitudeII: 2.5 }).rightMet, false);
  assert.equal(atrialEnlargement({ pAmplitudeII: 2.6 }).rightMet, true);
  assert.equal(atrialEnlargement({ pAmplitudeV1: 1.5 }).rightMet, false);
  assert.equal(atrialEnlargement({ pAmplitudeV1: 1.6 }).rightMet, true);
});

test('the P terminal force needs BOTH halves to meet the criterion', () => {
  assert.equal(atrialEnlargement({ ptfDuration: 60, ptfDepth: 0.5 }).leftMet, false, 'deep enough? no');
  assert.equal(atrialEnlargement({ ptfDuration: 20, ptfDepth: 2 }).leftMet, false, 'long enough? no');
  assert.equal(atrialEnlargement({ ptfDuration: 40, ptfDepth: 1 }).leftMet, true);
});

test('the Morris index is only reported when both halves were measured', () => {
  assert.equal(atrialEnlargement({ ptfDuration: 60 }).morrisIndex, null);
  assert.equal(atrialEnlargement({ ptfDepth: 1.5 }).morrisIndex, null);
  assert.equal(atrialEnlargement({ ptfDuration: 60, ptfDepth: 1.5 }).morrisIndex, 0.09);
});

test('worked example: a 130 ms P in II with a 2 mm P in V1 meets both sides', () => {
  const r = atrialEnlargement({ pDurationII: 130, pAmplitudeV1: 2 });
  assert.equal(r.leftMet, true);
  assert.equal(r.rightMet, true);
  assert.match(r.band, /BOTH left and right/);
});

test('an entirely empty form falls back, and an off-scale value is rejected', () => {
  assert.equal(atrialEnlargement({}).valid, false);
  assert.equal(atrialEnlargement({ pDurationII: 900 }).field, 'pDurationII');
  assert.equal(atrialEnlargement({ pAmplitudeII: -1 }).field, 'pAmplitudeII');
});
