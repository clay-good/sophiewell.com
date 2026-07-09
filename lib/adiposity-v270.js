// spec-v270: the Cardiometabolic Index (CMI) — a lipid × central-adiposity composite
// that joins the visceral-adiposity-index / lipid-accumulation-product family (group G).
// It computes from a triglyceride, HDL, waist circumference, and height already in hand.
// The id was verified absent by a direct scan of app.js AND the MCP adapter set first
// (spec-v85 §6.2). v270 runs no AI and makes no runtime network call.
//
// This computes a lab/anthropometric-derived index — it is NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3).
//
//   cmi - (triglycerides / HDL-C) x (waist / height)
//
// FORMULA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see the function header).

import { num, r2 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Cardiometabolic Index ---------------------------------------------------
// CMI = (TG / HDL-C) x (waist circumference / height) (Wakabayashi I, Daimon T. The
// "cardiometabolic index" as a new marker determined by adiposity and blood lipids for
// discrimination of diabetes mellitus. Clin Chim Acta. 2015;438:274-278). TG and HDL in the
// same units (the ratio is unitless); waist and height in the same units (the ratio is the
// waist-to-height ratio). Cross-verified against subsequent validation cohorts, which reuse
// the identical (TG/HDL) x (waist/height) definition. A HIGHER CMI marks a worse
// cardiometabolic profile.
const CMI_NOTE = 'Cardiometabolic Index = (triglycerides / HDL-C) x (waist circumference / height) (Wakabayashi & Daimon 2015). A composite of the atherogenic TG/HDL ratio and the waist-to-height ratio; a HIGHER value marks a worse cardiometabolic profile and tracks with diabetes and cardiovascular risk. Cut-points are sex- and cohort-specific — no universal threshold. A lab/anthropometric-derived index, not a diagnosis or treatment order. Enter triglycerides and HDL in the same units, and waist and height in the same units.';
export function cmi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tg = pos(o.tg, 5, 10000);
  const hdl = pos(o.hdl, 1, 500);
  const waist = pos(o.waist, 20, 300);
  const height = pos(o.height, 50, 260);
  if (tg === null || hdl === null || waist === null || height === null) {
    return { valid: false, message: 'Enter triglycerides, HDL cholesterol (same units), waist circumference, and height (same units).' };
  }
  const tgHdl = tg / hdl;
  const whtr = waist / height;
  const score = r2(num('CMI', tgHdl * whtr, { min: 0, max: 100000 }));
  return { valid: true, score, abnormal: false, bandLabel: `CMI ${score}`,
    band: `Cardiometabolic Index ${score} — higher values mark a worse cardiometabolic profile; interpretation is context-dependent (no universal cutoff).`,
    detail: `TG/HDL ${r2(num('tghdl', tgHdl, { min: 0, max: 100000 }))} x waist/height ${r2(num('whtr', whtr, { min: 0, max: 100 }))}.`, note: CMI_NOTE };
}
