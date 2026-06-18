// spec-v102 (Wave 1 of the spec-v100 MDCalc Parity Completion program): four
// deterministic heart-failure prognosis, HFpEF-likelihood, and cardiogenic-shock
// mortality instruments that fill confirmed gaps beside the acute-decompensation
// triage surface. None duplicates a live tile.
//
//   maggic     - MAGGIC HF risk score (Pocock 2013) -> integer points + 1-/3-yr mortality
//   h2fpef     - H2FPEF score (Reddy 2018) -> 0-9 + HFpEF-probability band
//   hfaPeff    - HFA-PEFF diagnostic score (Pieske 2019) -> 0-6 stepwise verdict
//   cardShock  - CardShock risk score (Harjola 2015) -> 0-9 + in-hospital mortality band
//
// (The fifth proposed tile, gwtg-hf, is DEFERRED -- its per-variable integer point
// table could not be verified from a primary or high-quality secondary source this
// session; see docs/spec-v102.md. This catalog does not ship fabricated medical
// scoring weights -- the spec-v97 "re-fetch, never recall" rule.)
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v27.js wire these to the home grid.
//
// Robustness (spec-v102 §3): each clamps continuous inputs (age, EF, SBP, BMI,
// creatinine, lactate, eGFR) to the published band before assigning points, so a
// fuzzed out-of-range value reads the nearest band rather than an undefined point.
// maggic guards its score -> mortality lookup: the table is keyed by the integer
// total clamped to [0, 50], so an out-of-table index can never read undefined.
// hfaPeff reports which domains were scored and renders the 2-4 indeterminate band
// explicitly. None authors a disposition, device, or escalation order in Sophie's
// voice (spec-v11 §5.3).

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';
const r1 = (n) => Math.round(n * 10) / 10;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// --- 2.1 maggic - MAGGIC Heart Failure Risk Score (Pocock 2013) ----------------
// Integer-point model with an age x EF and an SBP x EF interaction: age and SBP
// are scored from one of three columns selected by the EF tier (< 30, 30-39,
// >= 40). Point tables and the score -> mortality lookup re-fetched + cross-verified
// (mdapp / Omnicalculator band tables; two independent open-source implementations
// of the 0-50 mortality lookup). Creatinine is entered in mg/dL (catalog convention)
// and converted to umol/L (x 88.4) for the published umol/L bands.
const MAGGIC_NYHA = { 1: 0, 2: 2, 3: 6, 4: 8 };
// age points [efTier][ageBand]; efTier 0=<30, 1=30-39, 2=>=40;
// ageBand 0=<55,1=55-59,2=60-64,3=65-69,4=70-74,5=75-79,6=>=80
const MAGGIC_AGE = [
  [0, 1, 2, 4, 6, 8, 10],
  [0, 2, 4, 6, 8, 10, 13],
  [0, 3, 5, 7, 9, 12, 15],
];
// sbp points [efTier][sbpBand]; sbpBand 0=<110,1=110-119,2=120-129,3=130-139,4=140-149,5=>=150
const MAGGIC_SBP = [
  [5, 4, 3, 2, 1, 0],
  [3, 2, 1, 1, 0, 0],
  [2, 1, 1, 0, 0, 0],
];
// 1-yr and 3-yr mortality (decimal) by integer score 0-50.
const MAGGIC_1YR = [0.015, 0.016, 0.018, 0.020, 0.022, 0.024, 0.027, 0.029, 0.032, 0.036, 0.039, 0.043, 0.048, 0.052, 0.058, 0.063, 0.070, 0.077, 0.084, 0.093, 0.102, 0.111, 0.122, 0.134, 0.147, 0.160, 0.175, 0.191, 0.209, 0.227, 0.248, 0.269, 0.292, 0.316, 0.342, 0.369, 0.398, 0.427, 0.458, 0.490, 0.523, 0.557, 0.591, 0.625, 0.659, 0.692, 0.725, 0.757, 0.787, 0.816, 0.842];
const MAGGIC_3YR = [0.039, 0.043, 0.048, 0.052, 0.058, 0.063, 0.070, 0.077, 0.084, 0.092, 0.102, 0.111, 0.122, 0.134, 0.146, 0.160, 0.175, 0.191, 0.209, 0.227, 0.247, 0.269, 0.292, 0.316, 0.342, 0.369, 0.397, 0.427, 0.458, 0.490, 0.523, 0.556, 0.590, 0.625, 0.658, 0.692, 0.725, 0.756, 0.787, 0.815, 0.842, 0.866, 0.889, 0.908, 0.926, 0.941, 0.953, 0.964, 0.973, 0.980, 0.985];
const MAGGIC_NOTE = 'MAGGIC Heart Failure Risk Score (Pocock SJ et al, Eur Heart J 2013; 39,372 patients / 30 studies): an integer-point model for 1- and 3-year mortality in heart failure. Age and systolic BP are scored from one of three columns by ejection-fraction tier (the published age x EF and SBP x EF interactions). EF bands: < 20 = 7, 20-24 = 6, 25-29 = 5, 30-34 = 3, 35-39 = 2, >= 40 = 0. Creatinine is entered in mg/dL and converted to umol/L (x 88.4) for the published bands (< 90 = 0 up to >= 250 = 8). The integer total maps to the published 1-/3-year mortality lookup (clamped to the 0-50 table). A model estimate for prognosis, not an individual outcome or a disposition order.';
function maggicEfPts(ef) { return ef < 20 ? 7 : ef < 25 ? 6 : ef < 30 ? 5 : ef < 35 ? 3 : ef < 40 ? 2 : 0; }
function maggicEfTier(ef) { return ef < 30 ? 0 : ef < 40 ? 1 : 2; }
function maggicAgeBand(a) { return a < 55 ? 0 : a < 60 ? 1 : a < 65 ? 2 : a < 70 ? 3 : a < 75 ? 4 : a < 80 ? 5 : 6; }
function maggicSbpBand(s) { return s < 110 ? 0 : s < 120 ? 1 : s < 130 ? 2 : s < 140 ? 3 : s < 150 ? 4 : 5; }
function maggicBmiPts(b) { return b < 15 ? 6 : b < 20 ? 5 : b < 25 ? 3 : b < 30 ? 2 : 0; }
function maggicCreatPts(umol) { return umol < 90 ? 0 : umol < 110 ? 1 : umol < 130 ? 2 : umol < 150 ? 3 : umol < 170 ? 4 : umol < 210 ? 5 : umol < 250 ? 6 : 8; }
export function maggic(input = {}) {
  const { age, male, lvef, nyha, sbp, bmi, creatinine, diabetes, copd, smoker, hfOver18mo, onBetaBlocker, onAceArb } = input;
  const a = fin(age), ef = fin(lvef), s = fin(sbp), b = fin(bmi), cr = fin(creatinine);
  const nyhaPts = Object.prototype.hasOwnProperty.call(MAGGIC_NYHA, String(nyha)) ? MAGGIC_NYHA[String(nyha)] : null;
  if (a == null || ef == null || s == null || b == null || cr == null || nyhaPts == null) {
    return { valid: false, band: '(enter age, EF, NYHA class, systolic BP, BMI, and creatinine)', note: MAGGIC_NOTE };
  }
  const efC = clamp(ef, 0, 90);
  const tier = maggicEfTier(efC);
  const umol = clamp(cr, 0, 50) * 88.4;
  const items = [
    { label: 'Ejection fraction', value: maggicEfPts(efC) },
    { label: 'Age (by EF tier)', value: MAGGIC_AGE[tier][maggicAgeBand(clamp(a, 0, 120))] },
    { label: 'Systolic BP (by EF tier)', value: MAGGIC_SBP[tier][maggicSbpBand(clamp(s, 0, 300))] },
    { label: 'NYHA class', value: nyhaPts },
    { label: 'BMI', value: maggicBmiPts(clamp(b, 5, 80)) },
    { label: 'Creatinine', value: maggicCreatPts(umol) },
    { label: 'Male sex', value: onFlag(male) ? 1 : 0 },
    { label: 'Current smoker', value: onFlag(smoker) ? 1 : 0 },
    { label: 'Diabetes', value: onFlag(diabetes) ? 3 : 0 },
    { label: 'COPD', value: onFlag(copd) ? 2 : 0 },
    { label: 'HF first diagnosed >= 18 months ago', value: onFlag(hfOver18mo) ? 2 : 0 },
    { label: 'Not on beta-blocker', value: onFlag(onBetaBlocker) ? 0 : 3 },
    { label: 'Not on ACE-inhibitor / ARB', value: onFlag(onAceArb) ? 0 : 1 },
  ];
  const raw = items.reduce((acc, it) => acc + it.value, 0);
  const total = clamp(raw, 0, 50);
  const m1 = r1(MAGGIC_1YR[total] * 100);
  const m3 = r1(MAGGIC_3YR[total] * 100);
  return {
    valid: true,
    total: raw,
    scoredTotal: total,
    mortality1yr: m1,
    mortality3yr: m3,
    items,
    band: `MAGGIC ${raw} points: 1-year mortality ${m1}%, 3-year mortality ${m3}%.`,
    note: MAGGIC_NOTE,
  };
}

