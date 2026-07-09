// spec-v261: worked examples for the acute-abdomen & emergency-general-surgery risk
// instruments. Weights/thresholds spec-v97 verified against the primary papers and
// independent calculators: RIPASA (Chong, Singapore Med J 2010; max 16, cutoff 7.5),
// PULP (Moller, Acta Anaesthesiol Scand 2012; IJPCR 2024;16(6) Table 1; max 18),
// ESS (Sangji, J Trauma Acute Care Surg 2016; 22 vars, max 29).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ripasa, pulp, emergencySurgeryScore } from '../../lib/acute-abdomen-v261.js';

// --- RIPASA ---
test('ripasa: default demographics with no findings scores the 3.0 baseline (unlikely)', () => {
  const r = ripasa({});
  assert.equal(r.valid, true);
  // male (+1) + age <= 40 (+1) + duration < 48h (+1) = 3.0.
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('RIPASA 3 of 16'));
  assert.ok(r.band.includes('unlikely'));
});
test('ripasa: crosses the 7.5 diagnostic cutoff into high probability', () => {
  const r = ripasa({ rifPain: true, anorexia: true, nauseaVomiting: true, rifTenderness: true, rebound: true });
  // baseline 3.0 + 0.5 + 1 + 1 + 1 + 1 = 7.5.
  assert.equal(r.score, 7.5);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('RIPASA 7.5 of 16'));
  assert.ok(r.band.includes('high probability'));
  assert.ok(r.band.includes('7.5 diagnostic cutoff'));
});
test('ripasa: all items positive reaches the 16-point maximum (very high)', () => {
  const r = ripasa({
    gender: 'male', ageBand: 'le40', duration: 'lt48',
    rifPain: true, migration: true, anorexia: true, nauseaVomiting: true,
    rifTenderness: true, guarding: true, rebound: true, rovsing: true, fever: true,
    raisedWbc: true, negativeUrinalysis: true, foreignNric: true,
  });
  assert.equal(r.score, 16);
  assert.ok(r.band.includes('very high'));
});
test('ripasa: female / age > 40 / duration > 48h take the lower demographic weights', () => {
  const r = ripasa({ gender: 'female', ageBand: 'gt40', duration: 'gt48' });
  assert.equal(r.score, 1.5);
  assert.ok(r.detail.includes('female (+0.5)'));
  assert.ok(r.detail.includes('age > 40 (+0.5)'));
});

// --- PULP ---
test('pulp: no risk factors and ASA 1 is a zero low-risk score', () => {
  const r = pulp({ asa: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('PULP 0 of 18'));
  assert.ok(r.band.includes('low risk'));
});
test('pulp: crosses the <= 7 / >= 8 dichotomy with an ASA-class contribution', () => {
  const r = pulp({ ageOver65: true, shock: true, creatinine: true, asa: '3' });
  // age > 65 (+3) + shock (+1) + creatinine (+2) + ASA 3 (+3) = 9.
  assert.equal(r.score, 9);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('PULP 9 of 18'));
  assert.ok(r.band.includes('high risk'));
  assert.ok(r.detail.includes('ASA 3 (+3)'));
});
test('pulp: a score of exactly 7 stays low risk (boundary)', () => {
  // age > 65 (+3) + creatinine (+2) + malignancy/AIDS (+1) + steroid (+1) = 7.
  const r = pulp({ ageOver65: true, creatinine: true, malignancyAids: true, steroids: true, asa: '1' });
  assert.equal(r.score, 7);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('low risk'));
});
test('pulp: all variables at ASA 5 reach the 18-point maximum', () => {
  const r = pulp({ ageOver65: true, malignancyAids: true, cirrhosis: true, steroids: true, delayedAdmission: true, shock: true, creatinine: true, asa: '5' });
  // 3 + 1 + 2 + 1 + 1 + 1 + 2 + 7 = 18.
  assert.equal(r.score, 18);
  assert.ok(r.band.includes('high risk'));
});

// --- Emergency Surgery Score ---
test('ess: no variables positive is a zero low-mortality score', () => {
  const r = emergencySurgeryScore({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('ESS 0 of 29'));
  assert.ok(r.band.includes('low predicted 30-day mortality'));
});
test('ess: a low-score case stays in the low band', () => {
  const r = emergencySurgeryScore({ hypertension: true, dyspnea: true });
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('low predicted 30-day mortality'));
});
test('ess: a high-score case reports high predicted mortality', () => {
  const r = emergencySurgeryScore({ ageOver60: true, disseminatedCancer: true, ventilatorDependence: true, creatinine: true, albumin: true, wbc: 'high' });
  // 2 + 3 + 3 + 2 + 1 + 2 = 13.
  assert.equal(r.score, 13);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('ESS 13 of 29'));
  assert.ok(r.band.includes('high predicted 30-day mortality'));
});
test('ess: transfer source and WBC band are single-choice, not additive', () => {
  const edOnly = emergencySurgeryScore({ transfer: 'ed' });
  assert.equal(edOnly.score, 1);
  const inpatientOnly = emergencySurgeryScore({ transfer: 'inpatient' });
  assert.equal(inpatientOnly.score, 1);
  const wbcAbnormal = emergencySurgeryScore({ wbc: 'abnormal' });
  assert.equal(wbcAbnormal.score, 1);
});
test('ess: every variable maxed reaches the 29-point maximum', () => {
  const r = emergencySurgeryScore({
    ageOver60: true, whiteRace: true, transfer: 'ed',
    ascites: true, bmiUnder20: true, dyspnea: true, functionalDependence: true, copd: true,
    hypertension: true, steroids: true, weightLoss: true, disseminatedCancer: true, ventilatorDependence: true,
    albumin: true, alkPhos: true, bun: true, inr: true, platelets: true, ast: true, sodium: true,
    creatinine: true, wbc: 'high',
  });
  assert.equal(r.score, 29);
  assert.ok(r.band.includes('very high predicted 30-day mortality'));
});
