// spec-v209 2.4: CHARGE-AF worked examples. LP with published coefficients;
// 5-year AF risk = 1 - 0.9718412736^exp(LP - 12.5815600). Coefficients +
// constants spec-v97 cross-verified (Alonso 2013 + MDCalc/johnsonfrancis).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chargeAf } from '../../lib/cardiology-risk-v209.js';

test('typical 65-year-old on antihypertensives (worked example)', () => {
  const r = chargeAf({ age: 65, white: true, height: 170, weight: 80, sbp: 130, dbp: 80, antiHtn: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 3.23);
  assert.equal(r.abnormal, false);
});

test('young healthy patient -> very low risk', () => {
  const r = chargeAf({ age: 45, white: false, height: 175, weight: 70, sbp: 120, dbp: 75 });
  assert.equal(r.score, 0.19);
});

test('high-burden patient -> elevated risk (>= 5%)', () => {
  const r = chargeAf({ age: 75, white: true, height: 168, weight: 90, sbp: 150, dbp: 85, smoker: true, antiHtn: true, diabetes: true, heartFailure: true });
  assert.equal(r.score, 32.58);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /elevated/);
});

test('matches the published formula', () => {
  const age = 60, h = 172, w = 78, sbp = 128, dbp = 78;
  const lp = 0.508 * (age / 5) + 0.465 + 0.248 * (h / 10) + 0.115 * (w / 15) + 0.197 * (sbp / 20) - 0.101 * (dbp / 10);
  const expected = Math.round((1 - Math.pow(0.9718412736, Math.exp(lp - 12.5815600))) * 100 * 100) / 100;
  assert.equal(chargeAf({ age, white: true, height: h, weight: w, sbp, dbp }).score, expected);
});

test('each comorbidity raises the estimate', () => {
  const base = { age: 65, white: true, height: 170, weight: 80, sbp: 130, dbp: 80 };
  const b = chargeAf(base).score;
  assert.ok(chargeAf({ ...base, heartFailure: true }).score > b);
  assert.ok(chargeAf({ ...base, mi: true }).score > b);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = chargeAf({ age: 65, height: 170 });
  assert.equal(r.valid, false);
});
