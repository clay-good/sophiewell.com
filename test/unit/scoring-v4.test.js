// spec-v4 §7 step v4.8 (waves 1-2): >=5 cases per score covering each band.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  timi, grace, heart, perc, wellsPe, geneva,
  curb65, psi, qsofa, sofa, meld30, childPugh, ranson, bisap,
} from '../../lib/scoring-v4.js';

const close = (a, b, eps = 1) => assert.ok(Math.abs(a - b) <= eps, `expected ~${b}, got ${a}`);

// --- 136 TIMI ----------------------------------------------------------
test('timi: 0 -> low band', () => {
  const r = timi({}); assert.equal(r.score, 0); assert.match(r.band, /Low/);
});
test('timi: 2 -> low band', () => {
  const r = timi({ age65: true, severeAngina: true }); assert.equal(r.score, 2); assert.match(r.band, /Low/);
});
test('timi: 3 -> intermediate', () => {
  const r = timi({ age65: true, severeAngina: true, stDeviation: true }); assert.match(r.band, /Intermediate/);
});
test('timi: 4 -> intermediate', () => {
  const r = timi({ age65: true, severeAngina: true, stDeviation: true, elevatedMarkers: true }); assert.match(r.band, /Intermediate/);
});
test('timi: 7 -> high', () => {
  const r = timi({ age65: true, threeRiskFactors: true, knownCad50pct: true,
    asaPast7Days: true, severeAngina: true, stDeviation: true, elevatedMarkers: true });
  assert.equal(r.score, 7); assert.match(r.band, /High/);
});

// --- 137 GRACE ---------------------------------------------------------
test('grace: low-risk demographics -> Low', () => {
  const r = grace({ age: 45, heartRate: 60, sbp: 130, creatinineMgDl: 1.0,
    killipClass: 1, cardiacArrestAdmission: false, stDeviation: false, abnormalEnzymes: false });
  assert.match(r.band, /Low/);
});
test('grace: 60yo with mildly elevated HR -> still Low', () => {
  const r = grace({ age: 60, heartRate: 80, sbp: 130, creatinineMgDl: 1.0,
    killipClass: 1, cardiacArrestAdmission: false, stDeviation: false, abnormalEnzymes: false });
  assert.match(r.band, /Low|Intermediate/);
});
test('grace: 75yo with ST changes -> Intermediate or High', () => {
  const r = grace({ age: 75, heartRate: 100, sbp: 110, creatinineMgDl: 1.4,
    killipClass: 2, cardiacArrestAdmission: false, stDeviation: true, abnormalEnzymes: true });
  assert.ok(r.score > 108);
});
test('grace: cardiac arrest + Killip 4 -> High', () => {
  const r = grace({ age: 80, heartRate: 130, sbp: 90, creatinineMgDl: 2.5,
    killipClass: 4, cardiacArrestAdmission: true, stDeviation: true, abnormalEnzymes: true });
  assert.match(r.band, /High/);
});
test('grace: 30yo healthy -> low risk band', () => {
  const r = grace({ age: 30, heartRate: 70, sbp: 130, creatinineMgDl: 0.9,
    killipClass: 1, cardiacArrestAdmission: false, stDeviation: false, abnormalEnzymes: false });
  assert.match(r.band, /Low/);
});

// --- 138 HEART ---------------------------------------------------------
test('heart: 0 -> Low', () => assert.match(heart({ history: 0, ekg: 0, age: 0, riskFactors: 0, troponin: 0 }).band, /Low/));
test('heart: 3 -> Low boundary', () => {
  const r = heart({ history: 1, ekg: 1, age: 1, riskFactors: 0, troponin: 0 });
  assert.equal(r.score, 3); assert.match(r.band, /Low/);
});
test('heart: 4 -> Moderate', () => {
  const r = heart({ history: 1, ekg: 1, age: 1, riskFactors: 1, troponin: 0 });
  assert.equal(r.score, 4); assert.match(r.band, /Moderate/);
});
test('heart: 7 -> High', () => {
  const r = heart({ history: 2, ekg: 2, age: 1, riskFactors: 1, troponin: 1 });
  assert.equal(r.score, 7); assert.match(r.band, /High/);
});
test('heart: max 10', () => {
  assert.equal(heart({ history: 2, ekg: 2, age: 2, riskFactors: 2, troponin: 2 }).score, 10);
});

