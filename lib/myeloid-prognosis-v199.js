// spec-v199: four deterministic myeloid-neoplasm & transplant prognostic
// instruments (Deep Subspecialty Quantitation program, spec-v199 §1.1). Every
// id was verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v199 runs no AI and makes no runtime network call.
// These stratify prognosis — they are not transplant, conditioning,
// chemotherapy, or disposition orders (spec-v11 §5.3).
//
// The proposed fifth instrument (ELTS) was DROPPED at implementation: the
// spec-v85 §6.2 collision re-check found ELTS is already computed by the live
// `sokal-cml` tile (lib/hemonc-v94.js sokalCml, same 0.0025/0.0615/0.1052/0.4104
// coefficients and the same ≤1.5680 / ≤2.2185 bands), so a standalone tile would
// duplicate it. v199 therefore ships +4, not +5.
//
//   mipss70     - MIPSS70 (primary myelofibrosis, transplantation-age)
//   gipss       - GIPSS (genetically inspired prognostic scoring system, PMF)
//   mysecPm     - MYSEC-PM (myelofibrosis secondary to PV / ET)
//   hctCi       - Hematopoietic Cell Transplantation Comorbidity Index (Sorror)
//
// COEFFICIENTS / POINT WEIGHTS / RISK BANDS RE-FETCHED, NEVER RECALLED
// (spec-v97), each cross-verified across >= 2 independent open sources at
// implementation:
//   - MIPSS70 (base) point weights (Guglielmelli P, et al, J Clin Oncol
//     2018;36(4):310-318; Blood 2025;145(3):257 MPN scoring review): hemoglobin
//     <10 g/dL +1, leukocytes >25 ×10⁹/L +2, platelets <100 ×10⁹/L +2,
//     circulating blasts ≥2% +1, marrow fibrosis grade ≥2 +1, constitutional
//     symptoms +1, absence of CALR type-1/like +1, HMR category (≥1 HMR
//     mutation) +1, ≥2 HMR mutations +2 (CUMULATIVE with the HMR-category point,
//     so ≥2 HMR contributes 3; total range 0–12). Groups: low 0–1,
//     intermediate 2–4, high ≥5.
//   - GIPSS point weights (Tefferi A, et al, Leukemia 2018;32(7):1631-1642):
//     VHR karyotype +2 OR unfavorable karyotype +1 (mutually exclusive);
//     absence of CALR type-1/like +1; ASXL1 +1; SRSF2 +1; U2AF1Q157 +1. Total
//     range 0–6 (the spec-v199 draft's "0–8" was a drafting slip corrected here
//     under spec-v97). Groups: low 0, intermediate-1 1, intermediate-2 2,
//     high ≥3.
//   - MYSEC-PM (Passamonti F, et al, Leukemia 2017;31(12):2726-2731; Palandri
//     ScienceDirect validation): 0.15·age (per year, continuous) + hemoglobin
//     <11 g/dL +2 + circulating blasts ≥3% +2 + CALR-unmutated +2 + platelets
//     <150 ×10⁹/L +1 + constitutional symptoms +1. Groups: low <11,
//     intermediate-1 ≥11 to <14, intermediate-2 ≥14 to <16, high ≥16.
//   - HCT-CI (Sorror ML, et al, Blood 2005;106(8):2912-2919; MDCalc HCT-CI):
//     +1 arrhythmia, cardiac, IBD, diabetes, cerebrovascular, psychiatric,
//     obesity (BMI >35), infection; +1 mild hepatic; +2 rheumatologic, peptic
//     ulcer, moderate renal, moderate pulmonary; +3 prior solid tumor, heart-
//     valve disease, severe pulmonary, moderate/severe hepatic. (The spec-v199
//     draft's +1 for rheumatologic and peptic ulcer was a drafting slip — the
//     published Sorror grid weights both +2; corrected here under spec-v97.)
//     Groups: low 0, intermediate 1–2, high ≥3.

import { num, r2 } from './num.js';