// --- 2.3 h2fpef - H2FPEF Score (Reddy 2018) ------------------------------------
// BMI > 30 (2) + >= 2 antihypertensives (1) + atrial fibrillation (3) +
// pulmonary hypertension PASP > 35 (1) + age > 60 (1) + echo E/e' > 9 (1).
// Total 0-9: 0-1 low, 2-5 intermediate, 6-9 high probability of HFpEF.
const H2FPEF_NOTE = 'H2FPEF Score (Reddy YNV et al, Circulation 2018): an evidence-based estimate of whether dyspnea is heart failure with preserved ejection fraction. BMI > 30 kg/m^2 (2), >= 2 antihypertensive medications (1), atrial fibrillation (3), echo pulmonary hypertension (PASP > 35 mmHg) (1), age > 60 (1), echo E/e′ > 9 (1). Total 0-9: 0-1 low probability (consider alternative causes), 2-5 intermediate (further testing -- diastolic stress or invasive hemodynamics), 6-9 high probability. Takes the clinician’s banded echo values, not a study feed. A probability estimate, not a diagnosis.';
export function h2fpef({ obese, antihypertensives, afib, pulmHtn, ageOver60, eeOver9 } = {}) {
  const items = [
    { label: 'BMI > 30', value: onFlag(obese) ? 2 : 0 },
    { label: '>= 2 antihypertensives', value: onFlag(antihypertensives) ? 1 : 0 },
    { label: 'Atrial fibrillation', value: onFlag(afib) ? 3 : 0 },
    { label: 'Pulmonary hypertension (PASP > 35)', value: onFlag(pulmHtn) ? 1 : 0 },
    { label: 'Age > 60', value: onFlag(ageOver60) ? 1 : 0 },
    { label: "Echo E/e' > 9", value: onFlag(eeOver9) ? 1 : 0 },
  ];
  const total = items.reduce((acc, it) => acc + it.value, 0);
  const prob = total <= 1 ? 'low' : total <= 5 ? 'intermediate' : 'high';
  return {
    valid: true,
    total,
    prob,
    items,
    band: `H2FPEF ${total}/9: ${prob} probability of HFpEF.`,
    note: H2FPEF_NOTE,
  };
}

