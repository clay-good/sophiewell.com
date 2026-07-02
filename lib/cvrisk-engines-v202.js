// spec-v202: cardiovascular & heart-failure risk / survival engines (Deep
// Subspecialty Quantitation program, spec-v199 §1.1). Every id was verified
// absent by a direct scan of app.js first (spec-v85 §6.2). None duplicates a
// live tile; v202 runs no AI and makes no runtime network call. These estimate
// risk / survival — they are NOT a statin, anticoagulant, device, or treatment
// order (spec-v11 §5.3). Shipped one tile at a time per an active /goal.
//
//   mecki       - MECKI score (CPET-anchored HF 2-year event probability)
//   ukpdsRisk   - UKPDS Risk Engine (CHD in type-2 diabetes)
//   advanceCvd  - ADVANCE cardiovascular-risk model (type-2 diabetes)
//   seattleHf   - Seattle Heart Failure Model
//   qrisk3      - QRISK3 10-year cardiovascular risk
//
// COEFFICIENTS / BASELINE-SURVIVAL TERMS RE-FETCHED, NEVER RECALLED (spec-v97),
// each cross-verified across >= 2 independent open sources at implementation:
//   - MECKI score (Agostoni P, Corrà U, Cattadori G, et al, Int J Cardiol
//     2013;167(6):2710-2718): the six-predictor logistic reproduced identically
//     across the original paper PDF (iris.sssup.it mecki 1_IJC.pdf) and multiple
//     validation reproductions. Linear predictor LP = 10.3464 − 0.0262·ppVO2
//     + 0.0472·(VE/VCO2 slope) − 0.1086·Hb − 0.0615·Na − 0.0699·LVEF
//     − 0.0136·MDRD-eGFR; the score is the predicted event probability
//     P = 1 / (1 + e^−LP), reported as a percentage (2-year cardiovascular
//     death / urgent heart transplant / LVAD). The MECKI-initiative review
//     (PMC7691632) confirms the P = e^LP/(1+e^LP) logistic transform.

import { num, r1, r2 } from './num.js';

function inRange(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}

function logisticPct(lp) {
  const clamped = Math.max(-40, Math.min(40, lp));
  return Math.max(0, Math.min(100, (1 / (1 + Math.exp(-clamped))) * 100));
}

// --- 2.3 MECKI score --------------------------------------------------------
const MECKI_NOTE = 'MECKI score (Agostoni P, Corrà U, Cattadori G, et al, Int J Cardiol 2013;167(6):2710-2718): a cardiopulmonary-exercise-anchored heart-failure prognostic score from six variables — hemoglobin, sodium, LVEF, peak VO₂ (% predicted), VE/VCO₂ slope, and MDRD-eGFR. LP = 10.3464 − 0.0262·ppVO₂ + 0.0472·(VE/VCO₂ slope) − 0.1086·Hb − 0.0615·Na − 0.0699·LVEF − 0.0136·eGFR; the score is P = 1/(1+e^−LP) as a percentage — the model’s estimated 2-year risk of cardiovascular death, urgent transplant, or LVAD. Higher = worse; a prognostic estimate, not a transplant or device order.';

export function mecki(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const hb = inRange(o.hb, 3, 25);
  const na = inRange(o.sodium, 100, 180);
  const lvef = inRange(o.lvef, 5, 80);
  const ppvo2 = inRange(o.ppvo2, 5, 200);
  const veco2 = inRange(o.veco2, 10, 120);
  const egfr = inRange(o.egfr, 3, 250);
  if ([hb, na, lvef, ppvo2, veco2, egfr].some((v) => v === null)) {
    return { valid: false, message: 'Enter hemoglobin (g/dL), sodium (mEq/L), LVEF (%), peak VO₂ (% predicted), VE/VCO₂ slope, and MDRD-eGFR (mL/min/1.73 m²).' };
  }
  const lp = 10.3464 - 0.0262 * ppvo2 + 0.0472 * veco2 - 0.1086 * hb - 0.0615 * na - 0.0699 * lvef - 0.0136 * egfr;
  const pct = r1(logisticPct(lp));
  const scoreChecked = num('MECKI', pct, { min: 0, max: 100 });
  let tier; let abnormal = true;
  if (scoreChecked < 10) { tier = 'lower-risk range (< 10%)'; abnormal = false; }
  else if (scoreChecked < 30) tier = 'intermediate-risk range (10–30%)';
  else tier = 'higher-risk range (≥ 30%)';
  return {
    valid: true,
    score: scoreChecked,
    abnormal,
    bandLabel: `MECKI ${scoreChecked}%`,
    band: `MECKI ${scoreChecked}% — estimated 2-year risk of cardiovascular death, urgent transplant, or LVAD; ${tier}.`,
    detail: `LP = 10.3464 − 0.0262·${ppvo2} + 0.0472·${veco2} − 0.1086·${hb} − 0.0615·${na} − 0.0699·${lvef} − 0.0136·${egfr} = ${r2(lp)}.`,
    note: MECKI_NOTE,
  };
}
