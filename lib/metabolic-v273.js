// spec-v273: TyG-BMI — the triglyceride-glucose index scaled by BMI, an enhanced
// insulin-resistance surrogate that joins the spec-v136 endocrine/metabolic cluster
// (HOMA-IR / QUICKI / TyG / METS-IR). It computes from a fasting triglyceride, fasting
// glucose, and BMI already in hand. The id was verified absent by a direct scan of
// app.js AND the MCP adapter set first (spec-v85 §6.2). v273 runs no AI and makes no
// runtime network call.
//
// This computes a lab-derived index — it is NOT a diagnosis and NOT a treatment order
// (spec-v11 §5.3).
//
//   tyg-bmi - TyG x BMI, where TyG = ln[(TG x glucose) / 2]  (both mg/dL)
//
// FORMULA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across >= 2
// independent open sources at implementation (see the function header).

import { num, r2, gradeFault } from './num.js';

function pos(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
// spec-v1236: the local reader above returns one `null` for a blank field, a
// non-number AND a value outside its own bounds, and every caller reads `null`
// as absent -- so a reader who typed an impossible number was told to *enter* it,
// retyped it, and got the same sentence. `gradeFault` (lib/num.js, spec-v1209)
// SKIPS a blank, so it goes BEFORE each function's own branch: a blank falls
// through to the caller's message, which still names every empty field at once,
// and only the out-of-range value is called out here.
//
// The bounds are the callers' own. The LABELS come from the field registry each
// tile already publishes to agents, read per CALCULATOR and never merged across
// the catalog -- two tiles can both have an arg called `pre`, and an arg name
// means nothing outside the tile it belongs to.


// --- TyG-BMI -----------------------------------------------------------------
// TyG-BMI = TyG x BMI, where TyG = ln[(fasting triglycerides x fasting glucose) / 2], both
// mg/dL (Er LK, Wu S, Chou HH, et al. Triglyceride glucose-body mass index is a simple and
// clinically useful surrogate marker for insulin resistance in nondiabetic individuals.
// PLoS One. 2016;11(3):e0149731). The TyG core is the Simental-Mendia 2008 definition already
// carried by the catalog's tyg-index. Cross-verified against subsequent validation cohorts,
// which reuse the identical TyG x BMI definition and mg/dL units. A HIGHER value marks
// greater insulin resistance.
const TYGBMI_NOTE = 'TyG-BMI = TyG x BMI, where TyG = ln[(fasting triglycerides x fasting glucose) / 2], both in mg/dL (Er 2016; TyG core from Simental-Mendia 2008). An enhanced insulin-resistance surrogate that adds adiposity to the triglyceride-glucose index; a HIGHER value marks greater insulin resistance. No universal diagnostic cut-point — context-dependent. A lab-derived index, not a diagnosis or treatment order.';
export function tygBmi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const tg = pos(o.tg, 5, 10000);
  const glucose = pos(o.glucose, 20, 2000);
  const bmi = pos(o.bmi, 5, 200);
  const fault = gradeFault([
    ['Fasting triglycerides (mg/dL)', o.tg, 5, 10000],
    ['Fasting glucose (mg/dL)', o.glucose, 20, 2000],
    ['BMI (kg/m^2)', o.bmi, 5, 200],
  ]);
  if (fault) return { valid: false, message: fault };
  if (tg === null || glucose === null || bmi === null) {
    return { valid: false, message: 'Enter fasting triglycerides (mg/dL), fasting glucose (mg/dL), and BMI (kg/m^2).' };
  }
  const tyg = Math.log((tg * glucose) / 2);
  const score = r2(num('TyG-BMI', tyg * bmi, { min: 0, max: 1000000 }));
  return { valid: true, score, abnormal: false, bandLabel: `TyG-BMI ${score}`,
    band: `TyG-BMI ${score} — higher values indicate greater insulin resistance; interpretation is context-dependent (no universal cutoff).`,
    detail: `TyG ${r2(num('TyG', tyg, { min: -100, max: 100 }))} x BMI ${bmi}.`, note: TYGBMI_NOTE };
}
