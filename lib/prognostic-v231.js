// spec-v231: nutrition/inflammation prognostic tools — the Naples Prognostic
// Score, the neutrophil-to-monocyte ratio, and the fibrinogen-to-albumin ratio.
// Each computes from labs already in hand and continues the v229/v230 index
// family. Every id was verified absent by a fixed-string scan of the extracted
// app.js id/name lists AND the MCP adapter set first (spec-v85 §6.2). v231 runs no
// AI and makes no runtime network call.
//
// These compute a score / lab value — they are NOT a diagnosis and NOT a treatment
// order (spec-v11 §5.3).
//
//   naples - Naples Prognostic Score (albumin + cholesterol + NLR + LMR)
//   nmr    - neutrophil-to-monocyte ratio
//   far    - fibrinogen-to-albumin ratio
//
// FORMULAS AND CUTOFFS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across
// >= 2 independent open sources at implementation (see per-function headers).

import { num, r2, inputFault } from './num.js';
import { boundsAdvisory } from './bounds.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- Naples Prognostic Score -------------------------------------------------
// Galizia G, et al. Dis Colon Rectum. 2017;60(12):1273-1284: serum albumin
// < 4 g/dL (< 40 g/L), total cholesterol <= 180 mg/dL, NLR > 2.96, and LMR
// <= 4.44 each score 1 (0 otherwise). Total 0-4 -> group 0 (NPS 0), group 1
// (NPS 1-2), group 2 (NPS 3-4); higher = worse nutrition/inflammation profile.
const NAPLES_NOTE = 'Naples Prognostic Score (Galizia G, et al. Dis Colon Rectum. 2017;60(12):1273-1284): serum albumin < 4 g/dL, total cholesterol <= 180 mg/dL, neutrophil-to-lymphocyte ratio > 2.96, and lymphocyte-to-monocyte ratio <= 4.44 each score 1 point (0 otherwise). Total 0-4 maps to group 0 (NPS 0), group 1 (NPS 1-2), group 2 (NPS 3-4); a higher group is a worse nutrition/inflammation profile. A prognostic score, not a diagnosis or treatment order.';
export function naples(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const alb = pos(o.albumin, 0.1, 8);
  const chol = pos(o.cholesterol, 10, 800);
  const nlr = pos(o.nlr, 0, 100000);
  const lmr = pos(o.lmr, 0, 100000);
  if (alb === null || chol === null || nlr === null || lmr === null) {
  // spec-v1177: `pos` returns null for a blank, for a non-number AND for a value
  // outside its bounds, so this guard used to answer an albumin of 40 -- the g/L
  // figure for 4.0 g/dL -- with "Enter serum albumin". About the albumin the
  // reader had just entered. boundsAdvisory names the fault instead, and says
  // "verify the units", which is the thing that is actually wrong.
  //
  // `present` matters: Number('') is 0, and boundsAdvisory(0) reads as "below
  // the plausible range". Consulting it on a BLANK field would answer a gap with
  // a range message -- this programme's own rule 7 defect, introduced inside the
  // fix for its mirror. A blank is missing and must go on saying so.
    const raw = o.albumin;
    const present = raw !== null && raw !== undefined && String(raw).trim() !== '';
    const why = present ? boundsAdvisory('albumin', Number(raw)) : null;
    if (alb === null && why) return { valid: false, message: why };
    return { valid: false, message: 'Enter serum albumin (g/dL), total cholesterol (mg/dL), NLR, and LMR.' };
  }
  let s = 0; const p = [];
  if (alb < 4) { s += 1; p.push('albumin < 4'); }
  if (chol <= 180) { s += 1; p.push('cholesterol <= 180'); }
  if (nlr > 2.96) { s += 1; p.push('NLR > 2.96'); }
  if (lmr <= 4.44) { s += 1; p.push('LMR <= 4.44'); }
  const score = Math.round(num('Naples', s, { min: 0, max: 4 }));
  let group; let abnormal = true;
  if (score >= 3) group = 'group 2 (highest-risk)';
  else if (score >= 1) group = 'group 1';
  else { group = 'group 0 (lowest-risk)'; abnormal = false; }
  return { valid: true, score, abnormal, bandLabel: `NPS ${score}`, band: `Naples prognostic score ${score} — ${group}.`, detail: p.length ? `Positive: ${p.join(', ')}.` : 'No adverse factors.', note: NAPLES_NOTE };
}

