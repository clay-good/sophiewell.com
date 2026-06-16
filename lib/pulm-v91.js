// spec-v91 (Wave 2 of the spec-v85 Advanced Clinical Calculators program):
// five deterministic pulmonary-function / chronic-respiratory computations that
// fill the catalog's chronic-respiratory gap (it shipped the acute surface --
// aa-pf-suite, rox, curb-65, smart-cop -- but nothing for chronic staging or
// prognosis).
//
//   goldSpirometry       - GOLD spirometric COPD grade off FEV1/FVC < 0.70 + FEV1 %pred
//   bodeIndex            - BODE multidimensional COPD prognosis (0-10) + 4-yr survival
//   gapIpf               - GAP index for idiopathic pulmonary fibrosis + stage mortality
//   predictedSpirometry  - GLI-2012 predicted FEV1/FVC/ratio + 5th-percentile LLN
//   mmrcDyspnea          - modified MRC dyspnea grade 0-4 with its descriptor
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v17.js wire these to the home grid.
// Every function takes a single destructured object so the spec-v59 fuzz
// harness can drive each field through its adversarial matrix; every division
// is domain-guarded so no non-finite value reaches a returned string (spec-v59).
// r1/r2 come from lib/num.js (spec-v53 §4.1). The GLI-2012 coefficient + spline
// sets are compiled constants in lib/gli-2012-data.js (spec-v85 §5: a compiled
// constant set, NOT a data/ dataset). None authors a management order in
// Sophie's voice (spec-v11 §5.3) -- each surfaces the computation and the cited
// source's own grade / band / mortality estimate.

import { r1, r2 } from './num.js';
import { GLI2012 } from './gli-2012-data.js';

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is
// treated as "not provided" rather than throwing, so optional fields are safe.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
// Strictly-positive finite or null (a value we can divide by / take a log of).
const pos = (v) => { const f = fin(v); return f != null && f > 0 ? f : null; };
// Clamp a finite value into [lo, hi]; null stays null.
const clamp = (v, lo, hi) => (v == null ? null : Math.min(hi, Math.max(lo, v)));

// --- 2.1 goldSpirometry - GOLD spirometric classification of COPD ------------
// Obstruction is present when post-bronchodilator FEV1/FVC < 0.70; the GOLD
// grade then comes off FEV1 %predicted (1: >= 80; 2: 50-79; 3: 30-49; 4: < 30).
// The ratio may be entered directly (range-checked to (0, 1]) or computed from
// FEV1(L)/FVC(L) when both volumes are given (FVC > 0 guard). Without
// obstruction no spirometric grade is assigned (the source's own rule).
const GOLD_GRADE = {
  1: 'GOLD 1 - mild (FEV1 >= 80% predicted)',
  2: 'GOLD 2 - moderate (FEV1 50-79% predicted)',
  3: 'GOLD 3 - severe (FEV1 30-49% predicted)',
  4: 'GOLD 4 - very severe (FEV1 < 30% predicted)',
};
export function goldSpirometry({ fev1Pct, ratio, fev1L, fvcL } = {}) {
  // Ratio: direct entry wins (range-checked); else compute from volumes.
  let rr = fin(ratio);
  if (rr != null && (rr <= 0 || rr > 1)) rr = null;
  if (rr == null) {
    const fv = pos(fvcL);
    const f1 = fin(fev1L);
    rr = (fv != null && f1 != null && f1 >= 0) ? f1 / fv : null;
  }
  if (rr == null) {
    return {
      valid: false,
      band: 'Enter the post-bronchodilator FEV1/FVC ratio (0-1), or the FEV1 and FVC in litres to compute it.',
      note: 'GOLD: obstruction is present when post-bronchodilator FEV1/FVC < 0.70; the spirometric grade then comes off FEV1 %predicted.',
    };
  }
  const obstruction = rr < 0.70;
  const ratioR = r2(rr);
  if (!obstruction) {
    return {
      valid: true,
      obstruction: false,
      ratio: ratioR,
      grade: null,
      band: `FEV1/FVC ${ratioR} >= 0.70: no obstruction; a GOLD spirometric grade is not assigned.`,
      note: 'A post-bronchodilator FEV1/FVC ratio at or above 0.70 does not meet the GOLD spirometric definition of obstruction, so no GOLD grade applies. Restriction and other patterns need the full PFT and clinical context.',
    };
  }
  const pct = fin(fev1Pct);
  if (pct == null) {
    return {
      valid: true,
      obstruction: true,
      ratio: ratioR,
      grade: null,
      band: `Obstruction present (FEV1/FVC ${ratioR} < 0.70); enter FEV1 %predicted to assign the GOLD grade.`,
      note: 'GOLD grade requires FEV1 %predicted: 1 (>= 80%), 2 (50-79%), 3 (30-49%), 4 (< 30%). The predicted-spirometry tile computes FEV1 %predicted from the GLI-2012 reference.',
    };
  }
  let grade;
  if (pct >= 80) grade = 1;
  else if (pct >= 50) grade = 2;
  else if (pct >= 30) grade = 3;
  else grade = 4;
  const pctR = r1(pct);
  return {
    valid: true,
    obstruction: true,
    ratio: ratioR,
    fev1Pct: pctR,
    grade,
    gradeLabel: GOLD_GRADE[grade],
    band: `Obstruction present (FEV1/FVC ${ratioR} < 0.70); ${GOLD_GRADE[grade]} at FEV1 ${pctR}% predicted.`,
    note: 'GOLD spirometric grade off post-bronchodilator FEV1 %predicted: 1 (>= 80%), 2 (50-79%), 3 (30-49%), 4 (< 30%), assigned only when FEV1/FVC < 0.70. The grade is the spirometric severity; the GOLD ABE group that drives pharmacotherapy also weighs symptoms (mMRC/CAT) and exacerbation history and is a clinician decision.',
  };
}

