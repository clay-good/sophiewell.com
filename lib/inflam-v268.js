// spec-v268: the Advanced Lung Cancer Inflammation Index (ALI) — a composite BMI /
// albumin / neutrophil-to-lymphocyte prognostic index that extends the spec-v229/
// v230/v267 inflammation-index family (NLR/PLR/SII/LMR/SIRI/PIV/CAR/HALP). It
// computes from a BMI, serum albumin, and the CBC differential already in hand. The
// id was verified absent by a direct scan of app.js AND the MCP adapter set first
// (spec-v85 §6.2). v268 runs no AI and makes no runtime network call.
//
// This computes a lab-derived value — it is NOT a diagnosis and NOT a treatment
// order (spec-v11 §5.3).
//
//   ali - BMI x albumin / NLR  (= BMI x albumin x ALC / ANC)
//
// FORMULA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see the function header).

import { num, r1 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Advanced Lung Cancer Inflammation Index ---------------------------------
// ALI = BMI (kg/m^2) x serum albumin (g/dL) / NLR, where NLR = ANC / ALC (Jafri SH,
// Shi R, Mills G. Advanced lung cancer inflammation index (ALI) at diagnosis is a
// prognostic marker in patients with metastatic non-small cell lung cancer (NSCLC):
// a retrospective review. BMC Cancer. 2013;13:158). Cross-verified against subsequent
// pan-cancer validations, which reuse the same BMI x albumin / NLR definition. Unlike
// the neutrophil-based ratios, a HIGHER ALI is more favorable (better nutrition, less
// inflammation), so a LOWER value marks a worse profile.
const ALI_NOTE = 'Advanced Lung Cancer Inflammation Index = body-mass index (kg/m^2) x serum albumin (g/dL) / neutrophil-to-lymphocyte ratio (NLR = ANC / ALC) (Jafri 2013, metastatic NSCLC derivation; validated pan-cancer since). A combined nutrition / inflammation marker; a HIGHER value is more favorable, so a LOWER value marks a worse profile and tracks with a worse prognosis. The cutoff is cohort- and cancer-specific — no universal threshold. A lab-derived value, not a diagnosis or treatment order.';
export function ali(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bmi = pos(o.bmi, 1, 200);
  const alb = pos(o.albumin, 0.1, 8);
  const anc = pos(o.anc, 0.001, 500);
  const alc = pos(o.alc, 0.001, 500);
  if (bmi === null || alb === null || anc === null || alc === null) {
    return { valid: false, message: 'Enter BMI (kg/m^2), serum albumin (g/dL), absolute neutrophil count (10^9/L), and absolute lymphocyte count (10^9/L).' };
  }
  const nlr = anc / alc;
  const score = r1(num('ALI', (bmi * alb) / nlr, { min: 0, max: 100000000 }));
  return { valid: true, score, abnormal: false, bandLabel: `ALI ${score}`,
    band: `Advanced Lung Cancer Inflammation Index ${score} — interpretation is context-dependent (a lower value is less favorable).`,
    detail: `BMI ${bmi} x albumin ${alb} g/dL / NLR ${r1(num('NLR', nlr, { min: 0, max: 100000 }))} (ANC ${anc} / ALC ${alc}).`, note: ALI_NOTE };
}
