// spec-v269: METS-IR (Metabolic Score for Insulin Resistance) — a fasting-lab
// insulin-resistance surrogate that joins the spec-v136 endocrine/metabolic cluster
// (HOMA-IR / QUICKI / TyG). It computes from a fasting glucose, fasting triglycerides,
// HDL cholesterol, and BMI already in hand — no fasting insulin assay required, which
// is the point of the score. The id was verified absent by a direct scan of app.js
// AND the MCP adapter set first (spec-v85 §6.2). v269 runs no AI and makes no runtime
// network call.
//
// This computes a lab-derived index — it is NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   mets-ir - Ln((2 x FPG) + fasting TG) x BMI / Ln(HDL-C)
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

// --- METS-IR -----------------------------------------------------------------
// METS-IR = (ln[(2 x fasting glucose) + fasting triglycerides] x BMI) / ln(HDL-C),
// all lipids/glucose in mg/dL, BMI in kg/m^2 (Bello-Chavolla OY, et al. METS-IR, a novel
// score to evaluate insulin sensitivity, is predictive of visceral adiposity and incident
// type 2 diabetes. Eur J Endocrinol. 2018;178(5):533-544). Cross-verified against the
// formula reproduced in subsequent validation cohorts, which reuse the identical
// definition and mg/dL units. A HIGHER METS-IR marks greater insulin resistance.
const METSIR_NOTE = 'METS-IR = (ln[(2 x fasting glucose) + fasting triglycerides] x BMI) / ln(HDL-C), with glucose, triglycerides, and HDL in mg/dL and BMI in kg/m^2 (Bello-Chavolla 2018). A fasting-insulin-free insulin-resistance surrogate; a HIGHER value marks greater insulin resistance and tracks with incident type 2 diabetes and visceral adiposity. No universal diagnostic cut-point — context-dependent. A lab-derived index, not a diagnosis or treatment order.';
export function metsIr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fpg = pos(o.fpg, 20, 2000);
  const tg = pos(o.tg, 5, 10000);
  const hdl = pos(o.hdl, 1, 500);
  const bmi = pos(o.bmi, 5, 200);
  if (fpg === null || tg === null || hdl === null || bmi === null) {
    return { valid: false, message: 'Enter fasting glucose (mg/dL), fasting triglycerides (mg/dL), HDL cholesterol (mg/dL), and BMI (kg/m^2).' };
  }
  const lnHdl = Math.log(hdl);
  // HDL 1 mg/dL -> ln(1) = 0; the pos() floor is 1, so guard the exact-1 divide-by-zero.
  if (!(lnHdl > 0)) {
    return { valid: false, message: 'HDL cholesterol must be greater than 1 mg/dL.' };
  }
  const score = r2(num('METS-IR', (Math.log((2 * fpg) + tg) * bmi) / lnHdl, { min: 0, max: 100000 }));
  return { valid: true, score, abnormal: false, bandLabel: `METS-IR ${score}`,
    band: `METS-IR ${score} — higher values indicate greater insulin resistance; interpretation is context-dependent (no universal cutoff).`,
    detail: `ln((2 x ${fpg}) + ${tg}) x BMI ${bmi} / ln(HDL ${hdl}).`, note: METSIR_NOTE };
}
