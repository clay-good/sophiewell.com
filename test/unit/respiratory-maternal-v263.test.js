// spec-v263: worked examples for the respiratory & maternal acute-risk instruments.
// Weights/bands spec-v97 verified against the primary papers and independent sources:
// MuLBSTA (Guo, Front Microbiol 2019, PMC6901688; max 20, cutoff >= 12), Ottawa COPD
// (Stiell, CMAJ 2014, 2014 derivation weighting; max 16), SOS (Albright, AJOG 2014
// Table 2, reproduced in Int J Clin Obstet Gynaecol 2024;9(3); 0-28, cutoff >= 6,
// grid triangulated by the 0-28 maximum).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulbsta, ottawaCopd, sepsisObstetricsScore } from '../../lib/respiratory-maternal-v263.js';

// --- MuLBSTA ---
test('mulbsta: no items positive is a zero low-risk score', () => {
  const r = mulbsta({ smoking: 'never' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('MuLBSTA 0 of 20'));
  assert.ok(r.band.includes('low risk'));
});
test('mulbsta: crosses the >= 12 cutoff with a CURRENT smoker term', () => {
  const r = mulbsta({ multilobar: true, lymphopenia: true, smoking: 'current' });
  // multilobar (+5) + lymphopenia (+4) + current smoker (+3) = 12.
  assert.equal(r.score, 12);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('MuLBSTA 12 of 20'));
  assert.ok(r.band.includes('high risk'));
  assert.ok(r.detail.includes('current smoker (+3)'));
});
test('mulbsta: the same items with a FORMER smoker stay below the cutoff', () => {
  const r = mulbsta({ multilobar: true, lymphopenia: true, smoking: 'former' });
  // 5 + 4 + 2 = 11 -> below 12.
  assert.equal(r.score, 11);
  assert.equal(r.abnormal, false);
  assert.ok(r.detail.includes('former smoker (+2)'));
});
test('mulbsta: all items with a current smoker reach the 20-point maximum', () => {
  const r = mulbsta({ multilobar: true, lymphopenia: true, bacterial: true, smoking: 'current', hypertension: true, ageOver60: true });
  assert.equal(r.score, 20);
  assert.ok(r.band.includes('high risk'));
});

// --- Ottawa COPD ---
test('ottawa-copd: no criteria is a zero low-risk score', () => {
  const r = ottawaCopd({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('Ottawa COPD 0 of 16'));
  assert.ok(r.band.includes('low'));
});
test('ottawa-copd: a mid-gradient case is high risk', () => {
  const r = ottawaCopd({ hbLow: true, hr110: true });
  // Hb < 10 (+3) + HR >= 110 (+2) = 5.
  assert.equal(r.score, 5);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('Ottawa COPD 5 of 16'));
  assert.ok(r.band.includes('high'));
});
test('ottawa-copd: all ten criteria reach the 16-point maximum', () => {
  const r = ottawaCopd({ cabg: true, pvd: true, priorIntubation: true, hr110: true, walkTestFail: true, ischemicEcg: true, pulmCongestion: true, hbLow: true, ureaHigh: true, bicarbHigh: true });
  assert.equal(r.score, 16);
  assert.ok(r.band.includes('very high'));
});

// --- Sepsis in Obstetrics Score ---
test('sos: all variables normal is a zero low-risk score', () => {
  const r = sepsisObstetricsScore({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.ok(r.band.includes('SOS 0 of 28'));
  assert.ok(r.band.includes('low risk'));
});
test('sos: a hypothermic + leukocytotic case crosses the >= 6 cutoff (two-tailed)', () => {
  const r = sepsisObstetricsScore({ temp: 't30_319', wbc: 'w25_399' });
  // temp 30-31.9 (+3, low tail) + WBC 25-39.9 (+3, high tail) = 6.
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.includes('SOS 6 of 28'));
  assert.ok(r.band.includes('high risk'));
});
test('sos: a hyperthermic + leukopenic case also scores the two-tailed way', () => {
  const r = sepsisObstetricsScore({ temp: 'gt409', wbc: 'lt1' });
  // temp > 40.9 (+4, high tail) + WBC < 1 (+4, low tail) = 8.
  assert.equal(r.score, 8);
  assert.ok(r.abnormal);
  assert.ok(r.detail.includes('temperature (+4)'));
  assert.ok(r.detail.includes('WBC (+4)'));
});
test('sos: every variable at its maximum reaches the 28-point total', () => {
  const r = sepsisObstetricsScore({ temp: 'lt30', sbp: 'lt70', hr: 'gt179', rr: 'gt49', spo2: 'lt85', wbc: 'gt399', immature: 'ge10', lactic: 'ge4' });
  // 4 + 2 + 4 + 4 + 3 + 4 + 3 + 4 = 28.
  assert.equal(r.score, 28);
  assert.ok(r.band.includes('high risk'));
});
test('sos: a single SpO2 < 85 derangement scores +3 and stays below the cutoff', () => {
  const r = sepsisObstetricsScore({ spo2: 'lt85' });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, false);
});
