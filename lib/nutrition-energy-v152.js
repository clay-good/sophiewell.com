// spec-v152 (the second implementation spec of the spec-v150 Post-Parity
// Coverage program): five deterministic predictive energy-expenditure equations
// that fill a confirmed gap — the catalog had nutrition *screening* (must-
// nutrition, nrs2002, nutric, mnutric, refeeding-risk) and an icu-nutrition-
// target weight-based goal, but NO predictive resting/total energy-expenditure
// regression — the number every dietitian starts from. None duplicates a live
// tile; v152 runs no AI and makes no runtime network call.
//
//   mifflinStJeor - Mifflin-St Jeor resting energy expenditure (the ambulatory standard)
//   harrisBenedict - Harris-Benedict basal energy expenditure (revised Roza 1984)
//   katchMcArdle  - Katch-McArdle BMR (lean-body-mass based)
//   pennStateRee  - Penn State equation (ventilated ICU REE; 2003b + modified 2010 branch)
//   iretonJones   - Ireton-Jones energy equation (1997 revised; ventilated + spontaneous)
//
// Per the spec-v100 §2 doctrine each is a closed-form arithmetic compute over
// finite-checked numeric inputs (spec-v29 §3 one-line test); a blank/non-finite
// weight, height, or age renders a surfaced valid:false complete-the-fields
// fallback rather than NaN (spec-v59 output safety). Citations live inline in
// lib/meta.js; renderers in views/group-v152.js render the spec-v50 §3 posture
// note that these are PREDICTIONS, not a measured-calorimetry value, and the
// prescription stays with the clinician (spec-v11 §5.3).
//
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97), each cross-verified across
// >= 2 independent sources at implementation (the original papers, MDCalc/
// Medscape, the Academy of Nutrition & Dietetics EAL, and peer-reviewed ICU-
// nutrition reviews). SOURCE-GOVERNANCE:
//   - mifflin-st-jeor (Mifflin MD et al, Am J Clin Nutr 1990;51(2):241): REE =
//     10*wt(kg) + 6.25*ht(cm) - 5*age(yr) + s, s = +5 (male) / -161 (female).
//     TDEE = REE * activity factor (sedentary 1.2 / light 1.375 / moderate 1.55 /
//     very 1.725 / extra 1.9 — practice convention, not from the 1990 paper).
//   - harris-benedict (revised, Roza AM, Shizgal HM, Am J Clin Nutr 1984;40(1):168):
//     male BEE = 88.362 + 13.397*wt + 4.799*ht - 5.677*age; female BEE = 447.593 +
//     9.247*wt + 3.098*ht - 4.330*age. Tends to overestimate ~5% vs Mifflin.
//   - katch-mcardle (Katch & McArdle, lean-mass BMR): BMR = 370 + 21.6*LBM(kg);
//     LBM = wt*(1 - bodyfat%/100). The body-fat path is range-guarded 0 < BF < 100;
//     a direct-LBM input avoids the derivation entirely.
//   - penn-state-ree (Frankenfield D et al, JPEN 2004;28(4):259; modified JADA
//     2009;109(9):1564): standard "2003b" RMR = Mifflin*0.96 + Tmax*167 + Ve*31 -
//     6212; MODIFIED (2010) RMR = Mifflin*0.71 + Tmax*85 + Ve*64 - 3085 applies
//     ONLY when BMI >= 30 AND age >= 60 (a three-way split — obese-but-young still
//     uses 2003b). Tmax = max temp prior 24 h in degrees C; Ve = ventilator minute
//     ventilation L/min; Mifflin uses ACTUAL body weight.
//   - ireton-jones (Ireton-Jones C, Jones JD, Nutr Clin Pract 2002;17(1):29, the
//     1997-revised constants — NOT the different 1992 set): ventilator-dependent
//     EEE = 1784 - 11*age + 5*wt + 244*(male) + 239*(trauma) + 804*(burn);
//     spontaneously-breathing EEE = 629 - 11*age + 25*wt - 609*(obese, BMI > 27).

import { num } from './num.js';

