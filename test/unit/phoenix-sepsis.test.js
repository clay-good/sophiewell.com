// spec-v278: worked examples for the Phoenix Sepsis Score (2024 SCCM/JAMA
// international consensus). Point tables spec-v97 cross-verified against the
// open-access `phoenix` R-package vignette (CRAN) and an independent Phoenix
// logic reference: respiratory 0-3, cardiovascular 0-6, coagulation 0-2,
// neurologic 0-2; total 0-13. Phoenix >= 2 with suspected infection = sepsis;
// cardiovascular >= 1 = septic shock.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { phoenixSepsis } from '../../lib/peds-sepsis-v278.js';

test('phoenix-sepsis: below the sepsis threshold (score 1)', () => {
  // 60-mo child: MAP 60 (band 60-<144 -> >=49 = 0), lactate 3 (<5 = 0),
  // platelets 80 (<100 = coag 1), GCS 15 (0). Total 1 -> no sepsis.
  const r = phoenixSepsis({ ageMonths: 60, map: 60, lactate: 3, platelets: 80, gcs: 15 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 1);
  assert.equal(r.cardio, 0);
  assert.equal(r.coag, 1);
  assert.equal(r.sepsis, false);
  assert.equal(r.shock, false);
  assert.ok(r.band.includes('below the Phoenix'));
});

test('phoenix-sepsis: meets sepsis but not shock (cardiovascular 0)', () => {
  // Score >= 2 driven by coagulation + neurologic, cardiovascular sub-score 0,
  // so it is sepsis but NOT septic shock. platelets 80 (+1), INR 1.5 (+1) ->
  // coag 2; GCS 10 (<=10 -> neuro 1). Total 3, CV 0.
  const r = phoenixSepsis({ ageMonths: 120, platelets: 80, inr: 1.5, gcs: 10, map: 70, lactate: 2, vasoactives: 0 });
  assert.equal(r.score, 3);
  assert.equal(r.cardio, 0);
  assert.equal(r.coag, 2);
  assert.equal(r.neuro, 1);
  assert.equal(r.sepsis, true);
  assert.equal(r.shock, false); // CV sub-score is 0, so shock does NOT fire
  assert.ok(r.band.includes('SEPSIS'));
});

test('phoenix-sepsis: septic shock (sepsis + cardiovascular >= 1)', () => {
  // 24-mo child: vasoactives 1 (+1), lactate 6 (5 to <11 -> +1), MAP 30
  // (band 24-<60: <32 -> +2) -> cardiovascular 4. Total >= 2 and CV >= 1.
  const r = phoenixSepsis({ ageMonths: 24, map: 30, lactate: 6, vasoactives: 1, gcs: 15 });
  assert.equal(r.cardio, 4);
  assert.equal(r.score, 4);
  assert.equal(r.sepsis, true);
  assert.equal(r.shock, true);
  assert.ok(r.band.includes('SEPTIC SHOCK'));
});

test('phoenix-sepsis: respiratory gradient (support vs IMV) is faithful', () => {
  // PaO2/FiO2 90 + IMV -> 3; 150 + IMV -> 2; 350 on any support -> 1; no support -> 0.
  assert.equal(phoenixSepsis({ ageMonths: 60, ratioType: 'pf', ratio: 90, support: 'imv' }).resp, 3);
  assert.equal(phoenixSepsis({ ageMonths: 60, ratioType: 'pf', ratio: 150, support: 'imv' }).resp, 2);
  assert.equal(phoenixSepsis({ ageMonths: 60, ratioType: 'pf', ratio: 350, support: 'support' }).resp, 1);
  assert.equal(phoenixSepsis({ ageMonths: 60, ratioType: 'pf', ratio: 90, support: 'none' }).resp, 0);
  // SpO2/FiO2 gradient: 140 + IMV -> 3; 200 + IMV -> 2; 280 on support -> 1.
  assert.equal(phoenixSepsis({ ageMonths: 60, ratioType: 'sf', ratio: 140, support: 'imv' }).resp, 3);
  assert.equal(phoenixSepsis({ ageMonths: 60, ratioType: 'sf', ratio: 200, support: 'imv' }).resp, 2);
  assert.equal(phoenixSepsis({ ageMonths: 60, ratioType: 'sf', ratio: 280, support: 'support' }).resp, 1);
});

test('phoenix-sepsis: age-banded MAP thresholds and caps', () => {
  // Neonate (<1 mo): MAP 16 -> 2 points; 25 -> 1 point; 35 -> 0.
  assert.equal(phoenixSepsis({ ageMonths: 0, map: 16 }).cardio, 2);
  assert.equal(phoenixSepsis({ ageMonths: 0, map: 25 }).cardio, 1);
  assert.equal(phoenixSepsis({ ageMonths: 0, map: 35 }).cardio, 0);
  // Cardiovascular caps at 6: 2 vasoactives (+2) + lactate 12 (+2) + MAP 10 (+2) = 6.
  assert.equal(phoenixSepsis({ ageMonths: 0, vasoactives: 3, lactate: 12, map: 10 }).cardio, 6);
  // Coagulation caps at 2 even with all four abnormal.
  assert.equal(phoenixSepsis({ ageMonths: 60, platelets: 50, inr: 2, ddimer: 5, fibrinogen: 50 }).coag, 2);
  // Fixed pupils -> neurologic 2.
  assert.equal(phoenixSepsis({ ageMonths: 60, pupilsFixed: true }).neuro, 2);
});

test('phoenix-sepsis: example matches META (score 8, septic shock)', () => {
  const r = phoenixSepsis({ ageMonths: 24, ratioType: 'pf', ratio: 150, support: 'imv', vasoactives: 1, lactate: 6, map: 30, platelets: 80, gcs: 10 });
  assert.equal(r.score, 8);
  assert.equal(r.shock, true);
  assert.ok(r.band.includes('Phoenix Sepsis Score 8/13'));
});

test('phoenix-sepsis: total clamps to [0, 13] at maximum derangement', () => {
  const r = phoenixSepsis({ ageMonths: 0, ratioType: 'pf', ratio: 50, support: 'imv', vasoactives: 3, lactate: 15, map: 5, platelets: 10, inr: 3, ddimer: 10, fibrinogen: 20, gcs: 3, pupilsFixed: true });
  assert.equal(r.resp, 3);
  assert.equal(r.cardio, 6);
  assert.equal(r.coag, 2);
  assert.equal(r.neuro, 2);
  assert.equal(r.score, 13);
});

test('phoenix-sepsis: missing age or empty input is invalid (no NaN)', () => {
  assert.equal(phoenixSepsis({ map: 30 }).valid, false); // no age
  assert.equal(phoenixSepsis({ ageMonths: 60 }).valid, false); // age only, nothing else
  assert.equal(phoenixSepsis({}).valid, false);
  assert.equal(phoenixSepsis().valid, false);
});