function inRange(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function bool(v) { return v === true || v === '1' || v === 'true' || v === 'yes'; }

// --- 2.2 MIPSS70 ------------------------------------------------------------
const MIPSS70_NOTE = 'MIPSS70 (Guglielmelli P, et al, J Clin Oncol 2018;36(4):310-318): the transplantation-age prognostic model for primary myelofibrosis that adds molecular data to the clinical picture. Weights — anemia, blasts, fibrosis, constitutional symptoms, absence of CALR type-1/like, and HMR category each +1; leukocytosis and thrombocytopenia +2 each; ≥2 HMR mutations a further +2 (total 0–12). Groups: low 0–1, intermediate 2–4, high ≥5. A prognostic estimate, not a transplant order.';

export function mipss70(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const items = [
    ['Hemoglobin < 10 g/dL', bool(o.hb), 1],
    ['Leukocytes > 25 ×10⁹/L', bool(o.wbc), 2],
    ['Platelets < 100 ×10⁹/L', bool(o.plt), 2],
    ['Circulating blasts ≥ 2%', bool(o.blasts), 1],
    ['Bone-marrow fibrosis grade ≥ 2', bool(o.fibrosis), 1],
    ['Constitutional symptoms', bool(o.constitutional), 1],
    ['Absence of CALR type-1/like', bool(o.noCalr), 1],
  ];
  const hmr = o.hmr === 'one' ? 'one' : o.hmr === 'twoPlus' ? 'twoPlus' : 'none';
  let score = 0;
  const present = [];
  for (const [label, on, w] of items) { if (on) { score += w; present.push(`${label} (+${w})`); } }
  if (hmr === 'one') { score += 1; present.push('One HMR mutation (+1)'); }
  else if (hmr === 'twoPlus') { score += 3; present.push('≥ 2 HMR mutations (HMR category +1, ≥2 HMR +2 = +3)'); }
  score = num('MIPSS70', score, { min: 0, max: 12 });
  let group; let abnormal = true;
  if (score <= 1) { group = 'low-risk (0–1)'; abnormal = false; }
  else if (score <= 4) group = 'intermediate-risk (2–4)';
  else group = 'high-risk (≥ 5)';
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `MIPSS70 ${score}`,
    band: `MIPSS70 ${score} — ${group}.`,
    detail: present.length ? `Contributors: ${present.join('; ')}.` : 'No listed risk factors selected — score 0.',
    note: MIPSS70_NOTE,
  };
}

// --- 2.3 GIPSS --------------------------------------------------------------
const GIPSS_NOTE = 'GIPSS (Tefferi A, et al, Leukemia 2018;32(7):1631-1642): the mutation-and-karyotype-only companion to MIPSS70 for primary myelofibrosis. VHR karyotype +2 or unfavorable karyotype +1; absence of CALR type-1/like +1; ASXL1 +1; SRSF2 +1; U2AF1Q157 +1 (total 0–6). Groups: low 0, intermediate-1 1, intermediate-2 2, high ≥3. A prognostic estimate, not an order.';

export function gipss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const karyo = o.karyotype === 'vhr' ? 'vhr' : o.karyotype === 'unfavorable' ? 'unfavorable' : 'favorable';
  let score = 0;
  const present = [];
  if (karyo === 'vhr') { score += 2; present.push('Very-high-risk karyotype (+2)'); }
  else if (karyo === 'unfavorable') { score += 1; present.push('Unfavorable karyotype (+1)'); }
  const items = [
    ['Absence of CALR type-1/like', bool(o.noCalr)],
    ['ASXL1 mutation', bool(o.asxl1)],
    ['SRSF2 mutation', bool(o.srsf2)],
    ['U2AF1 Q157 mutation', bool(o.u2af1)],
  ];
  for (const [label, on] of items) { if (on) { score += 1; present.push(`${label} (+1)`); } }
  score = num('GIPSS', score, { min: 0, max: 6 });
  let group; let abnormal = true;
  if (score === 0) { group = 'low risk (0)'; abnormal = false; }
  else if (score === 1) group = 'intermediate-1 risk (1)';
  else if (score === 2) group = 'intermediate-2 risk (2)';
  else group = 'high risk (≥ 3)';
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `GIPSS ${score}`,
    band: `GIPSS ${score} — ${group}.`,
    detail: present.length ? `Contributors: ${present.join('; ')}.` : 'Favorable karyotype, no listed lesion — score 0.',
    note: GIPSS_NOTE,
  };
}

// --- 2.4 MYSEC-PM -----------------------------------------------------------
const MYSEC_NOTE = 'MYSEC-PM (Passamonti F, et al, Leukemia 2017;31(12):2726-2731): the dedicated model for post-PV / post-ET (secondary) myelofibrosis, where DIPSS underperforms. Score = 0.15·age + hemoglobin <11 g/dL (+2) + circulating blasts ≥3% (+2) + CALR-unmutated (+2) + platelets <150 ×10⁹/L (+1) + constitutional symptoms (+1). Groups: low <11, intermediate-1 ≥11 to <14, intermediate-2 ≥14 to <16, high ≥16. A prognostic estimate, not an order.';

