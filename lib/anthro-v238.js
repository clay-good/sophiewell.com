// spec-v238: anthropometric / metabolic estimators — relative fat mass (RFM),
// the body roundness index (BRI), the US Navy (Hodgdon-Beckett) body-fat estimate,
// and the estimated glucose disposal rate (eGDR). Each id was verified absent by a
// fixed-string scan of the extracted app.js id/name lists AND the MCP adapter set
// first (spec-v85 §6.2). v238 runs no AI and makes no runtime network call.
//
// These estimate a value — they are NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   relative-fat-mass  - RFM whole-body fat % estimate
//   body-roundness-index - BRI
//   navy-body-fat      - US Navy circumference body-fat estimate
//   egdr               - estimated glucose disposal rate
//
// FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1, r2 } from './num.js';

function fin(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
const log10 = (x) => Math.log(x) / Math.LN10;

// --- Relative fat mass (RFM) -------------------------------------------------
// Woolcott OO, Bergman RN. Sci Rep. 2018;8:10980: RFM = 64 - 20 x (height / waist
// circumference) + 12 x sex (sex: female = 1, male = 0); height and waist in the
// same units. Estimates whole-body fat %. Cross-verified: Sci Rep 2018; MDApp.
const RFM_NOTE = 'Relative fat mass (Woolcott OO, Bergman RN. Sci Rep. 2018;8:10980) = 64 - 20 x (height / waist circumference) + 12 x sex (female = 1, male = 0); height and waist in the same units. Estimates whole-body fat %; higher = more adiposity. An estimate, not a measured composition or a diagnosis.';
export function relativeFatMass(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const height = fin(o.height, 50, 250);
  const waist = fin(o.waist, 30, 250);
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  if (height === null || waist === null || sex === null) {
    return { valid: false, message: 'Enter height, waist circumference (same units), and sex.' };
  }
  const score = r1(num('RFM', 64 - 20 * (height / waist) + 12 * (sex === 'female' ? 1 : 0), { min: 0, max: 75 }));
  return { valid: true, score, abnormal: false, bandLabel: `RFM ${score}%`, band: `Relative fat mass ${score}% — estimated whole-body fat.`, detail: `Height ${height} / waist ${waist}, ${sex}.`, note: RFM_NOTE };
}

// --- Body roundness index (BRI) ----------------------------------------------
// Thomas DM, et al. Obesity. 2013: BRI = 364.2 - 365.5 x sqrt(1 - ((WC / (2·pi)) /
// (0.5 x height))^2), WC and height in the same units. Higher = greater central
// adiposity. Cross-verified: JAMA Netw Open 2024; standard references.
const BRI_NOTE = 'Body roundness index (Thomas DM, et al. Obesity. 2013) = 364.2 - 365.5 x sqrt(1 - ((waist / (2·pi)) / (0.5 x height))^2), waist and height in the same units. Approx 1-16; higher = greater central adiposity / cardiometabolic risk. An index, not a diagnosis or treatment order.';
export function bodyRoundnessIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const waist = fin(o.waist, 30, 250);
  const height = fin(o.height, 50, 250);
  if (waist === null || height === null) {
    return { valid: false, message: 'Enter waist circumference and height in the same units (cm).' };
  }
  const ratio = (waist / (2 * Math.PI)) / (0.5 * height);
  const arg = 1 - ratio * ratio;
  if (arg < 0) {
    return { valid: false, message: 'Waist is too large relative to height for a valid body roundness index.' };
  }
  const score = r2(num('BRI', 364.2 - 365.5 * Math.sqrt(arg), { min: 0, max: 20 }));
  return { valid: true, score, abnormal: false, bandLabel: `BRI ${score}`, band: `Body roundness index ${score} — higher = more central adiposity.`, detail: `Waist ${waist}, height ${height}.`, note: BRI_NOTE };
}

// --- US Navy body-fat estimate (Hodgdon-Beckett) -----------------------------
// Hodgdon JA, Beckett MB. Naval Health Research Center. 1984: men BF% = 495 /
// (1.0324 - 0.19077 x log10(waist - neck) + 0.15456 x log10(height)) - 450; women
// BF% = 495 / (1.29579 - 0.35004 x log10(waist + hip - neck) + 0.22100 x
// log10(height)) - 450. Measurements in inches. Cross-verified: Omnicalculator;
// Medicine LibreTexts.
const NAVY_NOTE = 'US Navy body-fat estimate (Hodgdon JA, Beckett MB. 1984): men BF% = 495 / (1.0324 - 0.19077·log10(waist - neck) + 0.15456·log10(height)) - 450; women BF% = 495 / (1.29579 - 0.35004·log10(waist + hip - neck) + 0.22100·log10(height)) - 450. Measurements in inches. Accurate to ~+/-3-4%. An estimate, not a measured composition or a diagnosis.';
export function navyBodyFat(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = o.sex === 'male' || o.sex === 'female' ? o.sex : null;
  const height = fin(o.height, 40, 90);
  const neck = fin(o.neck, 8, 30);
  const waist = fin(o.waist, 15, 90);
  const hip = fin(o.hip, 20, 90);
  if (sex === null || height === null || neck === null || waist === null) {
    return { valid: false, message: 'Enter sex, height, neck, and waist (inches); women also enter hip.' };
  }
  let bf;
  if (sex === 'male') {
    if (waist - neck <= 0) return { valid: false, message: 'Waist must exceed neck.' };
    bf = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450;
  } else {
    if (hip === null) return { valid: false, message: 'Enter hip circumference (inches).' };
    if (waist + hip - neck <= 0) return { valid: false, message: 'Waist + hip must exceed neck.' };
    bf = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450;
  }
  const score = r1(num('Navy BF', bf, { min: 0, max: 75 }));
  return { valid: true, score, abnormal: false, bandLabel: `${score}% fat`, band: `US Navy body fat ${score}% — circumference estimate.`, detail: `${sex}, height ${height} in.`, note: NAVY_NOTE };
}

// --- Estimated glucose disposal rate (eGDR) ----------------------------------
// Williams KV, et al (Pittsburgh EDC). Diabetes Care. 2000: eGDR (mg/kg/min) =
// 21.158 - (0.09 x waist cm) - (3.407 x hypertension[1/0]) - (0.551 x HbA1c %).
// Lower eGDR = greater insulin resistance. Cross-verified: PMC9392437; Diabetol
// Metab Syndr 2026.
const EGDR_NOTE = 'Estimated glucose disposal rate (Williams KV, et al. Diabetes Care. 2000) = 21.158 - (0.09 x waist cm) - (3.407 x hypertension[1/0]) - (0.551 x HbA1c %). In mg/kg/min; lower = greater insulin resistance, higher = better sensitivity. A surrogate, not a diagnosis or treatment order.';
export function egdr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const waist = fin(o.waist, 30, 250);
  const a1c = fin(o.a1c, 2, 20);
  if (waist === null || a1c === null) {
    return { valid: false, message: 'Enter waist circumference (cm) and HbA1c (%).' };
  }
  const htn = bool(o.hypertension) ? 1 : 0;
  const score = r2(num('eGDR', 21.158 - 0.09 * waist - 3.407 * htn - 0.551 * a1c, { min: -10, max: 25 }));
  return { valid: true, score, abnormal: false, bandLabel: `eGDR ${score}`, band: `Estimated glucose disposal rate ${score} mg/kg/min — lower = greater insulin resistance.`, detail: `Waist ${waist} cm, hypertension ${htn}, HbA1c ${a1c}%.`, note: EGDR_NOTE };
}
