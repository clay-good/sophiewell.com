// spec-v232: thrombosis / coagulation bedside scores — the Villalta scale for
// post-thrombotic syndrome and the ISTH sepsis-induced-coagulopathy (SIC) score.
// Each id was verified absent by a fixed-string scan of the extracted app.js
// id/name lists AND the MCP adapter set first (spec-v85 §6.2). v232 runs no AI and
// makes no runtime network call.
//
// These grade / classify — they are NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   villalta - Villalta post-thrombotic-syndrome scale
//   sic      - ISTH sepsis-induced coagulopathy score
//
// POINT SYSTEMS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num } from './num.js';

function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'on'; }
function lvl(v, hi) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return 0;
  return Math.round(n);
}

// --- Villalta scale ----------------------------------------------------------
// Villalta S, et al (1994); standardized in Kahn SR, et al. J Thromb Haemost.
// 2009;7(5):884-888: 5 symptoms (pain, cramps, heaviness, paresthesia, pruritus)
// and 6 signs (pretibial edema, skin induration, hyperpigmentation, redness,
// venous ectasia, pain on calf compression), each 0-3 (max 33). 0-4 no PTS, 5-9
// mild, 10-14 moderate, >= 15 severe; a venous ulcer is severe regardless.
const VILLALTA_NOTE = 'Villalta scale (Villalta S, et al 1994; Kahn SR, et al. J Thromb Haemost. 2009;7(5):884-888): 5 symptoms (pain, cramps, heaviness, paresthesia, pruritus) and 6 signs (pretibial edema, skin induration, hyperpigmentation, redness, venous ectasia, pain on calf compression), each 0-3 (max 33). 0-4 no PTS, 5-9 mild, 10-14 moderate, >= 15 severe; a venous ulcer is severe regardless of the total. A grading scale, not a diagnosis or treatment order.';
const VILLALTA_ITEMS = ['pain', 'cramps', 'heaviness', 'paresthesia', 'pruritus', 'edema', 'induration', 'hyperpigmentation', 'redness', 'ectasia', 'compressionPain'];
export function villalta(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let s = 0;
  for (const k of VILLALTA_ITEMS) s += lvl(o[k], 3);
  const score = Math.round(num('Villalta', s, { min: 0, max: 33 }));
  const ulcer = bool(o.ulcer);
  let tier; let abnormal = true;
  if (ulcer || score >= 15) tier = ulcer ? 'severe post-thrombotic syndrome (venous ulcer)' : 'severe post-thrombotic syndrome (>= 15)';
  else if (score >= 10) tier = 'moderate post-thrombotic syndrome (10-14)';
  else if (score >= 5) tier = 'mild post-thrombotic syndrome (5-9)';
  else { tier = 'no post-thrombotic syndrome (0-4)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `Villalta ${score}`, band: `Villalta score ${score} — ${tier}.`, detail: ulcer ? 'Venous ulcer present.' : 'No venous ulcer.', note: VILLALTA_NOTE };
}

// --- ISTH sepsis-induced coagulopathy (SIC) ----------------------------------
// Iba T, et al. J Thromb Haemost. 2019 (ISTH SSC): platelet count (>= 150 = 0,
// 100-150 = 1, < 100 = 2), PT-INR (<= 1.2 = 0, 1.2-1.4 = 1, > 1.4 = 2), and total
// SOFA (0 = 0, 1 = 1, >= 2 = 2). A total >= 4 diagnoses SIC.
const SIC_NOTE = 'ISTH sepsis-induced coagulopathy score (Iba T, et al. J Thromb Haemost. 2019): platelet count (>= 150 = 0, 100-150 = 1, < 100 = 2), PT-INR (<= 1.2 = 0, 1.2-1.4 = 1, > 1.4 = 2), and total SOFA (0 = 0, 1 = 1, >= 2 = 2, capped). A total >= 4 diagnoses sepsis-induced coagulopathy. A scoring aid, not a diagnosis or treatment order.';
export function sic(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const plt = lvl(o.platelet, 2), inr = lvl(o.inr, 2), sofa = lvl(o.sofa, 2);
  const score = Math.round(num('SIC', plt + inr + sofa, { min: 0, max: 6 }));
  const abnormal = score >= 4;
  return { valid: true, score, abnormal, bandLabel: `SIC ${score}`, band: `Sepsis-induced coagulopathy score ${score} — ${abnormal ? 'meets SIC (>= 4)' : 'does not meet SIC (< 4)'}.`, detail: `Platelet ${plt}, PT-INR ${inr}, SOFA ${sofa}.`, note: SIC_NOTE };
}
