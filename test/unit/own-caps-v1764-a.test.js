// spec-v1764: spec-v1763 widened the lib/bounds.js envelopes to sit past values verified in survivors, but these
// tools kept their own narrower plausibility caps and still refused a survived value. Each now caps at the envelope,
// so a value between the old cap and the envelope answers, and one just past the envelope is still refused.
import test from 'node:test';
import assert from 'node:assert/strict';

import { anc, cciPlatelet } from '../../lib/clinical-v6.js';
import { abicScore } from '../../lib/liver-v196.js';
import { clifcAd, hepamet, agile3plus } from '../../lib/hepatology-gibleed-v201.js';
import { airScore, adultAppendicitis } from '../../lib/ed-decision-v218.js';
import { durieSalmon } from '../../lib/heme-prognostic-v216.js';
import { halp } from '../../lib/inflam-v267.js';
import { lods, oasis, deltaGap } from '../../lib/critcare-severity-v200.js';

test('anc: a WBC of 1500 x10^3/uL (old cap 500) answers; 2001 is refused', () => {
  assert.equal(anc({ wbc: 1500, segs: 60, bands: 5 }).anc, 975000);
  assert.throws(() => anc({ wbc: 2001, segs: 60, bands: 5 }), RangeError);
});

test('cci-platelet: a platelet count of 3500 (old cap 3000) answers; 4001 is refused', () => {
  const ex = { prePlt: 10, postPlt: 40, bsaM2: 1.8, doseE11: 3.0 };
  assert.equal(typeof cciPlatelet({ ...ex, postPlt: 3500 }).cci, 'number');
  assert.equal(typeof cciPlatelet({ ...ex, prePlt: 3500, postPlt: 3600 }).cci, 'number');
  assert.throws(() => cciPlatelet({ ...ex, postPlt: 4001 }), RangeError);
});

test('abic: a creatinine of 60 mg/dL (old cap 40) answers; 75.5 is refused', () => {
  const ex = { age: 50, bilirubin: 8, creatinine: 1.0, inr: 1.5 };
  assert.equal(abicScore({ ...ex, creatinine: 60 }).valid, true);
  assert.equal(abicScore({ ...ex, creatinine: 75 }).valid, true);
  assert.equal(abicScore({ ...ex, creatinine: 75.5 }).valid, false);
});

test('clif-c-ad: creatinine 60 (old cap 40), WBC 1500 (old cap 500), sodium 205 and 88 (old 100 to 180) answer', () => {
  const ex = { age: 65, creatinine: 2.0, inr: 1.6, wbc: 12, sodium: 128 };
  for (const [k, v] of [['creatinine', 60], ['wbc', 1500], ['sodium', 205], ['sodium', 88]]) {
    assert.equal(clifcAd({ ...ex, [k]: v }).valid, true, `${k} ${v}`);
  }
  for (const [k, v] of [['creatinine', 75.5], ['wbc', 2001], ['sodium', 211], ['sodium', 84]]) {
    assert.equal(clifcAd({ ...ex, [k]: v }).valid, false, `${k} ${v}`);
  }
  assert.equal(clifcAd(ex).score, 70);
});

test('hepamet: a platelet count of 3500 (old cap 3000) answers; 4001 is refused', () => {
  const ex = { age: 68, sex: 'male', ast: 90, albumin: 3.5, platelets: 120, diabetes: true };
  assert.equal(hepamet({ ...ex, platelets: 3500 }).valid, true);
  assert.equal(hepamet({ ...ex, platelets: 4001 }).valid, false);
});

test('agile 3+: a platelet count of 3500 (old cap 3000) answers; 4001 is refused', () => {
  const ex = { lsm: 12, ast: 50, alt: 40, platelets: 180, age: 60, sex: 'male', diabetes: true };
  assert.equal(agile3plus({ ...ex, platelets: 3500 }).valid, true);
  assert.equal(agile3plus({ ...ex, platelets: 4001 }).valid, false);
});

test('air and adult appendicitis: a WBC of 1500 x10^9/L (old cap 1000) answers; 2001 is refused', () => {
  const air = { vomiting: true, rifPain: true, rebound: '2', fever: true, wbc: 16, pmnPct: 86, crp: 60 };
  assert.equal(airScore({ ...air, wbc: 1500 }).score, 11);
  assert.equal(airScore({ ...air, wbc: 2001 }).valid, false);
  const aas = { rlqPain: true, relocation: true, tenderness: true, age: 55, guarding: '4', wbc: 15, pmnPct: 84, crp: 100 };
  assert.equal(adultAppendicitis({ ...aas, wbc: 1500 }).valid, true);
  assert.equal(adultAppendicitis({ ...aas, wbc: 2001 }).valid, false);
});

test('durie-salmon: a creatinine of 60 mg/dL (old cap 50) answers as subclass B; 75.5 is refused', () => {
  const base = { hemoglobin: 7, calcium: 10, boneLesions: 4, mProtein: '2', creatinine: 1.0 };
  assert.equal(durieSalmon({ ...base, creatinine: 60 }).stage, 'IIIB');
  assert.equal(durieSalmon({ ...base, creatinine: 75.5 }).valid, false);
});

test('halp: a platelet count of 3500 (old cap 3000) answers; 4001 is refused', () => {
  const ex = { hgb: 140, albumin: 40, alc: 2.0, plt: 250 };
  assert.equal(halp({ ...ex, plt: 3500 }).score, 3.2);
  assert.equal(halp({ ...ex, plt: 4001 }).valid, false);
});

test('lods: creatinine 60, WBC 1500, platelets 3500, heart rate 400, SBP 400 (old caps 40/500/3000/350/350) answer', () => {
  const ex = { gcs: 13, hr: 80, sbp: 120, bun: 30, creatinine: 1.0, urineL: 1.5, wbc: 8, platelets: 200, bilirubin: 1 };
  for (const [k, v] of [['creatinine', 60], ['wbc', 1500], ['platelets', 3500], ['hr', 400], ['sbp', 400]]) {
    assert.equal(lods({ ...ex, [k]: v }).valid, true, `${k} ${v}`);
  }
  for (const [k, v] of [['creatinine', 75.5], ['wbc', 2001], ['platelets', 4001], ['hr', 601], ['sbp', 501]]) {
    assert.equal(lods({ ...ex, [k]: v }).valid, false, `${k} ${v}`);
  }
  assert.equal(lods(ex).score, 4);
});

test('oasis: a heart rate of 400 (old cap 350) answers; 601 is refused', () => {
  const oa = { preIcuHours: 12, age: 60, gcs: 14, hr: 100, map: 70, rr: 20, temp: 37, urine: 1500, mechVent: false, elective: false };
  assert.notEqual(oasis({ ...oa, hr: 400 }).valid, false);
  assert.equal(oasis({ ...oa, hr: 601 }).valid, false);
});

test('delta gap: a sodium of 205 (old ceiling 200) answers; 211 is refused', () => {
  assert.notEqual(deltaGap({ na: 205, cl: 150, hco3: 20 }).valid, false);
  assert.equal(deltaGap({ na: 211, cl: 150, hco3: 20 }).valid, false);
});
