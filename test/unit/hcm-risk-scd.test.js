// spec-v209 2.1: HCM Risk-SCD worked examples. 5-year SCD prob =
// 1 - 0.998^exp(PI); ESC bands <4% low / 4-6% intermediate / >=6% high.
// Coefficients spec-v97 cross-verified (O'Mahony 2014 + ESC/Medscape/QxMD).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hcmRiskScd as hcm } from '../../lib/cardiology-risk-v209.js';

test('high-risk worked example (7.35%)', () => {
  const r = hcm({ age: 40, wallThickness: 25, laDiameter: 45, lvotGradient: 50, nsvt: true });
  assert.equal(r.valid, true);
  assert.equal(r.score, 7.35);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high/);
});

test('low-risk case (< 4%)', () => {
  const r = hcm({ age: 45, wallThickness: 20, laDiameter: 42, lvotGradient: 30 });
  assert.equal(r.score, 2.23);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low/);
});

test('intermediate band (4-6%)', () => {
  const r = hcm({ age: 45, wallThickness: 22, laDiameter: 44, lvotGradient: 30, syncope: true });
  assert.equal(r.score, 5.1);
  assert.match(r.band, /intermediate/);
});

test('matches the published prognostic-index formula', () => {
  const age = 50, mwt = 24, la = 46, lvot = 40;
  const pi = 0.15939858 * mwt - 0.00294271 * mwt * mwt + 0.0259082 * la + 0.00446131 * lvot - 0.01799934 * age;
  const expected = Math.round((1 - Math.pow(0.998, Math.exp(pi))) * 100 * 100) / 100;
  assert.equal(hcm({ age, wallThickness: mwt, laDiameter: la, lvotGradient: lvot }).score, expected);
});

test('the three risk factors each raise the estimate', () => {
  const base = { age: 45, wallThickness: 22, laDiameter: 44, lvotGradient: 30 };
  const b = hcm(base).score;
  assert.ok(hcm({ ...base, fhxScd: true }).score > b);
  assert.ok(hcm({ ...base, nsvt: true }).score > b);
  assert.ok(hcm({ ...base, syncope: true }).score > b);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = hcm({ age: 40, wallThickness: 25 });
  assert.equal(r.valid, false);
});
