// spec-v233: quantitative bedside estimators — two cranial ventricular linear
// indices (Evans index, frontal-occipital horn ratio), the age-adjusted D-dimer
// threshold, and the Deurenberg body-fat estimate. Each id was verified absent by
// a fixed-string scan of the extracted app.js id/name lists AND the MCP adapter
// set first (spec-v85 §6.2). v233 runs no AI and makes no runtime network call.
//
// These compute a ratio / estimate / threshold — they are NOT a diagnosis and NOT
// a treatment order (spec-v11 §5.3).
//
//   evans-index         - Evans index (frontal-horn / inner-skull width ratio)
//   fohr                - frontal-occipital horn ratio
//   age-adjusted-d-dimer - age-adjusted D-dimer cutoff (ADJUST-PE)
//   deurenberg-body-fat - Deurenberg body-fat % estimate + ACE category
//
// FORMULAS AND CUTOFFS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across
// >= 2 independent open sources at implementation (see per-function headers).

import { num, r1, r2 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Evans index -------------------------------------------------------------
// Evans WA (1942); standard radiologic ratio = maximum width of the frontal horns
// of the lateral ventricles / maximum inner-table (biparietal) skull diameter on
// the same axial CT/MRI slice. Normal 0.20-0.25; 0.25-0.30 borderline; > 0.30
// defines ventricular enlargement (the radiologic threshold for hydrocephalus).
// Cross-verified: Frontiers Aging Neurosci 2021 (PMC8787286); operativeneurosurgery
// wiki. A ratio, not a diagnosis (an enlarged index does not distinguish atrophy
// from CSF-dynamics disturbance).
const EVANS_NOTE = 'Evans index = maximum width of the frontal horns of the lateral ventricles / maximum inner-table skull (biparietal) diameter on the same axial slice (Evans 1942). Normal 0.20-0.25; 0.25-0.30 borderline; > 0.30 defines ventricular enlargement (radiologic hydrocephalus threshold). It does not distinguish atrophy from CSF-dynamics disturbance. A ratio, not a diagnosis or treatment order.';
export function evansIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const frontal = pos(o.frontal, 1, 200);
  const skull = pos(o.skull, 1, 300);
  if (frontal === null || skull === null) {
    return { valid: false, message: 'Enter frontal-horn width and inner-skull (biparietal) diameter in the same units (mm).' };
  }
  if (frontal > skull) {
    return { valid: false, message: 'Frontal-horn width cannot exceed the inner-skull diameter.' };
  }
  const score = r2(num('Evans', frontal / skull, { min: 0, max: 1 }));
  let tier; let abnormal = true;
  if (score > 0.30) tier = 'ventricular enlargement (> 0.30 — radiologic hydrocephalus threshold)';
  else if (score >= 0.25) tier = 'borderline (0.25-0.30)';
  else { tier = 'within normal range (<= 0.25)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `Evans ${score}`, band: `Evans index ${score} — ${tier}.`, detail: `Frontal horns ${frontal} / inner skull ${skull}.`, note: EVANS_NOTE };
}

// --- Frontal-occipital horn ratio (FOHR) -------------------------------------
// O'Hayon BB, et al. Pediatr Neurosurg. 1998: FOHR = (maximum frontal-horn width +
// maximum occipital-horn width) / (2 x biparietal diameter). Normal mean 0.37
// (age-independent); an MRI-derived FOHR >= 0.55 is a widely-cited threshold for
// clinically significant ventriculomegaly in pediatric hydrocephalus (Ambati 2019,
// AJR, 100% sens / 77% spec). A ratio, not a diagnosis.
const FOHR_NOTE = 'Frontal-occipital horn ratio = (maximum frontal-horn width + maximum occipital-horn width) / (2 x biparietal diameter) (O’Hayon 1998). Normal mean 0.37 (age-independent); FOHR >= 0.55 is a widely-cited threshold for clinically significant ventriculomegaly in pediatric hydrocephalus (Ambati 2019). A ratio, not a diagnosis or treatment order.';
export function fohr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const frontal = pos(o.frontal, 1, 200);
  const occipital = pos(o.occipital, 1, 200);
  const bpd = pos(o.bpd, 1, 300);
  if (frontal === null || occipital === null || bpd === null) {
    return { valid: false, message: 'Enter frontal-horn width, occipital-horn width, and biparietal diameter in the same units (mm).' };
  }
  const score = r2(num('FOHR', (frontal + occipital) / (2 * bpd), { min: 0, max: 2 }));
  let tier; let abnormal = false;
  if (score >= 0.55) { tier = 'clinically significant ventriculomegaly (>= 0.55)'; abnormal = true; }
  else if (score > 0.37) tier = 'above the 0.37 normal mean';
  else tier = 'within the normal reference (mean 0.37)';
  return { valid: true, score, abnormal, bandLabel: `FOHR ${score}`, band: `Frontal-occipital horn ratio ${score} — ${tier}.`, detail: `(frontal ${frontal} + occipital ${occipital}) / (2 x BPD ${bpd}).`, note: FOHR_NOTE };
}

