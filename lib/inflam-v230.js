// spec-v230: prognostic inflammation indices — the lymphocyte-to-monocyte ratio,
// the systemic inflammation response index, the pan-immune-inflammation value, and
// the CRP-to-albumin ratio. Each computes from CBC / basic-chemistry values already
// in hand and extends the spec-v229 index family (NLR/PLR/SII). Every id was
// verified absent by a direct scan of app.js AND the MCP adapter set first
// (spec-v85 §6.2). v230 runs no AI and makes no runtime network call.
//
// These compute a lab value — they are NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   lmr  - lymphocyte-to-monocyte ratio
//   siri - systemic inflammation response index
//   piv  - pan-immune-inflammation value
//   car  - CRP-to-albumin ratio
//
// FORMULAS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see per-function headers).

import { num, r1, r2 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Lymphocyte-to-monocyte ratio --------------------------------------------
// LMR = absolute lymphocyte count / absolute monocyte count. Unlike the other
// indices here, a LOW LMR marks a worse inflammatory/prognostic profile. Counts in
// any consistent unit (10^3/uL); the ratio is unitless.
const LMR_NOTE = 'Lymphocyte-to-monocyte ratio = absolute lymphocyte count / absolute monocyte count. A prognostic inflammation marker; unlike the neutrophil-based ratios, a LOWER LMR marks a worse profile. No universal cutoff — context-dependent, a lab value, not a diagnosis or treatment order.';
export function lmr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const alc = pos(o.alc, 0.001, 500);
  const amc = pos(o.amc, 0.001, 500);
  if (alc === null || amc === null) {
    return { valid: false, message: 'Enter absolute lymphocyte count and absolute monocyte count (10^3/uL).' };
  }
  const score = r2(num('LMR', alc / amc, { min: 0, max: 100000 }));
  return { valid: true, score, abnormal: false, bandLabel: `LMR ${score}`, band: `Lymphocyte-to-monocyte ratio ${score} — interpretation is context-dependent (a lower value is less favorable).`, detail: `ALC ${alc} / AMC ${amc}.`, note: LMR_NOTE };
}

// --- Systemic inflammation response index ------------------------------------
// SIRI = ANC x AMC / ALC (Qi Q, et al. Cancer. 2016;122(14):2158-2167). Counts in
// 10^3/uL (10^9/L); higher values reflect a more pro-inflammatory state.
const SIRI_NOTE = 'Systemic inflammation response index = absolute neutrophil count x absolute monocyte count / absolute lymphocyte count (Qi Q, et al. Cancer. 2016;122(14):2158-2167). Higher values reflect a more pro-inflammatory state and track with a worse prognosis across many conditions. No universal cutoff — context-dependent, a lab value, not a diagnosis or treatment order.';
export function siri(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const anc = pos(o.anc, 0.001, 500);
  const amc = pos(o.amc, 0.001, 500);
  const alc = pos(o.alc, 0.001, 500);
  if (anc === null || amc === null || alc === null) {
    return { valid: false, message: 'Enter absolute neutrophil, monocyte, and lymphocyte counts (10^3/uL).' };
  }
  const score = r2(num('SIRI', (anc * amc) / alc, { min: 0, max: 1000000 }));
  return { valid: true, score, abnormal: false, bandLabel: `SIRI ${score}`, band: `Systemic inflammation response index ${score} — interpretation is context-dependent.`, detail: `ANC ${anc} x AMC ${amc} / ALC ${alc}.`, note: SIRI_NOTE };
}

// --- Pan-immune-inflammation value -------------------------------------------
// PIV = ANC x platelets x AMC / ALC (Fuca G, et al. Br J Cancer. 2020;123(3):403-409).
// Counts in 10^3/uL (10^9/L); higher values reflect a more pro-inflammatory state.
const PIV_NOTE = 'Pan-immune-inflammation value = absolute neutrophil count x platelets x absolute monocyte count / absolute lymphocyte count (Fuca G, et al. Br J Cancer. 2020;123(3):403-409). Higher values reflect a more pro-inflammatory state and track with a worse prognosis across many conditions. No universal cutoff — context-dependent, a lab value, not a diagnosis or treatment order.';
export function piv(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const anc = pos(o.anc, 0.001, 500);
  const plt = pos(o.plt, 0.1, 3000);
  const amc = pos(o.amc, 0.001, 500);
  const alc = pos(o.alc, 0.001, 500);
  if (anc === null || plt === null || amc === null || alc === null) {
    return { valid: false, message: 'Enter absolute neutrophil, platelet, monocyte, and lymphocyte counts (10^3/uL).' };
  }
  const score = Math.round(num('PIV', (anc * plt * amc) / alc, { min: 0, max: 100000000 }));
  return { valid: true, score, abnormal: false, bandLabel: `PIV ${score}`, band: `Pan-immune-inflammation value ${score} — interpretation is context-dependent.`, detail: `ANC ${anc} x platelets ${plt} x AMC ${amc} / ALC ${alc}.`, note: PIV_NOTE };
}

// --- CRP-to-albumin ratio ----------------------------------------------------
// CAR = CRP (mg/L) / albumin (g/dL) (Fairclough E, et al. Clin Med. 2009;9(1):30-33
// popularized the ratio; widely validated since). Higher values reflect a greater
// inflammatory burden relative to nutritional reserve.
const CAR_NOTE = 'CRP-to-albumin ratio = C-reactive protein (mg/L) / serum albumin (g/dL). A combined inflammation / nutrition marker; higher values reflect a greater inflammatory burden relative to nutritional reserve and track with a worse prognosis across many conditions. No universal cutoff — context-dependent, a lab value, not a diagnosis or treatment order.';
export function car(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const crp = pos(o.crp, 0, 1000);
  const alb = pos(o.albumin, 0.1, 8);
  if (crp === null || alb === null) {
    return { valid: false, message: 'Enter CRP (mg/L) and serum albumin (g/dL).' };
  }
  const score = r2(num('CAR', crp / alb, { min: 0, max: 100000 }));
  return { valid: true, score, abnormal: false, bandLabel: `CAR ${score}`, band: `CRP-to-albumin ratio ${score} — interpretation is context-dependent.`, detail: `CRP ${crp} mg/L / albumin ${alb} g/dL.`, note: CAR_NOTE };
}
