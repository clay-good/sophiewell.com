// spec-v263: respiratory & maternal acute-risk instruments — the MuLBSTA viral-pneumonia
// mortality score, the Ottawa COPD Risk Scale, and the Sepsis in Obstetrics Score (SOS).
// Third feature spec of the Bedside Acute-Care Instruments program. Each id was verified
// absent by a fixed-string scan of the extracted app.js id/name lists first (spec-v85
// §6.2). v263 runs no AI and makes no runtime network call.
//
// These compute a mortality / risk CATEGORY — none is an admission, ICU-transfer,
// discharge, or prescribing order (spec-v11 §5.3). The disposition stays with the
// clinician.
//
//   mulbsta                  - MuLBSTA 90-day mortality in viral pneumonia (0-20, >= 12 high)
//   ottawa-copd              - Ottawa COPD Risk Scale (0-16, 2014 derivation weighting)
//   sepsis-obstetrics-score  - Sepsis in Obstetrics Score (0-28, >= 6 high ICU risk)
//
// CRITERIA / WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified against the
// primary papers and independent calculators at implementation:
//   MuLBSTA - Guo L et al., Front Microbiol 2019;10:2752 (PMC6901688); multilobar +5,
//             lymphocyte <= 0.8 +4, bacterial coinfection +4, smoking current +3/former +2/
//             never 0, hypertension +2, age >= 60 +2; smoking mutually exclusive -> max 20;
//             cutoff >= 12 (~5% vs ~34% 90-day mortality).
//   Ottawa  - Stiell IG et al., CMAJ 2014;186(6):E193-E204; 2014 derivation weighting: CABG
//             +1, PVD intervention +1, prior intubation +2, HR >= 110 +2, failed/abnormal
//             walk test +2, acute ischemic ECG +2, pulmonary congestion on CXR +1, Hb < 10
//             +3, urea >= 12 +1, bicarbonate >= 35 +1; max 16; derivation serious-outcome
//             risk ~2.2% at 0 rising to ~91.4% at 10 (MDCalc uses this 2014 weighting).
//   SOS     - Albright CM et al., Am J Obstet Gynecol 2014;211(1):39.e1-39.e8, Table 2;
//             eight two-tailed APACHE-II-derived bands, total 0-28, cutoff >= 6. The band
//             point grid is transcribed from the primary Table 2 (reproduced in Int J Clin
//             Obstet Gynaecol 2024;9(3):33-37) and triangulated by the 0-28 maximum: the
//             +4-max variables (temp, HR, RR, WBC) and the immature-neutrophil (+3) and
//             lactate (+4) terms fix the one-tailed SBP (max +2) and SpO2 (max +3) columns.

