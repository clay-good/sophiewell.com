// spec-v260: worked examples for the pneumonia severity & stewardship risk scores.
// Weights/thresholds spec-v97 verified against the primary papers' point tables:
// A-DROP (JRS Intern Med 2006), DRIP (Webb AAC 2016, PMC4862530 Table 3),
// Shorr (BMC Infect Dis 2013, PMC3681572 Table 2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aDrop, dripScore, shorrMrsa } from '../../lib/pneumonia-risk-v260.js';

// --- A-DROP ---
test('a-drop: all negative is mild', () => {
  const r = aDrop({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('A-DROP 0 of 5'));
  assert.ok(r.band.includes('mild'));
});
test('a-drop: three positive is severe', () => {
  const r = aDrop({ age: true, dehydration: true, orientation: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('A-DROP 3 of 5'));
  assert.ok(r.band.includes('severe'));
});
test('a-drop: all five is extremely severe', () => {
  const r = aDrop({ age: true, dehydration: true, respiratory: true, orientation: true, pressure: true });
  assert.equal(r.score, 5);
  assert.ok(r.band.includes('extremely severe'));
});

// --- DRIP score ---
test('drip: two major criteria crosses the >= 4 threshold', () => {
  const r = dripScore({ antibiotics60: true, tubeFeeding: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 4);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('DRIP 4'));
  assert.ok(r.band.includes('high risk'));
});
test('drip: three minor criteria stays below threshold', () => {
  const r = dripScore({ hospitalization60: true, chronicPulmonary: true, woundCare: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('low risk'));
});
test('drip: all ten items sum to 14', () => {
  const r = dripScore({
    antibiotics60: true, ltcResidence: true, tubeFeeding: true, priorDrp: true,
    hospitalization60: true, chronicPulmonary: true, poorFunctional: true,
    gastricAcid: true, woundCare: true, mrsaColonization: true,
  });
  assert.equal(r.score, 14);
});

// --- Shorr MRSA score ---
test('shorr: low band (0-1)', () => {
  const r = shorrMrsa({ ageExtreme: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 1);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('low'));
});
test('shorr: medium band (2-5)', () => {
  const r = shorrMrsa({ recentHospitalization: true, dementia: true });
  assert.equal(r.score, 3);
  assert.ok(r.band.includes('medium'));
});
test('shorr: high band (>= 6)', () => {
  const r = shorrMrsa({ recentHospitalization: true, icuAdmission: true, dementia: true, cerebrovascular: true });
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('high'));
  assert.ok(r.band.includes('30'));
});
test('shorr: two +2 items sum to 4 (medium)', () => {
  const r = shorrMrsa({ recentHospitalization: true, icuAdmission: true });
  assert.equal(r.score, 4);
});