// --- 2.2 bodeIndex - multidimensional COPD prognosis (Celli 2004) ------------
// A four-variable point sum (0-10): Body-mass index, airflow Obstruction
// (FEV1 %pred), Dyspnea (mMRC), Exercise capacity (6MWD). The mMRC grade is
// clamped to its 0-4 domain so a stray value can never index an undefined
// point. All four variables are required before a total/quartile is reported.
const BODE_SURVIVAL = {
  '0-2': '~80% approximate 4-year survival (Celli 2004 quartile 1)',
  '3-4': '~67% approximate 4-year survival (Celli 2004 quartile 2)',
  '5-6': '~57% approximate 4-year survival (Celli 2004 quartile 3)',
  '7-10': '~18% approximate 4-year survival (Celli 2004 quartile 4)',
};
export function bodeIndex({ bmi, fev1Pct, mmrc, sixMwd } = {}) {
  const b = pos(bmi);
  const f = fin(fev1Pct);
  const mRaw = fin(mmrc);
  const w = fin(sixMwd);
  if (b == null || f == null || mRaw == null || w == null) {
    return {
      valid: false,
      band: 'Enter all four: BMI, FEV1 %predicted, mMRC dyspnea grade (0-4), and 6-minute walk distance (m).',
      note: 'BODE = BMI (<= 21 = 1) + airflow obstruction (FEV1% >= 65 = 0, 50-64 = 1, 36-49 = 2, <= 35 = 3) + dyspnea (mMRC 0-1 = 0, 2 = 1, 3 = 2, 4 = 3) + exercise (6MWD >= 350 = 0, 250-349 = 1, 150-249 = 2, <= 149 = 3).',
    };
  }
  const m = clamp(Math.round(mRaw), 0, 4);
  const bmiPts = b <= 21 ? 1 : 0;
  let obsPts;
  if (f >= 65) obsPts = 0; else if (f >= 50) obsPts = 1; else if (f >= 36) obsPts = 2; else obsPts = 3;
  let dysPts;
  if (m <= 1) dysPts = 0; else if (m === 2) dysPts = 1; else if (m === 3) dysPts = 2; else dysPts = 3;
  const wC = Math.max(0, w);
  let exPts;
  if (wC >= 350) exPts = 0; else if (wC >= 250) exPts = 1; else if (wC >= 150) exPts = 2; else exPts = 3;

  const total = bmiPts + obsPts + dysPts + exPts;
  let bandKey;
  if (total <= 2) bandKey = '0-2'; else if (total <= 4) bandKey = '3-4'; else if (total <= 6) bandKey = '5-6'; else bandKey = '7-10';

  return {
    valid: true,
    total,
    bmiPts,
    obsPts,
    dysPts,
    exPts,
    mmrcUsed: m,
    survivalBand: bandKey,
    survival: BODE_SURVIVAL[bandKey],
    band: `BODE index ${total} of 10 (quartile ${bandKey}): ${BODE_SURVIVAL[bandKey]}.`,
    note: 'BODE points: BMI <= 21 = 1 (else 0); FEV1 %pred >= 65 = 0, 50-64 = 1, 36-49 = 2, <= 35 = 3; mMRC 0-1 = 0, 2 = 1, 3 = 2, 4 = 3; 6MWD >= 350 m = 0, 250-349 = 1, 150-249 = 2, <= 149 = 3. The approximate 4-year survival is the Celli 2004 quartile estimate, not an individual prognosis.',
  };
}

