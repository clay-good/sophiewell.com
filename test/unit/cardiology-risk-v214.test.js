// spec-v214: worked examples for the cardiology risk scores. Point systems
// spec-v97 cross-verified (see module header for the per-tile source pairs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  apple, caapAf, atlas, hatch, mbLater, canadaAcs, actionIcu,
} from '../../lib/cardiology-risk-v214.js';

test('apple: sums 1-point factors', () => {
  const r = apple({ ageOver65: true, persistentAf: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 2);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /elevated recurrence/);
});
test('apple: all five factors = 5', () => {
  assert.equal(apple({ ageOver65: true, persistentAf: true, egfrLow: true, laDilated: true, efLow: true }).score, 5);
});
test('apple: zero when none', () => {
  const r = apple({});
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('caap-af: banded LA/age/AAD plus booleans', () => {
  // LA 4.2 -> 1, age 72 -> 3, AAD 1 -> 1, CAD 1, female 1 = 7
  const r = caapAf({ laDiameter: 4.2, age: 72, failedAad: 1, cad: true, female: true });
  assert.equal(r.score, 7);
  assert.equal(r.abnormal, true);
  assert.match(r.band, />= 5/);
});
test('caap-af: invalid without numeric inputs', () => {
  assert.equal(caapAf({ cad: true }).valid, false);
});
test('caap-af: low score below threshold', () => {
  const r = caapAf({ laDiameter: 3.5, age: 45, failedAad: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.abnormal, false);
});

test('atlas: LA-volume contributes 1 per 10', () => {
  // lavi 34 -> 3, age 1, female 4 = 8
  const r = atlas({ laVolumeIndex: 34, ageOver60: true, female: true });
  assert.equal(r.score, 8);
  assert.match(r.band, /intermediate/);
});
test('atlas: high band above 10', () => {
  const r = atlas({ laVolumeIndex: 20, ageOver60: true, nonParoxysmal: true, female: true, smoking: true });
  // 2 + 1 + 2 + 4 + 7 = 16
  assert.equal(r.score, 16);
  assert.match(r.band, /high/);
});
test('atlas: invalid without LA volume', () => {
  assert.equal(atlas({ female: true }).valid, false);
});

test('hatch: weighted sum', () => {
  const r = hatch({ hypertension: true, strokeTia: true });
  assert.equal(r.score, 3);
  assert.match(r.band, /higher progression/);
});
test('hatch: max 7', () => {
  assert.equal(hatch({ hypertension: true, ageOver75: true, strokeTia: true, copd: true, heartFailure: true }).score, 7);
});

test('mb-later: AF type contributes its ordinal', () => {
  const r = mbLater({ afType: 1, male: true, laLarge: true });
  assert.equal(r.score, 3);
  assert.match(r.band, />= 2/);
});
test('mb-later: invalid without AF type', () => {
  assert.equal(mbLater({ male: true }).valid, false);
});

test('canada-acs: 1 point each', () => {
  const r = canadaAcs({ ageOver75: true, sbpLow: true });
  assert.equal(r.score, 2);
  assert.match(r.band, /intermediate/);
});
test('canada-acs: max 4 high', () => {
  const r = canadaAcs({ ageOver75: true, killipOver1: true, sbpLow: true, hrHigh: true });
  assert.equal(r.score, 4);
  assert.match(r.band, /high/);
});

test('action-icu: HR/SBP bands plus HF', () => {
  // HR 105 -> 3, SBP 120 -> 3, HF -> 5 = 11
  const r = actionIcu({ heartRate: 105, sbp: 120, heartFailure: true });
  assert.equal(r.score, 11);
  assert.match(r.band, /intermediate/);
});
test('action-icu: high band >= 12', () => {
  // HR 105 -> 3, SBP 120 -> 3, HF 5, age 1 = 12
  const r = actionIcu({ heartRate: 105, sbp: 120, heartFailure: true, ageOver70: true });
  assert.equal(r.score, 12);
  assert.match(r.band, /high/);
});
test('action-icu: invalid without HR/SBP', () => {
  assert.equal(actionIcu({ ageOver70: true }).valid, false);
});
test('action-icu: mid HR/SBP bands score 1 each', () => {
  const r = actionIcu({ heartRate: 90, sbp: 130 });
  assert.equal(r.score, 2);
});
