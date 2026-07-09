// spec-v275: the RDW-to-platelet ratio (RPR) — a non-invasive liver-fibrosis marker
// computed from two routine CBC values. Joins the fibrosis family (APRI / FIB-4 / Forns /
// Lok / King). The id was verified absent by a direct scan of app.js AND the MCP adapter
// set first (spec-v85 §6.2). v275 runs no AI and makes no runtime network call.
//
// This computes a lab-derived ratio — it is NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   rpr - red cell distribution width (%) / platelet count (10^9/L)
//
// FORMULA / BOUNDARY RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see the function header).

import { num, r2 } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

// --- RDW-to-platelet ratio ---------------------------------------------------
// RPR = RDW (%) / platelet count (10^9/L) (Chen B, Ye B, Zhang J, et al. RDW to platelet
// ratio: a novel noninvasive index for predicting hepatic fibrosis and cirrhosis in chronic
// hepatitis B. PLoS One. 2013;8(7):e68780). Chen 2013 reports an RPR cutoff around 0.1 for
// significant fibrosis; a HIGHER ratio marks more advanced fibrosis. Cross-verified against
// subsequent validation cohorts, which reuse the identical RDW%/platelet definition.
const RPR_NOTE = 'RDW-to-platelet ratio = red cell distribution width (%) / platelet count (10^9/L) (Chen 2013). A non-invasive liver-fibrosis marker; a HIGHER ratio marks more advanced fibrosis. The derivation reports a cutoff around 0.1 for significant fibrosis, but thresholds vary by etiology (HBV/HCV/NAFLD) and cohort — no single universal cut-point. A lab-derived ratio, not a diagnosis or treatment order.';
export function rpr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rdw = pos(o.rdw, 5, 60);
  const platelets = pos(o.platelets, 1, 2000);
  if (rdw === null || platelets === null) {
    return { valid: false, message: 'Enter RDW (%) and platelet count (10^9/L).' };
  }
  const score = r2(num('RPR', rdw / platelets, { min: 0, max: 100000 }));
  return { valid: true, score, abnormal: score >= 0.1, bandLabel: `RPR ${score}`,
    band: `RDW-to-platelet ratio ${score} — a higher ratio marks more advanced fibrosis; the source cutoff is ~0.1 for significant fibrosis (context-dependent).`,
    detail: `RDW ${rdw}% / platelets ${platelets}.`, note: RPR_NOTE };
}