const ACTIVITY = {
  sedentary: { factor: 1.2, label: 'sedentary (little/no exercise)' },
  light: { factor: 1.375, label: 'lightly active (1–3 d/wk)' },
  moderate: { factor: 1.55, label: 'moderately active (3–5 d/wk)' },
  very: { factor: 1.725, label: 'very active (6–7 d/wk)' },
  extra: { factor: 1.9, label: 'extra active (hard daily/physical job)' },
};

// finite-number coercion: returns null for blank / non-finite so a caller can
// surface a complete-the-fields fallback instead of computing NaN.
function fin(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
const round = (n) => Math.round(n);

// Optional activity factor: accepts a key ('sedentary'..'extra') or a raw
// multiplier; returns { factor, label } or null when none/invalid is supplied.
function activity(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'string' && ACTIVITY[v]) return { factor: ACTIVITY[v].factor, label: ACTIVITY[v].label };
  const n = Number(v);
  if (Number.isFinite(n) && n >= 1 && n <= 3) return { factor: n, label: `factor ${n}` };
  return null;
}

function withTdee(base, label, unit, act) {
  const a = activity(act);
  const out = { valid: true, score: base, base, bandLabel: label };
  if (a) {
    out.tdee = round(base * a.factor);
    out.activityFactor = a.factor;
    out.activityLabel = a.label;
    out.band = `${label} ${base} ${unit}; TDEE ${out.tdee} ${unit} (× ${a.factor} ${a.label}).`;
  } else {
    out.band = `${label} ${base} ${unit}.`;
  }
  return out;
}

// --- 2.1 Mifflin-St Jeor -----------------------------------------------------
const MIFFLIN_NOTE = 'Mifflin-St Jeor resting energy expenditure (Mifflin MD, St Jeor ST, Hill LA, et al, Am J Clin Nutr 1990;51(2):241-247) — the contemporary first-line predictive REE equation for ambulatory adults. REE (kcal/day) = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(yr) + s, where s = +5 for males and −161 for females. If an activity factor is supplied, total daily energy expenditure TDEE = REE × factor (sedentary 1.2, light 1.375, moderate 1.55, very 1.725, extra 1.9). It reports REE and, when given, TDEE; the energy prescription stays with the clinician.';

export function mifflinStJeor(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wt = fin(o.weight); const ht = fin(o.height); const age = fin(o.age);
  if (wt === null || ht === null || age === null) {
    return { valid: false, message: 'Enter weight (kg), height (cm), and age (yr).' };
  }
  const male = o.sex !== 'female';
  const s = male ? 5 : -161;
  const ree = round(num('Mifflin REE', 10 * wt + 6.25 * ht - 5 * age + s, { min: -10000, max: 20000 }));
  const out = withTdee(ree, 'REE', 'kcal/day', o.activity);
  out.sexConstant = s;
  out.detail = `10×${wt} + 6.25×${ht} − 5×${age} + ${s} (${male ? 'male' : 'female'}) = ${ree} kcal/day.`;
  out.note = MIFFLIN_NOTE;
  out.abnormal = false;
  return out;
}

// --- 2.2 Harris-Benedict (revised, Roza 1984) --------------------------------
const HB_NOTE = 'Harris-Benedict basal energy expenditure, revised constants (Harris JA, Benedict FG, Proc Natl Acad Sci 1918; revised Roza AM, Shizgal HM, Am J Clin Nutr 1984;40(1):168-182) — the classic comparator to Mifflin-St Jeor. Male BEE (kcal/day) = 88.362 + 13.397 × weight(kg) + 4.799 × height(cm) − 5.677 × age(yr); female BEE = 447.593 + 9.247 × weight + 3.098 × height − 4.330 × age. TDEE = BEE × activity factor. Harris-Benedict tends to overestimate resting expenditure by ~5% relative to Mifflin, which is the preferred contemporary equation.';