// --- Age-adjusted D-dimer cutoff (ADJUST-PE) ---------------------------------
// Righini M, et al (ADJUST-PE). JAMA. 2014;311(11):1117-1124: in patients with a
// non-high clinical pretest probability, the D-dimer cutoff is 500 ug/L (FEU) up
// to age 50 and age x 10 ug/L above age 50. A value below the cutoff makes VTE
// unlikely; a value at/above it is elevated (not diagnostic). Cross-verified:
// JAMA 2014; WikEM. A threshold aid, not a diagnosis or treatment order.
const AADD_NOTE = 'Age-adjusted D-dimer (Righini/ADJUST-PE, JAMA 2014): in a non-high clinical pretest probability, the cutoff is 500 ug/L (FEU) up to age 50 and age x 10 ug/L above age 50. A D-dimer below the cutoff makes VTE unlikely; a value at or above it is elevated but NOT diagnostic. Use only with a validated pretest-probability rule (Wells / Geneva). A threshold aid, not a diagnosis or treatment order.';
export function ageAdjustedDDimer(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = pos(o.age, 0, 130);
  const ddimer = pos(o.ddimer, 0, 100000);
  if (age === null || ddimer === null) {
    return { valid: false, message: 'Enter age (years) and D-dimer (ug/L FEU).' };
  }
  const cutoff = Math.round(num('AADD cutoff', age > 50 ? age * 10 : 500, { min: 0, max: 2000 }));
  const abnormal = ddimer >= cutoff;
  const val = r1(ddimer);
  return {
    valid: true,
    score: cutoff,
    abnormal,
    bandLabel: `Cutoff ${cutoff}`,
    band: `Age-adjusted D-dimer cutoff ${cutoff} ug/L — D-dimer ${val} is ${abnormal ? 'at or above the cutoff (elevated)' : 'below the cutoff (VTE unlikely at non-high pretest probability)'}.`,
    detail: `Age ${age}: cutoff = ${age > 50 ? `age x 10 = ${cutoff}` : '500 (age <= 50)'} ug/L.`,
    note: AADD_NOTE,
  };
}

// --- Deurenberg body-fat % estimate ------------------------------------------
// Deurenberg P, Weststrate JA, Seidell JC. Br J Nutr. 1991;65(2):105-114:
// body-fat % = 1.20 x BMI + 0.23 x age - 10.8 x sex - 5.4 (sex: male = 1,
// female = 0). Category thresholds per ACE (American Council on Exercise). An
// estimate from BMI, not a measured body composition. Cross-verified: Br J Nutr
// 1991; ACE body-fat category chart.
const DEURENBERG_NOTE = 'Body-fat % (Deurenberg P, et al. Br J Nutr. 1991;65:105-114) = 1.20 x BMI + 0.23 x age - 10.8 x sex - 5.4 (sex: male = 1, female = 0). Categories per ACE (American Council on Exercise): men essential 2-5, athletes 6-13, fitness 14-17, acceptable 18-24, obese >= 25; women essential 10-13, athletes 14-20, fitness 21-24, acceptable 25-31, obese >= 32. A population estimate from BMI, not a measured body composition, and not a diagnosis or treatment order.';
export function deurenberg(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bmi = pos(o.bmi, 5, 100);
  const age = pos(o.age, 2, 130);
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  if (bmi === null || age === null || sex === null) {
    return { valid: false, message: 'Enter BMI (kg/m^2), age (years), and sex.' };
  }
  const male = sex === 'male';
  const score = r1(num('Deurenberg', 1.20 * bmi + 0.23 * age - 10.8 * (male ? 1 : 0) - 5.4, { min: 0, max: 100 }));
  let cat; let abnormal = false;
  if (male) {
    if (score >= 25) { cat = 'obese (>= 25%)'; abnormal = true; }
    else if (score >= 18) cat = 'acceptable (18-24%)';
    else if (score >= 14) cat = 'fitness (14-17%)';
    else if (score >= 6) cat = 'athletes (6-13%)';
    else cat = 'essential / very low (<= 5%)';
  } else {
    if (score >= 32) { cat = 'obese (>= 32%)'; abnormal = true; }
    else if (score >= 25) cat = 'acceptable (25-31%)';
    else if (score >= 21) cat = 'fitness (21-24%)';
    else if (score >= 14) cat = 'athletes (14-20%)';
    else cat = 'essential / very low (<= 13%)';
  }
  return { valid: true, score, abnormal, bandLabel: `${score}% fat`, band: `Estimated body fat ${score}% — ACE ${cat}.`, detail: `BMI ${bmi}, age ${age}, ${sex}.`, note: DEURENBERG_NOTE };
}
