// spec-v208: nutrition-status assessment & maternal-neonatal risk instruments
// (Frontline & Bedside Decision Instruments program, spec-v204 §1.1). Every id
// was verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v208 runs no AI and makes no runtime network call.
// These assess and stratify — they are NOT a feeding, delivery, magnesium, or
// disposition order (spec-v11 §5.3). Shipped one tile at a time per an active
// /goal.
//
//   ponderalIndex - Neonatal Ponderal Index (Rohrer's index)
//   sflt1Plgf     - sFlt-1/PlGF ratio (preeclampsia rule-out / rule-in)
//   sga           - Subjective Global Assessment (Detsky A/B/C)
//   glim          - GLIM criteria for malnutrition diagnosis
//   pgSga         - Scored Patient-Generated SGA
//
// FORMULAS / CUT-POINTS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation:
//   - Neonatal Ponderal Index (Miller HC, Hassanein K, Pediatrics 1971;48(4):
//     511-522; validation Fay RA, et al): PI = [weight (g) / length (cm)³] × 100.
//     Neonatal normal range ≈ 2.0-3.0; PI < 2.0 in a term infant signals
//     disproportionate wasting / asymmetric IUGR; PI > 3.0 is heavy-for-length.

import { num, r2 } from './num.js';

function positive(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > hi) return null;
  return n;
}
function nonNeg(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > hi) return null;
  return n;
}

// --- 2.5 Neonatal Ponderal Index --------------------------------------------
const PI_NOTE = 'Neonatal Ponderal Index / Rohrer\'s index (Miller HC, Hassanein K, Pediatrics 1971;48(4):511-522): PI = [weight (g) / length (cm)³] × 100, a measure of the proportionality of weight to length at birth. Neonatal normal range ≈ 2.0–3.0; a value < 2.0 in a term infant signals disproportionate wasting (asymmetric intrauterine growth restriction), more specific than birth-weight-for-age; > 3.0 is heavy-for-length. A growth-proportionality descriptor, not a feeding or disposition order.';

export function ponderalIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const weight = positive(o.weightG, 12000);
  const length = positive(o.lengthCm, 80);
  if (weight === null || length === null) {
    return { valid: false, message: 'Enter birth weight (g) and crown-heel length (cm).' };
  }
  const pi = r2((weight / (length ** 3)) * 100);
  const value = num('Ponderal index', pi, { min: 0, max: 20 });
  let tier; let abnormal = false;
  if (value < 2.0) { tier = 'below 2.0 (disproportionate wasting, asymmetric IUGR)'; abnormal = true; }
  else if (value <= 3.0) tier = 'within the neonatal normal range (2.0–3.0)';
  else tier = 'above 3.0 (heavy-for-length)';
  return {
    valid: true,
    score: value,
    abnormal,
    bandLabel: `PI ${value}`,
    band: `Ponderal index ${value} — ${tier}.`,
    detail: `[${weight} g / (${length} cm)³] × 100 = ${value}.`,
    note: PI_NOTE,
  };
}

// --- 2.4 sFlt-1/PlGF ratio ---------------------------------------------------
// CUT-POINTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across the
// PROGNOSIS trial (Zeisler H, et al, N Engl J Med 2016;374(1):13-22) and the
// Verlohren phase-specific paper (Hypertension 2014;63(2):346-352): a single
// cut-off of ≤ 38 rules out preeclampsia for the next week (NPV ≈ 99.3%); > 38
// flags elevated short-term risk; the phase-specific rule-in thresholds are ≥ 85
// (early-onset, < 34 weeks) and ≥ 110 (late-onset, ≥ 34 weeks). Roche Elecsys
// assay. Rule-out biomarker that safely reduces unnecessary admissions.
const SFLT_NOTE = 'sFlt-1/PlGF ratio (Zeisler H, et al, N Engl J Med 2016;374(1):13-22 = PROGNOSIS; phase-specific cut-points Verlohren S, et al, Hypertension 2014;63(2):346-352): a Roche Elecsys biomarker for suspected preeclampsia. A ratio ≤ 38 rules preeclampsia out for the next week (NPV ≈ 99.3%); > 38 flags elevated short-term risk; the gestational-phase rule-in thresholds are ≥ 85 (early-onset < 34 weeks) and ≥ 110 (late-onset ≥ 34 weeks). A rule-out biomarker that safely reduces unnecessary admissions — not a delivery or magnesium order.';

export function sflt1Plgf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ratio = nonNeg(o.ratio, 100000);
  const phase = o.phase === 'early' ? 'early' : o.phase === 'late' ? 'late' : null;
  if (ratio === null || phase === null) {
    return { valid: false, message: 'Enter the sFlt-1/PlGF ratio and select the gestational phase (early-onset < 34 weeks or late-onset ≥ 34 weeks).' };
  }
  const value = num('sFlt-1/PlGF', r2(ratio), { min: 0, max: 100000 });
  const ruleIn = phase === 'early' ? 85 : 110;
  let interp; let abnormal = true;
  if (value <= 38) { interp = '≤ 38: preeclampsia ruled out for the next week (NPV ≈ 99.3%)'; abnormal = false; }
  else if (value >= ruleIn) interp = `≥ ${ruleIn} (${phase}-onset rule-in): high short-term probability of preeclampsia`;
  else interp = '> 38: elevated short-term risk (below the phase-specific rule-in threshold)';
  return {
    valid: true,
    score: value,
    abnormal,
    bandLabel: `sFlt-1/PlGF ${value}`,
    band: `sFlt-1/PlGF ${value} — ${interp}.`,
    detail: `${phase}-onset (${phase === 'early' ? '< 34' : '≥ 34'} weeks); rule-out ≤ 38, rule-in ≥ ${ruleIn}.`,
    note: SFLT_NOTE,
  };
}