export function harrisBenedict(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wt = fin(o.weight); const ht = fin(o.height); const age = fin(o.age);
  if (wt === null || ht === null || age === null) {
    return { valid: false, message: 'Enter weight (kg), height (cm), and age (yr).' };
  }
  const male = o.sex !== 'female';
  const bee = round(num('Harris-Benedict BEE', male
    ? 88.362 + 13.397 * wt + 4.799 * ht - 5.677 * age
    : 447.593 + 9.247 * wt + 3.098 * ht - 4.330 * age, { min: -10000, max: 20000 }));
  const out = withTdee(bee, 'BEE', 'kcal/day', o.activity);
  out.detail = male
    ? `male: 88.362 + 13.397×${wt} + 4.799×${ht} − 5.677×${age} = ${bee} kcal/day.`
    : `female: 447.593 + 9.247×${wt} + 3.098×${ht} − 4.330×${age} = ${bee} kcal/day.`;
  out.note = HB_NOTE;
  out.abnormal = false;
  return out;
}

// --- 2.3 Katch-McArdle (lean-mass) -------------------------------------------
const KM_NOTE = 'Katch-McArdle basal metabolic rate (Katch FI, McArdle WD, Nutrition, Weight Control, and Exercise) — the lean-body-mass equation for body-composition contexts. BMR (kcal/day) = 370 + 21.6 × lean body mass(kg). Lean body mass can be entered directly, or derived from total weight and body-fat % as LBM = weight × (1 − bodyfat%/100). Because it keys off lean mass rather than total weight, it is preferred for athletes and lean/obese bodies where weight-only equations drift. TDEE = BMR × activity factor.';

export function katchMcArdle(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let lbm = fin(o.lbm);
  let derived = false;
  if (lbm === null) {
    const wt = fin(o.weight); const bf = fin(o.bodyFat);
    if (wt === null || bf === null) {
      return { valid: false, message: 'Enter lean body mass (kg), or weight (kg) + body-fat %.' };
    }
    if (bf <= 0 || bf >= 100) {
      return { valid: false, message: 'Body-fat % must be between 0 and 100.' };
    }
    lbm = wt * (1 - bf / 100);
    derived = true;
  }
  if (!(lbm > 0)) {
    return { valid: false, message: 'Lean body mass must be greater than 0 kg.' };
  }
  const bmr = round(num('Katch-McArdle BMR', 370 + 21.6 * lbm, { min: 0, max: 20000 }));
  const out = withTdee(bmr, 'BMR', 'kcal/day', o.activity);
  out.lbm = Math.round(lbm * 10) / 10;
  out.detail = `370 + 21.6 × ${out.lbm} kg LBM${derived ? ' (derived from weight and body-fat %)' : ''} = ${bmr} kcal/day.`;
  out.note = KM_NOTE;
  out.abnormal = false;
  return out;
}

// --- 2.4 Penn State (ventilated REE) -----------------------------------------
const PS_NOTE = 'Penn State equation (Frankenfield D, Smith JS, Cooney RN, JPEN 2004;28(4):259-264; modified form Frankenfield DC et al, J Am Diet Assoc 2009;109(9):1564-1569) — predicts resting metabolic rate in mechanically ventilated critically ill adults when a metabolic cart is unavailable. It uses the Mifflin-St Jeor REE (computed from actual weight, height, age, sex), the maximum temperature in the prior 24 h (Tmax, °C), and the ventilator-measured minute ventilation (Ve, L/min). Standard (2003b): RMR = Mifflin × 0.96 + Tmax × 167 + Ve × 31 − 6212. The modified (2010) form RMR = Mifflin × 0.71 + Tmax × 85 + Ve × 64 − 3085 applies only when BMI ≥ 30 AND age ≥ 60; everyone else (including obese patients under 60) uses the standard form. It is a prediction, not a substitute for indirect calorimetry.';

