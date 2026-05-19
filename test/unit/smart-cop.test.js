// spec-v13 §3.7.1 wave 13-7: SMART-COP boundary examples per
// Charles PGP, et al. Clin Infect Dis. 2008;47(3):375-384.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { smartCop } from '../../lib/scoring-v4.js';

test('smart-cop low: age 55, no criteria -> 0', () => {
  const r = smartCop({ ageYears: 55, sbpLt90: false, multilobar: false,
    albuminLt35: false, rr: 20, pao2: 90, spo2: 96, pfRatio: 400,
    hrGe125: false, confusion: false, phLt735: false });
  assert.equal(r.score, 0);
  assert.match(r.band, /low risk/);
});

test('smart-cop SBP + multilobar -> 3 (moderate)', () => {
  const r = smartCop({ ageYears: 55, sbpLt90: true, multilobar: true,
    albuminLt35: false, rr: 20, pao2: 90, spo2: 96, pfRatio: 400,
    hrGe125: false, confusion: false, phLt735: false });
  assert.equal(r.score, 3);
  assert.match(r.band, /moderate/);
});

test('smart-cop high: age 60, SBP, multilobar, RR 32, SpO2 89 -> 6 (high)', () => {
  const r = smartCop({ ageYears: 60, sbpLt90: true, multilobar: true,
    albuminLt35: false, rr: 32, spo2: 89,
    hrGe125: false, confusion: false, phLt735: false });
  assert.equal(r.score, 6);
  assert.match(r.band, /high risk/);
});

test('smart-cop age-adjusted RR threshold: age 45 + RR 26 triggers; age 60 + RR 26 does not', () => {
  const young = smartCop({ ageYears: 45, sbpLt90: false, multilobar: false,
    albuminLt35: false, rr: 26, pao2: 90, spo2: 96, pfRatio: 400,
    hrGe125: false, confusion: false, phLt735: false });
  assert.equal(young.parts.rr, 1);
  const old = smartCop({ ageYears: 60, sbpLt90: false, multilobar: false,
    albuminLt35: false, rr: 26, pao2: 90, spo2: 96, pfRatio: 400,
    hrGe125: false, confusion: false, phLt735: false });
  assert.equal(old.parts.rr, 0);
});

test('smart-cop age-adjusted oxygenation: SpO2 91 triggers at age 60 (cutoff <94 vs <90 depending)', () => {
  // age <=50: SpO2 <94 triggers; age >50: SpO2 <90 triggers.
  const young = smartCop({ ageYears: 45, sbpLt90: false, multilobar: false,
    albuminLt35: false, rr: 20, spo2: 91,
    hrGe125: false, confusion: false, phLt735: false });
  assert.equal(young.parts.oxygenation, 2);
  const old = smartCop({ ageYears: 60, sbpLt90: false, multilobar: false,
    albuminLt35: false, rr: 20, spo2: 91,
    hrGe125: false, confusion: false, phLt735: false });
  assert.equal(old.parts.oxygenation, 0);
});