// --- Neutrophil-to-monocyte ratio --------------------------------------------
// NMR = absolute neutrophil count / absolute monocyte count. A prognostic
// inflammation marker; higher values are less favorable. Counts in any consistent
// unit (10^3/uL); the ratio is unitless.
const NMR_NOTE = 'Neutrophil-to-monocyte ratio = absolute neutrophil count / absolute monocyte count. A prognostic inflammation marker; higher values are less favorable. No universal cutoff — context-dependent, a lab value, not a diagnosis or treatment order.';
export function nmr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  // spec-v1210: `pos(v, lo, hi)` returns null for a blank, for a non-number AND
  // for a value outside the range, and the caller reads null as absent. So an ANC
  // of 9999 was answered with "Enter absolute neutrophil count" -- the reader
  // retypes the same number and gets the same sentence. Not a wrong answer: a
  // loop with no way out, which is the dead end `inputFault` was written for
  // (see its note in lib/num.js) and which `probe-envelope-unbounded` keeps in a
  // section of its own.
  //
  // The bounds are the ones this function already had, now stated to the reader
  // instead of swallowed.
  const ratioFault = inputFault([
    ['the absolute neutrophil count', o.anc, 0.001, 500, '10^3/uL'],
    ['the absolute monocyte count', o.amc, 0.001, 500, '10^3/uL'],
  ]);
  if (ratioFault) return { valid: false, message: ratioFault };
  const anc = pos(o.anc, 0.001, 500);
  const amc = pos(o.amc, 0.001, 500);
  if (anc === null || amc === null) {
    return { valid: false, message: 'Enter absolute neutrophil count and absolute monocyte count (10^3/uL).' };
  }
  const score = r2(num('NMR', anc / amc, { min: 0, max: 100000 }));
  return { valid: true, score, abnormal: false, bandLabel: `NMR ${score}`, band: `Neutrophil-to-monocyte ratio ${score} — interpretation is context-dependent.`, detail: `ANC ${anc} / AMC ${amc}.`, note: NMR_NOTE };
}

// --- Fibrinogen-to-albumin ratio ---------------------------------------------
// FAR = fibrinogen / albumin (Sun DW, et al. Onco Targets Ther. 2018; and later
// validations). Reported here as fibrinogen (mg/dL) / albumin (g/dL); higher
// values reflect a greater inflammatory / prothrombotic burden.
const FAR_NOTE = 'Fibrinogen-to-albumin ratio = fibrinogen (mg/dL) / serum albumin (g/dL). An inflammation / prothrombotic marker; higher values are less favorable. Reporting conventions differ (some use g/L for both, x100) — this tile uses mg/dL over g/dL. No universal cutoff — context-dependent, a lab value, not a diagnosis or treatment order.';
export function far(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fib = pos(o.fibrinogen, 1, 2000);
  const alb = pos(o.albumin, 0.1, 8);
  if (fib === null || alb === null) {
    // spec-v1177, as in naplesPrognosticScore above.
    const raw = o.albumin;
    const present = raw !== null && raw !== undefined && String(raw).trim() !== '';
    const why = present ? boundsAdvisory('albumin', Number(raw)) : null;
    if (alb === null && why) return { valid: false, message: why };
    return { valid: false, message: 'Enter fibrinogen (mg/dL) and serum albumin (g/dL).' };
  }
  const score = r2(num('FAR', fib / alb, { min: 0, max: 100000 }));
  return { valid: true, score, abnormal: false, bandLabel: `FAR ${score}`, band: `Fibrinogen-to-albumin ratio ${score} — interpretation is context-dependent.`, detail: `fibrinogen ${fib} mg/dL / albumin ${alb} g/dL.`, note: FAR_NOTE };
}