// --- 2.3 gapIpf - GAP index for idiopathic pulmonary fibrosis (Ley 2012) -----
// Points: Gender (male 1), Age (> 65 = 2, > 60 = 1, <= 60 = 0), Physiology
// FVC% (> 75 = 0, 50-75 = 1, < 50 = 2) and DLCO% (> 55 = 0, 36-55 = 1,
// <= 35 = 2, cannot perform = 3). Stage I 0-3, II 4-5, III 6-8, each with its
// cited 1/2/3-year mortality. "cannot perform" DLCO is a first-class selectable
// state (3 points), never a missing value.
const GAP_MORTALITY = {
  I: '1-year 5.6%, 2-year 10.9%, 3-year 16.3% (Ley 2012)',
  II: '1-year 16.2%, 2-year 29.3%, 3-year 42.1% (Ley 2012)',
  III: '1-year 39.2%, 2-year 62.1%, 3-year 76.8% (Ley 2012)',
};
export function gapIpf({ sex = 'male', age, fvcPct, dlcoPct, dlcoCannotPerform } = {}) {
  const female = sex === 'female' || sex === 'f';
  const a = fin(age);
  const fvc = fin(fvcPct);
  const cannot = dlcoCannotPerform === true || dlcoCannotPerform === 'yes' || dlcoCannotPerform === 'on';
  const dlco = fin(dlcoPct);
  // DLCO is "complete" if cannot-perform is selected OR a numeric value is given.
  const dlcoComplete = cannot || dlco != null;
  if (a == null || fvc == null || !dlcoComplete) {
    return {
      valid: false,
      band: 'Enter sex, age, FVC %predicted, and DLCO %predicted (or select "cannot perform").',
      note: 'GAP = Gender (male 1) + Age (> 65 = 2, > 60 = 1) + FVC% (> 75 = 0, 50-75 = 1, < 50 = 2) + DLCO% (> 55 = 0, 36-55 = 1, <= 35 = 2, cannot perform = 3).',
    };
  }
  const genderPts = female ? 0 : 1;
  let agePts;
  if (a > 65) agePts = 2; else if (a > 60) agePts = 1; else agePts = 0;
  let fvcPts;
  if (fvc > 75) fvcPts = 0; else if (fvc >= 50) fvcPts = 1; else fvcPts = 2;
  let dlcoPts;
  if (cannot) dlcoPts = 3;
  else if (dlco > 55) dlcoPts = 0; else if (dlco >= 36) dlcoPts = 1; else dlcoPts = 2;

  const total = genderPts + agePts + fvcPts + dlcoPts;
  let stage;
  if (total <= 3) stage = 'I'; else if (total <= 5) stage = 'II'; else stage = 'III';

  return {
    valid: true,
    total,
    genderPts,
    agePts,
    fvcPts,
    dlcoPts,
    dlcoCannotPerform: cannot,
    stage,
    mortality: GAP_MORTALITY[stage],
    band: `GAP ${total} points: stage ${stage}. ${GAP_MORTALITY[stage]}.`,
    note: `GAP points: Gender (male = 1) ${genderPts}; Age (> 65 = 2, > 60 = 1, <= 60 = 0) ${agePts}; FVC% (> 75 = 0, 50-75 = 1, < 50 = 2) ${fvcPts}; DLCO% (> 55 = 0, 36-55 = 1, <= 35 = 2, cannot perform = 3) ${dlcoPts}. Stage I 0-3, II 4-5, III 6-8. The mortality estimates are the Ley 2012 cohort figures, not an individual prognosis.`,
  };
}