// --- 2.4 hfaPeff - HFA-PEFF Diagnostic Score (Pieske 2019) ---------------------
// Three domains (functional, morphological, biomarker); each scored none (0) /
// minor (1) / major (2), capped at 2 per domain. Total 0-6: >= 5 HFpEF confirmed,
// 2-4 indeterminate (proceed to diastolic stress / invasive testing), <= 1 unlikely.
const HFAPEFF_DOMAIN = { none: 0, minor: 1, major: 2 };
const HFAPEFF_DOMAINS = [
  { key: 'functional', label: 'Functional (E/e′, e′, TR velocity)' },
  { key: 'morphological', label: 'Morphological (LAVI, LV mass index, RWT)' },
  { key: 'biomarker', label: 'Biomarker (NT-proBNP / BNP, by rhythm)' },
];
export const HFAPEFF_DOMAIN_LIST = HFAPEFF_DOMAINS;
const HFAPEFF_NOTE = 'HFA-PEFF diagnostic score (Pieske B et al, Eur Heart J 2019; ESC Heart Failure Association). Each of three domains is scored on its highest criterion -- major = 2, minor = 1, capped at 2 per domain. Functional: major E/e′ >= 15 or age-adjusted e′ (septal < 7 / lateral < 10, age < 75) or TR velocity > 2.8 m/s; minor E/e′ 9-14 or GLS < 16%. Morphological: major LAVI > 34 (sinus) / > 40 (AF) mL/m^2 or LV mass index >= 149 (men) / 122 (women) g/m^2 with RWT > 0.42; minor LAVI 29-34 / 34-40, lower LV mass, RWT > 0.42, or wall thickness >= 12 mm. Biomarker (sinus rhythm): major NT-proBNP > 220 or BNP > 80 pg/mL; minor NT-proBNP 125-220 or BNP 35-80 (the AF thresholds are roughly 3x higher). Total 0-6: >= 5 HFpEF confirmed, 2-4 indeterminate (proceed to diastolic stress echo or invasive hemodynamics), <= 1 unlikely. Takes the clinician’s domain determinations. A diagnostic-likelihood estimate, not a verdict.';
export function hfaPeff({ functional, morphological, biomarker } = {}) {
  const fp = Object.prototype.hasOwnProperty.call(HFAPEFF_DOMAIN, String(functional)) ? HFAPEFF_DOMAIN[String(functional)] : 0;
  const mp = Object.prototype.hasOwnProperty.call(HFAPEFF_DOMAIN, String(morphological)) ? HFAPEFF_DOMAIN[String(morphological)] : 0;
  const bp = Object.prototype.hasOwnProperty.call(HFAPEFF_DOMAIN, String(biomarker)) ? HFAPEFF_DOMAIN[String(biomarker)] : 0;
  const items = [
    { label: 'Functional domain', value: fp },
    { label: 'Morphological domain', value: mp },
    { label: 'Biomarker domain', value: bp },
  ];
  const total = fp + mp + bp;
  const verdict = total >= 5 ? 'confirmed' : total >= 2 ? 'indeterminate' : 'unlikely';
  const verdictText = {
    confirmed: 'HFpEF confirmed',
    indeterminate: 'indeterminate -- proceed to diastolic stress echo or invasive testing',
    unlikely: 'HFpEF unlikely',
  };
  return {
    valid: true,
    total,
    verdict,
    items,
    band: `HFA-PEFF ${total}/6: ${verdictText[verdict]}.`,
    note: HFAPEFF_NOTE,
  };
}

