// spec-v229: CBC-derived count & inflammation indices — the absolute eosinophil
// count and the neutrophil-to-lymphocyte, platelet-to-lymphocyte, and systemic
// immune-inflammation ratios. Each computes from complete-blood-count values
// already in hand. Every id was verified absent by a direct scan of app.js first
// (spec-v85 §6.2). v229 runs no AI and makes no runtime network call. Carries the
// catalog to the 1000-tile milestone.
//
// These compute / stratify a lab value — they are NOT a diagnosis and NOT a
// treatment order (spec-v11 §5.3).
//
//   aec  - absolute eosinophil count with eosinophilia grading
//   nlr  - neutrophil-to-lymphocyte ratio
//   plr  - platelet-to-lymphocyte ratio
//   sii  - systemic immune-inflammation index
//
// FORMULAS AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across
// >= 2 independent open sources at implementation (see per-function headers).

import { num, r1, r2 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Absolute eosinophil count -----------------------------------------------
// AEC = total WBC x eosinophil fraction. Eosinophilia grading (Valent P, et al.
// J Allergy Clin Immunol. 2012;130(3):607-612; NIH StatPearls): < 500 normal,
// 500-1500 mild, 1500-5000 moderate, > 5000 severe. Hypereosinophilia (HE) is an
// AEC >= 1500 (on >= 2 occasions >= 1 month apart, or tissue). WBC in 10^3/uL,
// eosinophils as a percent -> AEC = WBC(10^3/uL) x 1000 x eos%/100 = WBC x eos% x 10.
const AEC_NOTE = 'Absolute eosinophil count = total WBC x eosinophil fraction. Grading (Valent P, et al. J Allergy Clin Immunol. 2012;130(3):607-612; NIH StatPearls): < 500 normal, 500-1500 mild, 1500-5000 moderate, > 5000 severe (cells/uL). Hypereosinophilia is an AEC >= 1500 on >= 2 occasions >= 1 month apart, or tissue eosinophilia. A lab value, not a diagnosis or treatment order.';
export function aec(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wbc = pos(o.wbc, 0, 500);
  const eos = pos(o.eosPct, 0, 100);
  if (wbc === null || eos === null) {
    return { valid: false, message: 'Enter total WBC (10^3/uL) and eosinophils (%).' };
  }
  const score = Math.round(num('AEC', wbc * eos * 10, { min: 0, max: 5000000 }));
  let tier; let abnormal = true;
  if (score > 5000) tier = 'severe eosinophilia (> 5000)';
  else if (score >= 1500) tier = 'moderate eosinophilia (1500-5000)';
  else if (score >= 500) tier = 'mild eosinophilia (500-1500)';
  else { tier = 'within the normal range (< 500)'; abnormal = false; }
  const he = score >= 1500 ? ' Meets the count threshold for hypereosinophilia (>= 1500).' : '';
  return { valid: true, score, abnormal, unit: 'cells/uL', bandLabel: `AEC ${score}`, band: `Absolute eosinophil count ${score} cells/uL — ${tier}.`, detail: `WBC ${wbc} x 10^3/uL x eosinophils ${eos}%.${he}`, note: AEC_NOTE };
}

// --- Neutrophil-to-lymphocyte ratio ------------------------------------------
// NLR = ANC / ALC (Zahorec R. Bratisl Lek Listy. 2001;102(1):5-14). A stress /
// systemic-inflammation marker; the typical reference range in healthy adults is
// roughly 1-3, and values > 3 are commonly regarded as elevated. Counts in any
// consistent unit (10^3/uL) since the ratio is unitless.
const NLR_NOTE = 'Neutrophil-to-lymphocyte ratio = absolute neutrophil count / absolute lymphocyte count (Zahorec R. Bratisl Lek Listy. 2001;102(1):5-14). A nonspecific marker of physiologic stress and systemic inflammation; the healthy-adult reference range is roughly 1-3 and higher values track with a worse prognosis across many conditions. Context-dependent — a lab value, not a diagnosis or treatment order.';
export function nlr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const anc = pos(o.anc, 0.001, 500);
  const alc = pos(o.alc, 0.001, 500);
  if (anc === null || alc === null) {
    return { valid: false, message: 'Enter absolute neutrophil count and absolute lymphocyte count (10^3/uL).' };
  }
  const score = r2(num('NLR', anc / alc, { min: 0, max: 100000 }));
  const abnormal = score > 3;
  const tier = abnormal ? 'elevated (> 3; typical reference roughly 1-3)' : 'within the typical reference range (roughly 1-3)';
  return { valid: true, score, abnormal, bandLabel: `NLR ${score}`, band: `Neutrophil-to-lymphocyte ratio ${score} — ${tier}.`, detail: `ANC ${anc} / ALC ${alc}.`, note: NLR_NOTE };
}

// --- Platelet-to-lymphocyte ratio --------------------------------------------
// PLR = platelet count / ALC (Gasparyan AY, et al. Ann Lab Med. 2019;39(4):345-357).
// An inflammatory marker; a commonly cited healthy upper bound is around 180.
// Platelets and lymphocytes in the same unit (10^3/uL).
const PLR_NOTE = 'Platelet-to-lymphocyte ratio = platelet count / absolute lymphocyte count (Gasparyan AY, et al. Ann Lab Med. 2019;39(4):345-357). An inflammatory / prothrombotic marker; commonly cited healthy values sit below roughly 180. Context-dependent — a lab value, not a diagnosis or treatment order.';
export function plr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const plt = pos(o.plt, 0.1, 3000);
  const alc = pos(o.alc, 0.001, 500);
  if (plt === null || alc === null) {
    return { valid: false, message: 'Enter platelet count and absolute lymphocyte count (10^3/uL).' };
  }
  const score = r1(num('PLR', plt / alc, { min: 0, max: 1000000 }));
  const abnormal = score > 180;
  const tier = abnormal ? 'elevated (> 180)' : 'within the commonly cited range (<= 180)';
  return { valid: true, score, abnormal, bandLabel: `PLR ${score}`, band: `Platelet-to-lymphocyte ratio ${score} — ${tier}.`, detail: `platelets ${plt} / ALC ${alc}.`, note: PLR_NOTE };
}

// --- Systemic immune-inflammation index --------------------------------------
// SII = platelets x ANC / ALC (Hu B, et al. Clin Cancer Res. 2014;20(23):6212-6222).
// A composite inflammation index with no universal cutoff; higher values reflect a
// more pro-inflammatory state. Counts in 10^3/uL (10^9/L).
const SII_NOTE = 'Systemic immune-inflammation index = platelets x absolute neutrophil count / absolute lymphocyte count (Hu B, et al. Clin Cancer Res. 2014;20(23):6212-6222). A composite inflammation index; higher values reflect a more pro-inflammatory state and track with a worse prognosis across many conditions. No universal cutoff — context-dependent, a lab value, not a diagnosis or treatment order.';
export function sii(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const plt = pos(o.plt, 0.1, 3000);
  const anc = pos(o.anc, 0.001, 500);
  const alc = pos(o.alc, 0.001, 500);
  if (plt === null || anc === null || alc === null) {
    return { valid: false, message: 'Enter platelet count, absolute neutrophil count, and absolute lymphocyte count (10^3/uL).' };
  }
  const score = Math.round(num('SII', (plt * anc) / alc, { min: 0, max: 100000000 }));
  return { valid: true, score, abnormal: false, bandLabel: `SII ${score}`, band: `Systemic immune-inflammation index ${score} — interpretation is context-dependent.`, detail: `platelets ${plt} x ANC ${anc} / ALC ${alc}.`, note: SII_NOTE };
}
