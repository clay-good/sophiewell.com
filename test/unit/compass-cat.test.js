// spec-v211 2.3: COMPASS-CAT worked examples. 8 weighted items (max 28);
// dichotomized 0-6 low/intermediate vs >=7 high. Weights + cut spec-v97
// cross-verified (Gerotziafas 2017 + external validations).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compassCat as cc } from '../../lib/heme-onc-risk-v211.js';

test('high-risk worked example (COMPASS-CAT 10)', () => {
  const r = cc({ antiHormonalAnthracycline: true, diagWithin6mo: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 10); // 6 + 4
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high 6-month VTE risk/);
});

test('low/intermediate case (0-6)', () => {
  const r = cc({ priorVte: true, advancedStage: true });
  assert.equal(r.score, 3);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low\/intermediate/);
});

test('the 7 threshold separates the risk groups', () => {
  // 5 (CV risk) + 1 (prior VTE) = 6 -> low/intermediate
  assert.equal(cc({ cvRiskFactors: true, priorVte: true }).abnormal, false);
  // + platelets (2) = 8 -> high
  assert.equal(cc({ cvRiskFactors: true, priorVte: true, platelets350: true }).abnormal, true);
});

test('maximum score 28', () => {
  const all = {};
  for (const k of ['antiHormonalAnthracycline', 'diagWithin6mo', 'cvc', 'advancedStage', 'cvRiskFactors', 'recentHospitalization', 'priorVte', 'platelets350']) all[k] = true;
  assert.equal(cc(all).score, 28);
});

test('no factors -> COMPASS-CAT 0, low/intermediate', () => {
  const r = cc({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});