// --- 2.4 predictedSpirometry - GLI-2012 predicted FEV1/FVC + LLN -------------
// Reads the compiled GLI-2012 LMS coefficient + spline constants (gli-2012-data.js)
// for the selected ethnicity group. Guards every domain: age must be in the GLI
// 3-95 yr range and height > 0; the spline lookup clamps to the table ends; an
// ethnicity group outside the GLI sets falls back to "other/mixed". Returns a
// surfaced valid:false fallback rather than a NaN.
const GLI_AGE_MIN = 3;
const GLI_AGE_MAX = 95;
// ethnicity -> dummy vector [African-American, NE Asian, SE Asian, Other/mixed]
const ETHNICITY = {
  caucasian: [0, 0, 0, 0],
  'african-american': [1, 0, 0, 0],
  'ne-asian': [0, 1, 0, 0],
  'se-asian': [0, 0, 1, 0],
  other: [0, 0, 0, 1],
};
// Piecewise-linear interpolation of a spline knot array (knots every `step`
// years from `age0`), clamped to the table ends.
function splineAt(arr, age0, step, age) {
  const x = (age - age0) / step;
  if (x <= 0) return arr[0];
  if (x >= arr.length - 1) return arr[arr.length - 1];
  const i = Math.floor(x);
  return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
}
function lms(stratum, age, heightCm, e) {
  const k = GLI2012[stratum];
  const lnH = Math.log(heightCm);
  const lnA = Math.log(age);
  const M = Math.exp(
    k.a[0] + k.a[1] * lnH + k.a[2] * lnA
    + k.a[3] * e[0] + k.a[4] * e[1] + k.a[5] * e[2] + k.a[6] * e[3]
    + splineAt(k.m, k.age0, k.step, age),
  );
  const S = Math.exp(
    k.p[0] + k.p[1] * lnA
    + k.p[2] * e[0] + k.p[3] * e[1] + k.p[4] * e[2] + k.p[5] * e[3]
    + splineAt(k.s, k.age0, k.step, age),
  );
  const L = k.q[0] + k.q[1] * lnA + splineAt(k.l, k.age0, k.step, age);
  // LLN (5th percentile) = M * (1 + L*S*(-1.645))^(1/L); guard the L = 0 limb.
  let LLN;
  if (Math.abs(L) < 1e-9) LLN = M * Math.exp(S * (-1.645));
  else LLN = M * Math.pow(1 + L * S * (-1.645), 1 / L);
  return { M, S, L, LLN };
}
export function predictedSpirometry({
  age, heightCm, sex = 'male', ethnicity = 'caucasian',
  measuredFev1, measuredFvc,
} = {}) {
  const a = fin(age);
  const h = pos(heightCm);
  const female = sex === 'female' || sex === 'f';
  const sexKey = female ? 'female' : 'male';
  // An unknown ethnicity group falls back to the source's "other/mixed" set.
  const eKnown = Object.prototype.hasOwnProperty.call(ETHNICITY, ethnicity);
  const e = eKnown ? ETHNICITY[ethnicity] : ETHNICITY.other;
  if (a == null || h == null) {
    return {
      valid: false,
      band: 'Enter age (years), height (cm), and sex to compute the GLI-2012 predicted spirometry.',
      note: 'Predicted FEV1, FVC, the FEV1/FVC ratio and the lower limit of normal (LLN, 5th percentile) come from the GLI-2012 reference equations for the selected ethnicity group.',
    };
  }
  if (a < GLI_AGE_MIN || a > GLI_AGE_MAX) {
    return {
      valid: false,
      band: `GLI-2012 is defined for ages ${GLI_AGE_MIN}-${GLI_AGE_MAX} years; ${r1(a)} is outside that range.`,
      note: 'The GLI-2012 reference equations cover ages 3-95 years only; a value outside that range has no published reference and is not extrapolated.',
    };
  }

  const fev1 = lms(`${sexKey}_FEV1`, a, h, e);
  const fvc = lms(`${sexKey}_FVC`, a, h, e);
  const ratio = lms(`${sexKey}_FEV1FVC`, a, h, e);

  const predFev1 = r2(fev1.M);
  const predFvc = r2(fvc.M);
  const predRatio = r2(ratio.M);
  const llnFev1 = r2(fev1.LLN);
  const llnFvc = r2(fvc.LLN);
  const llnRatio = r2(ratio.LLN);

  const result = {
    valid: true,
    ethnicityUsed: eKnown ? ethnicity : 'other',
    ethnicityFallback: !eKnown,
    sex: sexKey,
    predFev1,
    predFvc,
    predRatio,
    llnFev1,
    llnFvc,
    llnRatio,
    note: `GLI-2012 reference (${eKnown ? ethnicity : 'other/mixed (fallback)'}, ${sexKey}). The lower limit of normal (LLN) is the 5th percentile; a measured value below the LLN is below the reference range. The FEV1/FVC ratio is the GLI-defined ratio equation, not predicted FEV1 / predicted FVC.`,
  };

  // Optional measured values -> % predicted + above/below-LLN flag.
  const mFev1 = pos(measuredFev1);
  const mFvc = pos(measuredFvc);
  if (mFev1 != null) {
    result.measuredFev1 = r2(mFev1);
    result.fev1Pct = r1((mFev1 / fev1.M) * 100);
    result.fev1BelowLln = mFev1 < fev1.LLN;
  }
  if (mFvc != null) {
    result.measuredFvc = r2(mFvc);
    result.fvcPct = r1((mFvc / fvc.M) * 100);
    result.fvcBelowLln = mFvc < fvc.LLN;
  }
  if (mFev1 != null && mFvc != null) {
    const mr = mFev1 / mFvc;
    result.measuredRatio = r2(mr);
    result.ratioBelowLln = mr < ratio.LLN;
  }

  const bandParts = [`GLI-2012 predicted: FEV1 ${predFev1} L (LLN ${llnFev1}), FVC ${predFvc} L (LLN ${llnFvc}), FEV1/FVC ${predRatio} (LLN ${llnRatio}).`];
  if (result.fev1Pct != null) bandParts.push(`Measured FEV1 ${result.fev1Pct}% predicted${result.fev1BelowLln ? ', below LLN' : ', within reference range'}.`);
  result.band = bandParts.join(' ');
  return result;
}