function pickPoints(map, key, def = 0) {
  const v = map[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : def;
}

// --- MuLBSTA score -----------------------------------------------------------
const MULBSTA_NOTE = 'MuLBSTA score (Guo 2019): 90-day mortality risk in viral pneumonia. Multilobular infiltrate (>= 2 lobes) +5, Lymphocyte <= 0.8 x10^9/L +4, Bacterial coinfection +4, Smoking (current +3 / former +2 / never 0), hyperTension +2, Age >= 60 +2. Smoking is mutually exclusive, so the maximum total is 20. >= 12 = high risk (90-day mortality ~5% below 12 vs ~34% at/above 12; AUROC ~0.81, outperforming CURB-65 in viral pneumonia). A mortality-risk band, not an admission or ICU order.';
const MULBSTA_SMOKING = { current: [3, 'current smoker (+3)'], former: [2, 'former smoker (+2)'], never: [0, 'never smoked (0)'] };
export function mulbsta(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const fired = [];
  const boxes = [
    [o.multilobar, 'multilobular infiltrate >= 2 lobes (+5)', 5],
    [o.lymphopenia, 'lymphocyte <= 0.8 x10^9/L (+4)', 4],
    [o.bacterial, 'bacterial coinfection (+4)', 4],
    [o.hypertension, 'hypertension (+2)', 2],
    [o.ageOver60, 'age >= 60 (+2)', 2],
  ];
  for (const [on, label, pts] of boxes) { if (on === true) { total += pts; fired.push(label); } }
  // spec-v1115: `|| MULBSTA_SMOKING.never` is an explicit fallback to the
  // never-smoker band, so an unstated smoking history was scored as never having
  // smoked. The five items above are checkboxes and an unticked one is a real
  // "no" (rule 4); this one is a graded select. The score is a non-negative sum,
  // so high risk (>= 12) rules in and is untouched (rule 13).
  const smokingKnown = Object.prototype.hasOwnProperty.call(MULBSTA_SMOKING, String(o.smoking));
  const smk = smokingKnown ? MULBSTA_SMOKING[String(o.smoking)] : MULBSTA_SMOKING.never;
  if (smokingKnown) { total += smk[0]; if (smk[0] > 0) fired.push(smk[1]); }
  const high = total >= 12;
  const floored = !smokingKnown && !high;
  return { valid: true, score: total, abnormal: high, smokingStated: smokingKnown, floorOnly: floored,
    bandLabel: floored ? `MuLBSTA at least ${total}` : `MuLBSTA ${total}`,
    band: floored
      ? `MuLBSTA at least ${total} of 20 on what was entered. The smoking history is not stated and `
        + 'carries up to 3 points, so the low-risk reading cannot be given without it.'
      : `MuLBSTA ${total} of 20 — ${high ? 'high risk (90-day mortality ~34% per source, >= 12)' : 'low risk (90-day mortality ~5% per source, < 12)'}.`,
    detail: `Contributing: ${fired.length ? fired.join(', ') : 'no items positive'}.`
      + `${smokingKnown ? '' : ' The smoking history is not stated.'}`,
    note: MULBSTA_NOTE };
}

// --- Ottawa COPD Risk Scale --------------------------------------------------
const OTTAWA_NOTE = 'Ottawa COPD Risk Scale (Stiell 2014, original derivation weighting): risk of a short-term serious outcome (death, monitored-unit admission, intubation, NIV, MI, or relapse with admission) after an ED COPD exacerbation. Prior coronary bypass +1, prior peripheral-vascular-disease intervention +1, prior intubation for respiratory distress +2, heart rate >= 110/min +2, too ill to complete the walk test or SaO2 < 90% / HR >= 120 on it +2, acute ischemic ECG change +2, pulmonary congestion on chest x-ray +1, hemoglobin < 10 g/dL +3, urea >= 12 mmol/L +1, serum bicarbonate >= 35 mEq/L +1. Total 0-16. Derivation serious-outcome risk ~2.2% at 0 rising to ~91.4% at 10. A risk band, not an admission or discharge order.';
function ottawaBand(s) {
  if (s <= 1) return 'low short-term serious-outcome risk (~2-5% in the derivation)';
  if (s <= 4) return 'moderate, rising short-term serious-outcome risk';
  if (s <= 9) return 'high short-term serious-outcome risk';
  return 'very high short-term serious-outcome risk (~91% at 10 in the derivation)';
}
export function ottawaCopd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let total = 0;
  const fired = [];
  const boxes = [
    [o.cabg, 'prior coronary bypass graft (+1)', 1],
    [o.pvd, 'prior peripheral-vascular-disease intervention (+1)', 1],
    [o.priorIntubation, 'prior intubation for respiratory distress (+2)', 2],
    [o.hr110, 'heart rate >= 110/min on arrival (+2)', 2],
    [o.walkTestFail, 'failed/abnormal post-treatment walk test (+2)', 2],
    [o.ischemicEcg, 'acute ischemic change on ECG (+2)', 2],
    [o.pulmCongestion, 'pulmonary congestion on chest x-ray (+1)', 1],
    [o.hbLow, 'hemoglobin < 10 g/dL (+3)', 3],
    [o.ureaHigh, 'urea >= 12 mmol/L (+1)', 1],
    [o.bicarbHigh, 'serum bicarbonate >= 35 mEq/L (+1)', 1],
  ];
  for (const [on, label, pts] of boxes) { if (on === true) { total += pts; fired.push(label); } }
  const label = ottawaBand(total);
  return { valid: true, score: total, abnormal: total >= 5, bandLabel: `Ottawa COPD ${total}`,
    band: `Ottawa COPD ${total} of 16 — ${label}.`,
    detail: `Contributing: ${fired.length ? fired.join(', ') : 'no criteria positive'}.`, note: OTTAWA_NOTE };
}