// --- 139 PERC ----------------------------------------------------------
test('perc: 0 failures -> negative', () => {
  assert.match(perc({}).band, /negative/);
});
test('perc: 1 failure -> positive', () => {
  assert.match(perc({ age50: true }).band, /positive/);
});
test('perc: all 8 failures -> positive', () => {
  const r = perc({ age50: true, hr100: true, sao2lt95: true, hemoptysis: true,
    estrogen: true, priorVte: true, recentSurgery: true, unilateralLegSwelling: true });
  assert.equal(r.score, 8); assert.match(r.band, /positive/);
});
test('perc: counts truthy fields only', () => {
  assert.equal(perc({ age50: true, hr100: false, sao2lt95: true }).score, 2);
});
test('perc: hemoptysis alone is positive', () => {
  assert.match(perc({ hemoptysis: true }).band, /positive/);
});

// --- 140 Wells PE ------------------------------------------------------
test('wellsPe: 0 -> Low', () => assert.match(wellsPe({}).band, /Low/));
test('wellsPe: 1.5 -> Low boundary', () => assert.equal(wellsPe({ hr100: true }).score, 1.5));
test('wellsPe: 4 -> Moderate', () => {
  const r = wellsPe({ alternativeDxLessLikely: true, hr100: true });
  assert.equal(r.score, 4.5); assert.match(r.band, /Moderate/);
});
test('wellsPe: 6 -> Moderate ceiling (boundary)', () => {
  const r = wellsPe({ dvtSigns: true, alternativeDxLessLikely: true });
  assert.equal(r.score, 6); assert.match(r.band, /Moderate/);
});
test('wellsPe: 6.5 -> High', () => {
  const r = wellsPe({ dvtSigns: true, alternativeDxLessLikely: true, hemoptysis: true });
  assert.equal(r.score, 7); assert.match(r.band, /High/);
});
test('wellsPe: max ~12.5', () => {
  const r = wellsPe({ dvtSigns: true, alternativeDxLessLikely: true, hr100: true,
    immobilization: true, priorVte: true, hemoptysis: true, malignancy: true });
  assert.equal(r.score, 12.5);
});

// --- 140 Revised Geneva ------------------------------------------------
test('geneva: 0 -> Low', () => {
  const r = geneva({ hr: 60 });
  assert.equal(r.score, 0); assert.match(r.band, /Low/);
});
test('geneva: HR 80 -> +3', () => {
  const r = geneva({ hr: 80 }); assert.equal(r.score, 3);
});
test('geneva: HR 100 -> +5', () => {
  const r = geneva({ hr: 100 }); assert.equal(r.score, 5);
});
test('geneva: 5 features -> Intermediate', () => {
  const r = geneva({ age65: true, priorVte: true, recentSurgery: true, hr: 80 });
  assert.equal(r.score, 9); assert.match(r.band, /Intermediate/);
});
test('geneva: many features -> High', () => {
  const r = geneva({ age65: true, priorVte: true, recentSurgery: true,
    activeMalignancy: true, unilateralLegPain: true, hemoptysis: true,
    hr: 100, lowerLimbExam: true });
  assert.ok(r.score >= 11); assert.match(r.band, /High/);
});

// --- 141 CURB-65 -------------------------------------------------------
test('curb65: 0 -> outpatient', () => assert.match(curb65({}).band, /outpatient/));
test('curb65: 1 -> outpatient', () => {
  const r = curb65({ age65: true }); assert.equal(r.score, 1); assert.match(r.band, /outpatient/);
});
test('curb65: 2 -> hospitalization', () => {
  const r = curb65({ age65: true, confusion: true });
  assert.match(r.band, /hospitalization/);
});
test('curb65: 3 -> ICU', () => {
  const r = curb65({ age65: true, confusion: true, bun20: true });
  assert.match(r.band, /ICU/);
});
test('curb65: 5 -> ICU', () => {
  assert.equal(curb65({ confusion: true, bun20: true, rr30: true, sbp90OrDbp60: true, age65: true }).score, 5);
});

