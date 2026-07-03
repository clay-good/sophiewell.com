// spec-v213: worked examples for the ED disposition & injury/physiology
// instruments. Cut-points / point systems spec-v97 cross-verified (see module
// header for the per-tile source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  heartPathway, ottawaHf, lightCriteria, bauxScore, revisedBaux,
} from '../../lib/acute-injury-v213.js';

// ---- HEART Pathway ----------------------------------------------------------
test('heart-pathway: low risk when HEART <= 3 and both troponins non-elevated', () => {
  const r = heartPathway({ heartScore: 2, trop0: false, trop3: false });
  assert.equal(r.valid, true);
  assert.equal(r.lowRisk, true);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /Low risk/);
});

test('heart-pathway: not low risk when HEART >= 4', () => {
  const r = heartPathway({ heartScore: 5, trop0: false, trop3: false });
  assert.equal(r.lowRisk, false);
  assert.match(r.band, /Not low risk/);
});

test('heart-pathway: not low risk when a troponin is elevated even if HEART <= 3', () => {
  const r = heartPathway({ heartScore: 1, trop0: false, trop3: true });
  assert.equal(r.lowRisk, false);
  assert.match(r.detail, /3 h/);
});

test('heart-pathway: invalid without a HEART score', () => {
  assert.equal(heartPathway({}).valid, false);
  assert.equal(heartPathway({ heartScore: 20 }).valid, false);
});

// ---- Ottawa Heart Failure Risk Scale ---------------------------------------
test('ohfrs: zero when no items marked', () => {
  const r = ottawaHf({});
  assert.equal(r.valid, true);
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /lowest measured risk/);
});

test('ohfrs: sums weighted items', () => {
  // intubation (2) + hrArrival (2) + troponin (2) = 6
  const r = ottawaHf({ intubation: true, hrArrival: true, troponin: true });
  assert.equal(r.score, 6);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /higher risk/);
});

test('ohfrs: score of 1 flags the > 1 threshold band', () => {
  const r = ottawaHf({ strokeTia: true });
  assert.equal(r.score, 1);
  assert.match(r.band, /admission threshold/);
});

test('ohfrs: maxes at 15 with every item', () => {
  const all = { strokeTia: true, intubation: true, hrArrival: true, spo2: true, hrWalk: true, ischemia: true, urea: true, co2: true, troponin: true, ntprobnp: true };
  assert.equal(ottawaHf(all).score, 15);
});

// ---- Light's criteria -------------------------------------------------------
test("light: exudate when a ratio exceeds threshold", () => {
  const r = lightCriteria({ pleuralProtein: 4.5, serumProtein: 6.0, pleuralLdh: 300, serumLdh: 200, serumLdhUln: 250 });
  assert.equal(r.valid, true);
  assert.equal(r.exudate, true);
  assert.equal(r.protRatio, 0.75);
  assert.equal(r.ldhRatio, 1.5);
  assert.match(r.band, /Exudate/);
});

test("light: transudate when no criterion met", () => {
  const r = lightCriteria({ pleuralProtein: 2.0, serumProtein: 7.0, pleuralLdh: 90, serumLdh: 200, serumLdhUln: 250 });
  assert.equal(r.exudate, false);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /Transudate/);
});

test("light: pleural LDH alone can classify an exudate", () => {
  // ratios low, but pleural LDH 200 > 2/3*250 = 166.7
  const r = lightCriteria({ pleuralProtein: 2.0, serumProtein: 7.0, pleuralLdh: 200, serumLdh: 900, serumLdhUln: 250 });
  assert.equal(r.exudate, true);
});

test('light: invalid on a zero denominator', () => {
  assert.equal(lightCriteria({ pleuralProtein: 4, serumProtein: 0, pleuralLdh: 100, serumLdh: 100, serumLdhUln: 250 }).valid, false);
  assert.equal(lightCriteria({}).valid, false);
});

// ---- Baux / revised Baux ----------------------------------------------------
test('baux: age + %TBSA', () => {
  const r = bauxScore({ age: 40, tbsa: 30 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 70);
  assert.equal(r.abnormal, false);
});

test('baux: >= 100 flags historically fatal band', () => {
  const r = bauxScore({ age: 70, tbsa: 40 });
  assert.equal(r.score, 110);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /fatal/);
});

test('revised-baux: adds 17 for inhalation injury and reports classic', () => {
  const r = revisedBaux({ age: 40, tbsa: 30, inhalation: true });
  assert.equal(r.score, 87);
  assert.equal(r.classic, 70);
  assert.match(r.detail, /17 \(inhalation injury\)/);
});

test('revised-baux: no inhalation matches classic Baux', () => {
  const r = revisedBaux({ age: 50, tbsa: 20, inhalation: false });
  assert.equal(r.score, 70);
  assert.equal(r.classic, 70);
});

test('revised-baux: LD50 band around 130-140', () => {
  const r = revisedBaux({ age: 80, tbsa: 50, inhalation: false });
  assert.equal(r.score, 130);
  assert.match(r.band, /LD50/);
});

test('baux/revised: invalid without inputs', () => {
  assert.equal(bauxScore({}).valid, false);
  assert.equal(revisedBaux({ age: 40 }).valid, false);
});