export function pennStateRee(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wt = fin(o.weight); const ht = fin(o.height); const age = fin(o.age);
  const tmax = fin(o.tmax); const ve = fin(o.ve);
  if (wt === null || ht === null || age === null || tmax === null || ve === null) {
    return { valid: false, message: 'Enter weight (kg), height (cm), age (yr), Tmax (°C), and minute ventilation (L/min).' };
  }
  const male = o.sex !== 'female';
  const mifflin = 10 * wt + 6.25 * ht - 5 * age + (male ? 5 : -161);
  const m = ht > 0 ? wt / ((ht / 100) ** 2) : 0;
  const bmi = Number.isFinite(m) ? m : 0;
  const modified = bmi >= 30 && age >= 60;
  const rmr = round(num('Penn State RMR', modified
    ? mifflin * 0.71 + tmax * 85 + ve * 64 - 3085
    : mifflin * 0.96 + tmax * 167 + ve * 31 - 6212, { min: 0, max: 20000 }));
  const which = modified ? 'modified (2010)' : 'standard (2003b)';
  return {
    valid: true,
    score: rmr,
    bandLabel: `${rmr} kcal/day`,
    abnormal: false,
    branch: modified ? 'modified' : 'standard',
    bmi: Math.round(bmi * 10) / 10,
    band: `Penn State RMR ${rmr} kcal/day — ${which} form (BMI ${Math.round(bmi * 10) / 10}, age ${age}).`,
    detail: modified
      ? `Mifflin ${round(mifflin)}×0.71 + Tmax ${tmax}×85 + Ve ${ve}×64 − 3085 = ${rmr} kcal/day.`
      : `Mifflin ${round(mifflin)}×0.96 + Tmax ${tmax}×167 + Ve ${ve}×31 − 6212 = ${rmr} kcal/day.`,
    note: PS_NOTE,
  };
}

// --- 2.5 Ireton-Jones --------------------------------------------------------
const IJ_NOTE = 'Ireton-Jones energy equation (Ireton-Jones C, Jones JD, Nutr Clin Pract 2002;17(1):29-31, the 1997-revised constants) — estimates total energy expenditure in hospitalized patients, with a ventilator-dependent and a spontaneously-breathing form. Ventilator-dependent EEE (kcal/day) = 1784 − 11 × age(yr) + 5 × weight(kg) + 244 × (male) + 239 × (trauma) + 804 × (burn). Spontaneously-breathing EEE = 629 − 11 × age + 25 × weight − 609 × (obese, BMI > 27). The trauma and burn modifiers are diagnosis flags; the male indicator is 1 for male and 0 for female. It is a prediction; the energy prescription stays with the nutrition-support clinician.';

export function iretonJones(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = fin(o.age); const wt = fin(o.weight);
  if (age === null || wt === null) {
    return { valid: false, message: 'Enter age (yr) and weight (kg).' };
  }
  const ventilated = o.mode !== 'spontaneous';
  const male = o.sex !== 'female';
  const trauma = o.trauma === true || o.trauma === 'true' || o.trauma === '1';
  const burn = o.burn === true || o.burn === 'true' || o.burn === '1';
  let eee; let detail;
  if (ventilated) {
    eee = round(num('Ireton-Jones EEE', 1784 - 11 * age + 5 * wt + 244 * (male ? 1 : 0) + 239 * (trauma ? 1 : 0) + 804 * (burn ? 1 : 0), { min: 0, max: 20000 }));
    detail = `ventilated: 1784 − 11×${age} + 5×${wt} + 244×${male ? 1 : 0} + 239×${trauma ? 1 : 0} + 804×${burn ? 1 : 0} = ${eee} kcal/day.`;
  } else {
    const ht = fin(o.height);
    const bmi = (ht !== null && ht > 0) ? wt / ((ht / 100) ** 2) : null;
    const obese = bmi !== null ? bmi > 27 : (o.obese === true || o.obese === 'true' || o.obese === '1');
    eee = round(num('Ireton-Jones EEE', 629 - 11 * age + 25 * wt - 609 * (obese ? 1 : 0), { min: 0, max: 20000 }));
    detail = `spontaneous: 629 − 11×${age} + 25×${wt} − 609×${obese ? 1 : 0}${bmi !== null ? ` (BMI ${Math.round(bmi * 10) / 10})` : ''} = ${eee} kcal/day.`;
  }
  return {
    valid: true,
    score: eee,
    bandLabel: `${eee} kcal/day`,
    abnormal: false,
    mode: ventilated ? 'ventilated' : 'spontaneous',
    band: `Ireton-Jones EEE ${eee} kcal/day — ${ventilated ? 'ventilator-dependent' : 'spontaneously breathing'} form.`,
    detail,
    note: IJ_NOTE,
  };
}
