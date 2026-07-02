// spec-v202 2.3: MECKI score worked examples. Logistic LP = 10.3464
// - 0.0262*ppVO2 + 0.0472*(VE/VCO2) - 0.1086*Hb - 0.0615*Na - 0.0699*LVEF
// - 0.0136*eGFR; score = 100/(1+e^-LP). Coefficients spec-v97 cross-verified
// against the original paper PDF and validation reproductions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mecki } from '../../lib/cvrisk-engines-v202.js';

test('high-risk HF profile -> elevated 2-year risk (worked example)', () => {
  const r = mecki({ hb: 10, sodium: 132, lvef: 25, ppvo2: 40, veco2: 40, egfr: 45 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 40.7);
  assert.equal(r.abnormal, true);
});

test('near-normal profile -> low 2-year risk', () => {
  const r = mecki({ hb: 14, sodium: 140, lvef: 60, ppvo2: 100, veco2: 25, egfr: 90 });
  assert.equal(r.score, 0.1);
  assert.equal(r.abnormal, false);
});

test('mid profile -> intermediate range', () => {
  const r = mecki({ hb: 12, sodium: 138, lvef: 35, ppvo2: 60, veco2: 32, egfr: 70 });
  assert.equal(r.score, 5.2);
});

test('score matches the verbatim published coefficients', () => {
  const hb = 12, na = 138, lvef = 35, ppvo2 = 60, veco2 = 32, egfr = 70;
  const lp = 10.3464 - 0.0262 * ppvo2 + 0.0472 * veco2 - 0.1086 * hb - 0.0615 * na - 0.0699 * lvef - 0.0136 * egfr;
  const expected = Math.round((1 / (1 + Math.exp(-lp))) * 100 * 10) / 10;
  assert.equal(mecki({ hb, sodium: na, lvef, ppvo2, veco2, egfr }).score, expected);
});

test('incomplete inputs -> complete-the-fields', () => {
  const r = mecki({ hb: 12, sodium: 138 });
  assert.equal(r.valid, false);
  assert.match(r.message, /peak VO/);
});

test('risk stays within 0..100%', () => {
  const r = mecki({ hb: 5, sodium: 120, lvef: 10, ppvo2: 8, veco2: 90, egfr: 8 });
  assert.ok(r.score >= 0 && r.score <= 100);
});
