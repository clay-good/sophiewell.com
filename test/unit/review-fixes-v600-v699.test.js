// Regression tests for the defects an independent review found in the spec-v600 to v699 tools (and two v800s
// items) on 2026-10-20 (spec-v1677), each with the input that showed it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apache2 } from '../../lib/scoring-v6.js';
import { fgsi } from '../../lib/fgsi-v667.js';
import { pollockFlickinger } from '../../lib/pollock-flickinger-v601.js';
import { fisherGrade } from '../../lib/fisher-grade-v600.js';
import { elementalIronIngested } from '../../lib/elemental-iron-ingested-v687.js';
import { effectiveOsmolality } from '../../lib/effective-osmolality-v683.js';
import { freeAndrogenIndex } from '../../lib/free-androgen-index-v685.js';
import { cobbAngle } from '../../lib/cobb-angle-v694.js';
import { qcsi } from '../../lib/qcsi-v698.js';
import { oswestryDisabilityIndex } from '../../lib/oswestry-v643.js';
import { walterIndex } from '../../lib/walter-index-v669.js';
import { ucsfHcc } from '../../lib/ucsf-hcc-v686.js';
import { wangBronchiolitis } from '../../lib/wang-bronchiolitis-v682.js';
import { indomethacinHeadacheIchd3 } from '../../lib/indomethacin-headache-ichd3-v819.js';

test('APACHE II and FGSI: a value between two printed bands scores the band below the next cut, not 0', () => {
  const base = { temp: 37, map: 90, hr: 80, rr: 16, oxy: 90, ph: 7.4, na: 140, k: 4, creatinine: 1, hct: 40, wbc: 8, gcs: 15, age: 30 };
  assert.equal(apache2({ ...base, temp: 40.95 }).aps, 3);
  assert.equal(apache2({ ...base, ph: 7.695 }).aps, 3);
  assert.equal(apache2({ ...base, oxy: 54.95 }).aps, 4);
  const r = fgsi({ temp: 40.95, hr: 139.5, rr: 34.5, na: 140, k: 6.95, creatinine: 3.45, hct: 49.95, wbc: 39.95, bicarbonate: 14.95 });
  assert.ok(r.total > 9, `got ${r.total}`);
  assert.equal(fgsi({ temp: -3, hr: 80, rr: 16, na: 140, k: 4, creatinine: 1, hct: 40, wbc: 8, bicarbonate: 24 }).valid, false);
});

test('Pollock-Flickinger: exactly 2.00 takes the higher band, as its note says', () => {
  assert.equal(pollockFlickinger({ volume: 10, age: 50, site: 'frontal' }).originalBand, '2.00 or more');
});

test('Fisher: blood in the ventricles beside a thick clot is grade 3, the highest vasospasm risk', () => {
  const r = fisherGrade({ intracerebralOrIntraventricular: 'yes', subarachnoidBlood: 'thick-or-localized-clot' });
  assert.equal(r.grade, 3);
  assert.equal(r.carriesHighestVasospasmRisk, true);
});

test('doses and indices at a line are printed on the side they were judged', () => {
  assert.match(elementalIronIngested({ tablets: 20, mgPerTablet: 325, saltType: 'ferrous-sulfate', weightKg: 65.1 }).band, /19\.97 mg\/kg/);
  assert.match(effectiveOsmolality({ sodium: 151, glucose: 324.5 }).band, /320\.03/);
  assert.equal(effectiveOsmolality({ sodium: 125, glucose: 90 }).abnormal, true);
  assert.match(freeAndrogenIndex({ sex: 'female', testosterone: 2.016, shbg: 40 }).band, /^FAI 5\.04/);
  assert.equal(cobbAngle({ angle: 24.5 }).category, 'mild');
});

test('qCSI applies only up to 6 L/min; a partial Oswestry is labeled partial', () => {
  assert.equal(qcsi({ respiratoryRate: 20, spo2: 95, o2Flow: 15 }).valid, false);
  assert.equal(oswestryDisabilityIndex({ pain: 5 }).partial, true);
  assert.match(oswestryDisabilityIndex({ pain: 5 }).bandLabel, /from 1 of 10 sections, partial/);
});

test('values between bands and impossible inputs', () => {
  assert.equal(walterIndex({ sex: 'female', adl: 'none', cancer: 'none', creatinine: 1, albumin: 3.45 }).score
    - walterIndex({ sex: 'female', adl: 'none', cancer: 'none', creatinine: 1, albumin: 3.5 }).score, 1);
  assert.equal(ucsfHcc({ nodules: 1, largest: 6, total: 20 }).valid, false);
  assert.equal(wangBronchiolitis({ respiratoryRate: 0, wheezing: 0, retraction: 0, generalCondition: 0 }).valid, false);
});

test('paroxysmal hemicrania asks for the pain of criterion B, not only its duration', () => {
  const base = { attackCount: 30, attackMinutes: 15, attacksPerDay: 8, miosisPtosis: true, indomethacinResponse: true, noBetterExplanation: true };
  assert.equal(indomethacinHeadacheIchd3(base).paroxysmalHemicrania.b, false);
  assert.equal(indomethacinHeadacheIchd3({ ...base, severeUnilateralPain: true }).paroxysmalHemicrania.b, true);
});
