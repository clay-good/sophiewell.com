// spec-v280: worked examples for the ASAS axial-spondyloarthritis classification
// criteria (Rudwaleit 2009). spec-v97 cross-verified: entry = back pain >= 3 months
// AND age at onset < 45; then the imaging arm (sacroiliitis + >= 1 SpA feature) OR
// the clinical arm (HLA-B27 + >= 2 OTHER SpA features). It classifies for study
// enrollment, not a diagnosis.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asasAxspa } from '../../lib/rheum-fn-v280.js';

test('asas-axspa: meets via the imaging arm', () => {
  // Entry + sacroiliitis on imaging + 1 SpA feature (uveitis).
  const r = asasAxspa({ backPain3mo: true, ageOnsetUnder45: true, sacroiliitisImaging: true, uveitis: true });
  assert.equal(r.valid, true);
  assert.equal(r.meets, true);
  assert.ok(r.detail.includes('imaging arm'));
  assert.ok(r.detail.includes('MEETS'));
});

test('asas-axspa: meets via the clinical arm (tile example)', () => {
  // Entry + HLA-B27 + 2 other SpA features (inflammatory back pain + psoriasis).
  const r = asasAxspa({ backPain3mo: true, ageOnsetUnder45: true, hlaB27: true, ibp: true, psoriasis: true });
  assert.equal(r.meets, true);
  assert.ok(r.detail.includes('clinical arm'));
  assert.ok(r.detail.includes('MEETS the ASAS axial-SpA classification'));
});

test('asas-axspa: clinical arm needs >= 2 OTHER features (HLA-B27 does not count toward the 2)', () => {
  // HLA-B27 + only 1 other feature -> does not meet.
  assert.equal(asasAxspa({ backPain3mo: true, ageOnsetUnder45: true, hlaB27: true, ibp: true }).meets, false);
  // Imaging arm: HLA-B27 alone counts as the >= 1 feature.
  assert.equal(asasAxspa({ backPain3mo: true, ageOnsetUnder45: true, sacroiliitisImaging: true, hlaB27: true }).meets, true);
});

test('asas-axspa: no entry criterion -> does not meet even with features', () => {
  const r = asasAxspa({ sacroiliitisImaging: true, uveitis: true, ibp: true, arthritis: true });
  assert.equal(r.meets, false);
  assert.ok(r.detail.includes('entry criterion not met'));
});

test('asas-axspa: entry met but neither arm satisfied', () => {
  const r = asasAxspa({ backPain3mo: true, ageOnsetUnder45: true, uveitis: true });
  assert.equal(r.meets, false);
  assert.ok(r.detail.includes('neither arm'));
});

test('asas-axspa: fully empty input is invalid (no NaN)', () => {
  assert.equal(asasAxspa({}).valid, false);
  assert.equal(asasAxspa().valid, false);
});