export function mysecPm(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = inRange(o.age, 12, 110);
  if (age === null) return { valid: false, message: 'Enter the age (years).' };
  const items = [
    ['Hemoglobin < 11 g/dL', bool(o.hb), 2],
    ['Circulating blasts ≥ 3%', bool(o.blasts), 2],
    ['CALR-unmutated', bool(o.noCalr), 2],
    ['Platelets < 150 ×10⁹/L', bool(o.plt), 1],
    ['Constitutional symptoms', bool(o.constitutional), 1],
  ];
  let score = 0.15 * age;
  const present = [`Age ${age} × 0.15 = ${r2(0.15 * age)}`];
  for (const [label, on, w] of items) { if (on) { score += w; present.push(`${label} (+${w})`); } }
  score = r2(num('MYSEC-PM', score, { min: 0, max: 100 }));
  let group; let abnormal = true;
  if (score < 11) { group = 'low risk (< 11)'; abnormal = false; }
  else if (score < 14) group = 'intermediate-1 risk (≥ 11 to < 14)';
  else if (score < 16) group = 'intermediate-2 risk (≥ 14 to < 16)';
  else group = 'high risk (≥ 16)';
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `MYSEC-PM ${score}`,
    band: `MYSEC-PM ${score} — ${group}.`,
    detail: `${present.join('; ')} = ${score}.`,
    note: MYSEC_NOTE,
  };
}

// --- 2.5 HCT-CI -------------------------------------------------------------
const HCTCI_NOTE = 'HCT-CI (Sorror ML, et al, Blood 2005;106(8):2912-2919): the pre-transplant non-relapse-mortality risk estimate the transplant team weighs against disease risk before allogeneic HCT. +1 arrhythmia, cardiac, IBD, diabetes, cerebrovascular, psychiatric, obesity (BMI >35), infection, mild hepatic; +2 rheumatologic, peptic ulcer, moderate renal, moderate pulmonary; +3 prior solid tumor, heart-valve disease, severe pulmonary, moderate/severe hepatic. Groups: low 0, intermediate 1–2, high ≥3. A prognostic estimate, not a go/no-go transplant order.';

const HCTCI_ITEMS = [
  ['arrhythmia', 'Arrhythmia', 1],
  ['cardiac', 'Cardiac (CAD / CHF / MI / EF ≤ 50%)', 1],
  ['ibd', 'Inflammatory bowel disease', 1],
  ['diabetes', 'Diabetes (on treatment)', 1],
  ['cerebrovascular', 'Cerebrovascular disease', 1],
  ['psychiatric', 'Psychiatric disturbance', 1],
  ['obesity', 'Obesity (BMI > 35)', 1],
  ['infection', 'Infection (antibiotics past day 0)', 1],
  ['rheumatologic', 'Rheumatologic disease', 2],
  ['pepticUlcer', 'Peptic ulcer (needing treatment)', 2],
  ['renalModerate', 'Moderate renal (Cr > 2 mg/dL / dialysis / transplant)', 2],
  ['solidTumor', 'Prior solid tumor', 3],
  ['heartValve', 'Heart-valve disease', 3],
];

export function hctCi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let score = 0;
  const present = [];
  for (const [key, label, w] of HCTCI_ITEMS) {
    if (bool(o[key])) { score += w; present.push(`${label} (+${w})`); }
  }
  // Hepatic and pulmonary are graded (mutually-exclusive severities) to avoid
  // double-counting the mild/moderate and severe rows.
  const hepatic = o.hepatic === 'mild' ? 'mild' : o.hepatic === 'severe' ? 'severe' : 'none';
  if (hepatic === 'mild') { score += 1; present.push('Mild hepatic (+1)'); }
  else if (hepatic === 'severe') { score += 3; present.push('Moderate/severe hepatic (+3)'); }
  const pulmonary = o.pulmonary === 'moderate' ? 'moderate' : o.pulmonary === 'severe' ? 'severe' : 'none';
  if (pulmonary === 'moderate') { score += 2; present.push('Moderate pulmonary (+2)'); }
  else if (pulmonary === 'severe') { score += 3; present.push('Severe pulmonary (+3)'); }
  score = num('HCT-CI', score, { min: 0, max: 29 });
  let group; let abnormal = true;
  if (score === 0) { group = 'low risk (0)'; abnormal = false; }
  else if (score <= 2) group = 'intermediate risk (1–2)';
  else group = 'high risk (≥ 3)';
  return {
    valid: true,
    score,
    abnormal,
    bandLabel: `HCT-CI ${score}`,
    band: `HCT-CI ${score} — ${group}.`,
    detail: present.length ? `Contributors: ${present.join('; ')}.` : 'No listed comorbidity selected — score 0.',
    note: HCTCI_NOTE,
  };
}