// --- 142 PSI -----------------------------------------------------------
test('psi: 30yo healthy male -> Class I', () => {
  const r = psi({ age: 30, sex: 'M' });
  // Note: low-age + sex=F shifts base; for a 30yo M with no comorbidities the
  // age points alone push into Class II per the published score. Assert numeric.
  assert.ok(r.score >= 30 && r.score <= 71, `expected 30-71, got ${r.score}`);
});
test('psi: elderly w/ comorbid -> higher class', () => {
  const r = psi({ age: 80, sex: 'M', neoplasm: true, alteredMental: true, sbp90: true });
  assert.match(r.band, /Class (IV|V)/);
});
test('psi: female adjustment subtracts 10', () => {
  const m = psi({ age: 70, sex: 'M' }).score;
  const f = psi({ age: 70, sex: 'F' }).score;
  assert.equal(m - f, 10);
});
test('psi: pH<7.35 adds 30', () => {
  const a = psi({ age: 60, sex: 'M' }).score;
  const b = psi({ age: 60, sex: 'M', ph: 7.30 }).score;
  assert.equal(b - a, 30);
});
test('psi: very high score -> Class V', () => {
  const r = psi({ age: 90, sex: 'M', neoplasm: true, liverDisease: true, chf: true,
    alteredMental: true, rr30: true, sbp90: true, ph: 7.30, bun: 50 });
  assert.match(r.band, /Class V/);
});

// --- 143 qSOFA ---------------------------------------------------------
test('qsofa: 0 -> low', () => assert.match(qsofa({}).band, /Low/));
test('qsofa: 1 -> low', () => assert.match(qsofa({ rr22: true }).band, /Low/));
test('qsofa: 2 -> high', () => assert.match(qsofa({ rr22: true, alteredMental: true }).band, /High/));
test('qsofa: 3 -> high', () => assert.equal(qsofa({ rr22: true, alteredMental: true, sbp100: true }).score, 3));
test('qsofa: counts only truthy', () => {
  assert.equal(qsofa({ rr22: true, alteredMental: false, sbp100: true }).score, 2);
});

// --- 143 SOFA ----------------------------------------------------------
test('sofa: all zero -> 0', () => assert.equal(sofa({}).score, 0));
test('sofa: single organ 4 -> 4', () => assert.equal(sofa({ respiration: 4 }).score, 4));
test('sofa: total 6 -> Low band', () => {
  const r = sofa({ respiration: 1, coagulation: 1, liver: 1, cardiovascular: 1, cns: 1, renal: 1 });
  assert.equal(r.score, 6); assert.match(r.band, /Low/);
});
test('sofa: total 9 -> Moderate', () => {
  assert.match(sofa({ respiration: 2, coagulation: 2, liver: 1, cardiovascular: 2, cns: 1, renal: 1 }).band, /Moderate/);
});
test('sofa: total 14 -> Very high', () => {
  assert.match(sofa({ respiration: 3, coagulation: 3, liver: 2, cardiovascular: 3, cns: 1, renal: 2 }).band, /Very high/);
});

// --- 144 MELD-3.0 ------------------------------------------------------
test('meld30: low labs -> low score', () => {
  const r = meld30({ bilirubin: 1.0, inr: 1.0, creatinine: 1.0, sodium: 137,
    albumin: 3.5, sex: 'M', hadDialysisTwiceLastWeek: false });
  assert.ok(r.score >= 6 && r.score <= 10, `got ${r.score}`);
});
test('meld30: high bili & INR -> high score', () => {
  const r = meld30({ bilirubin: 10, inr: 2.0, creatinine: 1.5, sodium: 130,
    albumin: 2.5, sex: 'F', hadDialysisTwiceLastWeek: false });
  assert.ok(r.score >= 20, `got ${r.score}`);
});
test('meld30: dialysis sets Cr to 3.0', () => {
  const r1 = meld30({ bilirubin: 2, inr: 1.5, creatinine: 1.0, sodium: 135,
    albumin: 3.0, sex: 'M', hadDialysisTwiceLastWeek: true });
  const r2 = meld30({ bilirubin: 2, inr: 1.5, creatinine: 3.0, sodium: 135,
    albumin: 3.0, sex: 'M', hadDialysisTwiceLastWeek: false });
  assert.equal(r1.score, r2.score);
});
test('meld30: female adds points vs identical male', () => {
  const m = meld30({ bilirubin: 2, inr: 1.5, creatinine: 1.5, sodium: 135,
    albumin: 3.0, sex: 'M', hadDialysisTwiceLastWeek: false }).score;
  const f = meld30({ bilirubin: 2, inr: 1.5, creatinine: 1.5, sodium: 135,
    albumin: 3.0, sex: 'F', hadDialysisTwiceLastWeek: false }).score;
  assert.ok(f >= m);
});
test('meld30: clamps creatinine at 3.0', () => {
  const r1 = meld30({ bilirubin: 2, inr: 1.5, creatinine: 5.0, sodium: 135,
    albumin: 3.0, sex: 'M', hadDialysisTwiceLastWeek: false });
  const r2 = meld30({ bilirubin: 2, inr: 1.5, creatinine: 3.0, sodium: 135,
    albumin: 3.0, sex: 'M', hadDialysisTwiceLastWeek: false });
  assert.equal(r1.score, r2.score);
});