// --- Sepsis in Obstetrics Score (SOS) ----------------------------------------
// Albright 2014 Table 2. Each variable is a banded single choice; normal band = 0.
// The two-tailed grid, transcribed from the primary table and fixed by the 0-28 maximum.
const SOS_NOTE = 'Sepsis in Obstetrics Score (Albright 2014): a pregnancy-specific, APACHE-II-derived sepsis score that quantifies ICU-admission risk. Eight two-tailed physiologic/laboratory variables (temperature, systolic BP, heart rate, respiratory rate, SpO2, WBC, % immature neutrophils, lactic acid), total 0-28. >= 6 = high risk of critical-care admission (derivation AUC ~0.97 for ICU admission; sensitivity ~89%, specificity ~95%, NPV ~99.9%). Complements the general MEOWS track. An ICU-admission-risk band, not an admission, transfer, or antibiotic order.';
const SOS_TEMP = { normal: 0, gt409: 4, t39_409: 3, t385_389: 2, t34_359: 1, t32_339: 2, t30_319: 3, lt30: 4 };
const SOS_SBP = { normal: 0, s70_90: 1, lt70: 2 };
const SOS_HR = { normal: 0, h120_129: 1, h130_149: 2, h150_179: 3, gt179: 4 };
const SOS_RR = { normal: 0, r10_11: 1, r6_9: 2, le5: 4, r25_34: 2, r35_49: 3, gt49: 4 };
const SOS_SPO2 = { normal: 0, o90_91: 1, o85_89: 2, lt85: 3 };
const SOS_WBC = { normal: 0, w3_56: 1, w1_29: 2, lt1: 4, w17_249: 2, w25_399: 3, gt399: 4 };
const SOS_IMMATURE = { normal: 0, ge10: 3 };
const SOS_LACTIC = { normal: 0, ge4: 4 };
// spec-v1108's ledger, drained in spec-v1109. `pickPoints` falls back to 0 for a
// key its table does not hold, and 0 is the NORMAL band of all eight variables.
// So a variable nobody measured was scored as normal, and the detail line said
// it in words -- "Deranged: all variables normal" -- about eight observations
// nobody had taken:
//
//   sepsisObstetricsScore({})  ->  "SOS 0 of 28 — low risk of critical-care
//                                   admission (< 6)."
//
// Every point in the eight tables is >= 0, so the total is MONOTONE and what was
// measured gives a FLOOR. `sosCoefficients` is exported so a test can hold that
// (spec-v1107, rule 19). Rule 13 keeps the high-risk reading unfooted: an
// unmeasured variable cannot bring a score of 6 back under 6.
export const sosCoefficients = {
  temp: SOS_TEMP, sbp: SOS_SBP, hr: SOS_HR, rr: SOS_RR,
  spo2: SOS_SPO2, wbc: SOS_WBC, immature: SOS_IMMATURE, lactic: SOS_LACTIC,
};

export function sepsisObstetricsScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const spec = [
    ['temperature', SOS_TEMP, o.temp, 'a temperature'],
    ['systolic BP', SOS_SBP, o.sbp, 'a systolic blood pressure'],
    ['heart rate', SOS_HR, o.hr, 'a heart rate'],
    ['respiratory rate', SOS_RR, o.rr, 'a respiratory rate'],
    ['SpO2', SOS_SPO2, o.spo2, 'an SpO2'],
    ['WBC', SOS_WBC, o.wbc, 'a white cell count'],
    ['% immature neutrophils', SOS_IMMATURE, o.immature, 'the immature neutrophil percentage'],
    ['lactic acid', SOS_LACTIC, o.lactic, 'a lactate'],
  ];
  let total = 0;
  const fired = [];
  const unmeasured = [];
  for (const [label, table, key, name] of spec) {
    if (!Object.prototype.hasOwnProperty.call(table, key)) { unmeasured.push(name); continue; }
    const pts = pickPoints(table, key);
    total += pts;
    if (pts > 0) fired.push(`${label} (+${pts})`);
  }
  const high = total >= 6;
  const floored = unmeasured.length > 0 && !high;
  return { valid: true, score: total, abnormal: high, unmeasured,
    floorOnly: floored,
    bandLabel: floored ? `SOS at least ${total}` : `SOS ${total}`,
    band: floored
      ? `SOS at least ${total} of 28 on what was measured. ${unmeasured.length} of the 8 variables `
        + `${unmeasured.length === 1 ? 'is' : 'are'} not recorded (${unmeasured.join(', ')}), and `
        + 'each can only raise the score, so the low-risk reading cannot be given yet.'
      : `SOS ${total} of 28 — ${high ? 'high risk of critical-care admission (>= 6)' : 'low risk of critical-care admission (< 6)'}.`,
    detail: unmeasured.length
      ? `Deranged: ${fired.length ? fired.join(', ') : 'nothing recorded so far'}. Not recorded: ${unmeasured.join(', ')}.`
      : `Deranged: ${fired.length ? fired.join(', ') : 'all variables normal'}.`,
    note: SOS_NOTE };
}
