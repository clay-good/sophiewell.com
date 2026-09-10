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

// spec-v1194: this file already had the instinct -- "the Morris index needs BOTH
// halves ... one alone cannot meet or exclude it" -- and applied it to one
// criterion out of five. Every other unmeasured P wave was read as a P wave
// measured and found normal, so a form with one amplitude in it answered "no
// atrial enlargement criterion met" while the left-sided measurements had never
// been taken.
test('atrial-enlargement: an unmeasured P wave is not a normal P wave', () => {
  const complete = {
    pDurationII: 90, notchInterpeak: 20, ptfDuration: 20, ptfDepth: 0.5, pAmplitudeII: 1.5, pAmplitudeV1: 1.0,
  };
  const all = atrialEnlargement(complete);
  assert.equal(all.bandLabel, 'Atrial enlargement: none met');
  assert.equal(all.leftOpen, false);
  assert.equal(all.rightOpen, false);

  // One amplitude alone said the same thing before this.
  const one = atrialEnlargement({ pAmplitudeII: 1.5 });
  assert.equal(one.valid, true);
  assert.equal(one.bandLabel, 'Atrial enlargement: not assessed');
  assert.equal(one.leftOpen, true);
  assert.equal(one.rightOpen, true);
  assert.match(one.band, /left not assessed/);
  assert.match(one.band, /the P duration in lead II/);
  assert.match(one.band, /the P amplitude in V1 was not entered/);
});

test('atrial-enlargement: a criterion that is MET holds whatever the rest are', () => {
  // Rule 13: "any one of" is monotone, so a met side is answered, not withheld.
  const left = atrialEnlargement({ pDurationII: 130 });
  assert.equal(left.leftMet, true);
  assert.equal(left.leftOpen, false);
  assert.equal(left.bandLabel, 'Atrial enlargement: left');
  // The other side is still reported as unassessed rather than as normal.
  assert.equal(left.rightOpen, true);
  assert.match(left.band, /right not assessed/);

  const both = atrialEnlargement({ pDurationII: 130, pAmplitudeII: 3 });
  assert.equal(both.bandLabel, 'Atrial enlargement: left and right');
  assert.match(both.band, /BOTH left and right/);
});

test('atrial-enlargement: the terminal force still needs both halves', () => {
  // The one criterion that was already guarded, kept.
  const half = atrialEnlargement({ ptfDuration: 60, pAmplitudeII: 1.5, pAmplitudeV1: 1.0 });
  assert.equal(half.leftMet, false);
  assert.equal(half.morrisIndex, null);
  assert.equal(half.leftOpen, true);
  assert.match(half.band, /the V1 terminal force \(both halves of it\)/);
});