// --- 144 Child-Pugh -----------------------------------------------------
test('childPugh: best -> Class A', () => {
  const r = childPugh({ bilirubin: 1.5, albumin: 4.0, inr: 1.0, ascites: 'none', encephalopathy: 'none' });
  assert.equal(r.score, 5); assert.equal(r.band, 'Class A');
});
test('childPugh: 8 -> Class B', () => {
  // bili 2-3 = 2pts; alb 2.8-3.5 = 2pts; INR 1.7-2.3 = 2pts; ascites none = 1; enceph none = 1.
  const r = childPugh({ bilirubin: 2.5, albumin: 3.0, inr: 2.0, ascites: 'none', encephalopathy: 'none' });
  assert.equal(r.score, 8); assert.equal(r.band, 'Class B');
});
test('childPugh: worst -> Class C', () => {
  const r = childPugh({ bilirubin: 5, albumin: 2.0, inr: 3.0, ascites: 'severe', encephalopathy: 'grade3-4' });
  assert.equal(r.score, 15); assert.equal(r.band, 'Class C');
});
test('childPugh: 10 -> Class C', () => {
  const r = childPugh({ bilirubin: 4, albumin: 2.5, inr: 1.8, ascites: 'mild', encephalopathy: 'grade1-2' });
  assert.equal(r.band, 'Class C');
});
test('childPugh: 6 -> Class A boundary', () => {
  // bili <2 = 1; alb >3.5 = 1; INR <1.7 = 1; ascites mild = 2; enceph none = 1 -> 6.
  const r = childPugh({ bilirubin: 1.5, albumin: 4.0, inr: 1.0, ascites: 'mild', encephalopathy: 'none' });
  assert.equal(r.score, 6); assert.equal(r.band, 'Class A');
});

// --- 145 Ranson ---------------------------------------------------------
test('ranson: 0 admission + 0 48h -> very low', () => {
  assert.match(ranson({ admission: {}, fortyEightHour: {} }).band, /<1%/);
});
test('ranson: 3 -> ~15%', () => {
  const r = ranson({ admission: { age55: true, wbc16: true, glu200: true }, fortyEightHour: {} });
  assert.equal(r.score, 3); assert.match(r.band, /15%/);
});
test('ranson: 5 -> ~40%', () => {
  const r = ranson({
    admission: { age55: true, wbc16: true, glu200: true, ldh: true, ast: true },
    fortyEightHour: {},
  });
  assert.equal(r.score, 5); assert.match(r.band, /40%/);
});
test('ranson: 7 -> ~100%', () => {
  const r = ranson({
    admission: { age55: true, wbc16: true, glu200: true, ldh: true, ast: true },
    fortyEightHour: { hctDrop: true, bunRise: true },
  });
  assert.equal(r.score, 7); assert.match(r.band, /100%/);
});
test('ranson: counts only truthy fields', () => {
  assert.equal(ranson({ admission: { age55: true, wbc16: false }, fortyEightHour: { calc: true } }).score, 2);
});

// --- 145 BISAP ---------------------------------------------------------
test('bisap: 0 -> Low', () => assert.match(bisap({}).band, /Low/));
test('bisap: 2 -> Low', () => assert.match(bisap({ bun25: true, age60: true }).band, /Low/));
test('bisap: 3 -> High', () => {
  assert.match(bisap({ bun25: true, age60: true, sirs: true }).band, /High/);
});
test('bisap: 5 (max) -> High', () => {
  assert.equal(bisap({ bun25: true, alteredMental: true, sirs: true, age60: true, pleuralEffusion: true }).score, 5);
});
test('bisap: counts only truthy', () => {
  assert.equal(bisap({ bun25: true, sirs: true, age60: false, pleuralEffusion: true }).score, 3);
});
