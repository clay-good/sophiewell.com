// spec-v204: nephrology, fluid-balance & renal-tubular instruments (Frontline &
// Bedside Decision Instruments program, spec-v204 §1.1). Every id was verified
// absent by a direct scan of app.js first (spec-v85 §6.2). None duplicates a
// live tile; v204 runs no AI and makes no runtime network call. These quantify
// and stratify — they are NOT a fluid, transfusion, dialysis, or surgical-
// referral order (spec-v11 §5.3). Shipped one tile at a time per an active /goal.
//
//   cccr                  - Calcium/Creatinine Clearance Ratio (FHH vs PHPT)
//   urineCalcium          - Urinary-calcium assessment (spot Ca/Cr + 24-h)
//   maxAllowableBloodLoss - Maximum Allowable Blood Loss (ABL)
//   efwClearance          - Electrolyte-Free Water Clearance
//   tmpGfr                - Renal phosphate threshold TmP/GFR
//
// CONSTANTS / THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), each
// cross-verified across >= 2 independent open sources at implementation:
//   - CCCR (Christensen SE, et al, Clin Endocrinol 2008;69(5):713-720): the
//     calcium/creatinine clearance ratio = (urine Ca × serum Cr) / (serum Ca ×
//     urine Cr), dimensionless when the two calcium terms share a unit and the
//     two creatinine terms share a unit. Bands (corroborated across droracle,
//     ClinicFire, and the FHH/PHPT literature): < 0.01 suggests familial
//     hypocalciuric hypercalcemia (FHH); > 0.02 suggests primary
//     hyperparathyroidism (PHPT); 0.01–0.02 is an indeterminate gray zone.

import { num, r1 } from './num.js';

function positive(v, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0 || n > hi) return null;
  return n;
}
function r4(n) { return Math.round(n * 10000) / 10000; }

// --- 2.1 Calcium/Creatinine Clearance Ratio ---------------------------------
const CCCR_NOTE = 'Calcium/Creatinine Clearance Ratio (Christensen SE, et al, Clin Endocrinol 2008;69(5):713-720): CCCR = (urine Ca × serum Cr) / (serum Ca × urine Cr), dimensionless when the calcium terms share a unit and the creatinine terms share a unit. < 0.01 suggests familial hypocalciuric hypercalcemia (FHH); > 0.02 suggests primary hyperparathyroidism (PHPT); 0.01–0.02 is indeterminate. Vitamin-D deficiency, low calcium intake, renal impairment, thiazides, and lithium lower the ratio and can mislabel PHPT as FHH. A screen interpreted alongside PTH, vitamin-D status, and family history — never alone, and never a parathyroidectomy referral.';

export function cccr(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const uCa = positive(o.urineCa, 100000);
  const sCr = positive(o.serumCr, 100000);
  const sCa = positive(o.serumCa, 100000);
  const uCr = positive(o.urineCr, 1000000);
  if (uCa === null || sCr === null || sCa === null || uCr === null) {
    return { valid: false, message: 'Enter urine calcium, serum creatinine, serum calcium, and urine creatinine — calcium terms in one shared unit and creatinine terms in one shared unit, all positive.' };
  }
  const ratio = r4((uCa * sCr) / (sCa * uCr));
  const value = num('CCCR', ratio, { min: 0, max: 100 });
  let interp; let abnormal = false;
  if (value < 0.01) { interp = 'suggests familial hypocalciuric hypercalcemia (FHH, < 0.01) — a benign CASR condition that must not go to parathyroidectomy'; abnormal = true; }
  else if (value <= 0.02) interp = 'indeterminate gray zone (0.01–0.02)';
  else interp = 'suggests primary hyperparathyroidism (PHPT, > 0.02)';
  return {
    valid: true,
    score: value,
    abnormal,
    bandLabel: `CCCR ${value}`,
    band: `CCCR ${value} — ${interp}.`,
    detail: `(urine Ca ${uCa} × serum Cr ${sCr}) / (serum Ca ${sCa} × urine Cr ${uCr}) = ${value}. Interpret with PTH, vitamin-D status, and family history — never alone.`,
    note: CCCR_NOTE,
  };
}

// --- 2.3 Maximum Allowable Blood Loss (ABL) ---------------------------------
// CONSTANTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across MDCalc,
// the Iowa Head & Neck protocols, and OpenAnesthesia: estimated blood volume
// EBV = weight × blood-volume factor (mL/kg) — neonate 85, infant 80, child 70,
// adult male 75, adult female 65 — and ABL = EBV × (Hct_initial − Hct_target) /
// Hct_initial (Gross JB, Anesthesiology 1983;58(3):277-280). The average-Hct
// (dilution-corrected) variant ABL_avg = EBV × (Hct_i − Hct_f) / ((Hct_i +
// Hct_f)/2) is reported alongside. The ratio is unit-independent, so hematocrit
// (%) or hemoglobin (g/dL) may be entered as long as both use the same measure.
const ABL_NOTE = 'Maximum Allowable Blood Loss (Gross JB, Anesthesiology 1983;58(3):277-280): EBV = weight × blood-volume factor (neonate 85, infant 80, child 70, adult male 75, adult female 65 mL/kg); ABL = EBV × (Hct initial − Hct target) / Hct initial. An intraoperative transfusion-planning estimate, not a transfusion order — enter hematocrit or hemoglobin using the same measure for both.';
const ABL_FACTORS = { neonate: 85, infant: 80, child: 70, 'adult-male': 75, 'adult-female': 65 };
const ABL_LABEL = { neonate: 'neonate', infant: 'infant', child: 'child', 'adult-male': 'adult male', 'adult-female': 'adult female' };

export function maxAllowableBloodLoss(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const factor = Object.prototype.hasOwnProperty.call(ABL_FACTORS, o.category) ? ABL_FACTORS[o.category] : null;
  const weight = positive(o.weight, 400);
  const hctI = positive(o.hctInitial, 100);
  const hctF = positive(o.hctTarget, 100);
  if (factor === null || weight === null || hctI === null || hctF === null) {
    return { valid: false, message: 'Select the patient category, enter weight (kg), and enter the initial and target hematocrit (or hemoglobin, same measure for both).' };
  }
  if (hctF >= hctI) {
    return { valid: false, message: 'The target hematocrit must be below the initial hematocrit.' };
  }
  const ebv = weight * factor;
  const abl = r1(Math.max(0, ebv * (hctI - hctF) / hctI));
  const ablAvg = r1(Math.max(0, ebv * (hctI - hctF) / ((hctI + hctF) / 2)));
  const ablChecked = num('ABL', abl, { min: 0, max: 100000 });
  return {
    valid: true,
    score: ablChecked,
    ebv: r1(ebv),
    ablAvg,
    abnormal: false,
    bandLabel: `ABL ${ablChecked} mL`,
    band: `ABL ${ablChecked} mL — maximum allowable blood loss before reaching the target hematocrit.`,
    detail: `EBV = ${weight} kg × ${factor} mL/kg (${ABL_LABEL[o.category]}) = ${r1(ebv)} mL; ABL = EBV × (${hctI} − ${hctF})/${hctI} = ${ablChecked} mL (average-Hct form ${ablAvg} mL).`,
    note: ABL_NOTE,
  };
}