// --- 2.5 cardShock - CardShock Risk Score (Harjola 2015) -----------------------
// age > 75 (1) + confusion (1) + prior MI/CABG (1) + ACS etiology (1) + EF < 40 (1)
// + lactate (< 2 = 0, 2-4 = 1, > 4 = 2) + eGFR (> 60 = 0, 30-60 = 1, < 30 = 2).
// Total 0-9: 0-3 low (~8.7%), 4-5 intermediate (~36%), 6-9 high (~77%) in-hospital
// mortality. The named deterministic substitute for the excluded gestalt SCAI staging.
const CARDSHOCK_NOTE = 'CardShock Risk Score (Harjola VP et al, Eur J Heart Fail 2015): in-hospital mortality in cardiogenic shock. Age > 75 (1), confusion at presentation (1), previous MI or CABG (1), ACS etiology (1), LVEF < 40% (1), blood lactate (< 2 mmol/L = 0, 2-4 = 1, > 4 = 2), eGFR (> 60 mL/min/1.73m^2 = 0, 30-60 = 1, < 30 = 2). Total 0-9: 0-3 low (~8.7%), 4-5 intermediate (~36%), 6-9 high (~77%) in-hospital mortality (band rates from the derivation cohort). A risk estimate, not a device, MCS, or transplant-listing order.';
function cardLactatePts(l) { return l < 2 ? 0 : l <= 4 ? 1 : 2; }
function cardEgfrPts(g) { return g > 60 ? 0 : g >= 30 ? 1 : 2; }
export function cardShock(input = {}) {
  const { ageOver75, confusion, priorMiCabg, acs, lowEf, lactate, egfr } = input;
  const lac = fin(lactate), gfr = fin(egfr);
  if (lac == null || gfr == null) {
    return { valid: false, band: '(enter blood lactate and eGFR, plus the clinical factors)', note: CARDSHOCK_NOTE };
  }
  const items = [
    { label: 'Age > 75', value: onFlag(ageOver75) ? 1 : 0 },
    { label: 'Confusion at presentation', value: onFlag(confusion) ? 1 : 0 },
    { label: 'Previous MI or CABG', value: onFlag(priorMiCabg) ? 1 : 0 },
    { label: 'ACS etiology', value: onFlag(acs) ? 1 : 0 },
    { label: 'LVEF < 40%', value: onFlag(lowEf) ? 1 : 0 },
    { label: 'Blood lactate', value: cardLactatePts(clamp(lac, 0, 40)) },
    { label: 'eGFR', value: cardEgfrPts(clamp(gfr, 0, 200)) },
  ];
  const total = items.reduce((acc, it) => acc + it.value, 0);
  const risk = total <= 3 ? 'low' : total <= 5 ? 'intermediate' : 'high';
  const riskText = {
    low: 'low risk (~8.7% in-hospital mortality)',
    intermediate: 'intermediate risk (~36% in-hospital mortality)',
    high: 'high risk (~77% in-hospital mortality)',
  };
  return {
    valid: true,
    total,
    risk,
    items,
    band: `CardShock ${total}/9: ${riskText[risk]}.`,
    note: CARDSHOCK_NOTE,
  };
}