// --- 2.5 mmrcDyspnea - modified MRC dyspnea scale (Bestall 1999) -------------
// A single 0-4 grade selection with its descriptor. The grade is the connective
// tissue that feeds BODE and the GOLD ABE assessment. An out-of-range grade is
// refused with a surfaced fallback (never an undefined descriptor).
const MMRC = {
  0: 'breathless only with strenuous exercise',
  1: 'short of breath when hurrying on the level or walking up a slight hill',
  2: 'walks slower than peers on the level, or stops for breath when walking at own pace',
  3: 'stops for breath after about 100 m or after a few minutes on the level',
  4: 'too breathless to leave the house, or breathless when dressing/undressing',
};
export function mmrcDyspnea({ grade } = {}) {
  const g = fin(grade);
  if (g == null || !Number.isInteger(g) || g < 0 || g > 4) {
    return {
      valid: false,
      band: 'Select an mMRC dyspnea grade from 0 to 4.',
      note: 'The modified MRC dyspnea scale is a single integer grade 0-4; a value outside that range is not a valid mMRC grade.',
    };
  }
  return {
    valid: true,
    grade: g,
    descriptor: MMRC[g],
    band: `mMRC grade ${g}: ${MMRC[g]}.`,
    note: 'The mMRC grade feeds the BODE index and the GOLD ABE symptom assessment. It is a single self-reported disability grade, not a measure of airflow obstruction; pair it with spirometry and exacerbation history.',
  };
}
