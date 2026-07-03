// spec-v209: advanced cardiology risk-equation & prognosis instruments (Advanced
// Prognostic & Risk-Equation Instruments program, spec-v209 §1.1). Every id was
// verified absent by a direct scan of app.js first (spec-v85 §6.2). None
// duplicates a live tile; v209 runs no AI and makes no runtime network call.
// These estimate risk/prognosis — they are NOT an ICD referral, device order,
// transplant listing, or anticoagulation order (spec-v11 §5.3). Shipped one tile
// at a time per an active /goal.
//
//   hcmRiskScd - HCM Risk-SCD (5-year sudden-cardiac-death risk)
//   chargeAf   - CHARGE-AF (5-year incident atrial fibrillation risk)
//   arvcRisk   - 2019 ARVC ventricular-arrhythmia model
//
// The proposed `mecki` tile is NOT built here: it is already live (shipped by
// spec-v202, lib/cvrisk-engines-v202.js) — the spec-v85 §6.2 collision re-check
// found it, so v209 does not duplicate it. The proposed `seattle-hf` tile is
// deferred (its full coefficient / baseline-survival / device-modifier set is not
// reproducible from >= 2 open sources, spec-v97 — the same deferral taken at
// spec-v202).
//
// COEFFICIENTS / BASELINE-SURVIVAL TERMS RE-FETCHED, NEVER RECALLED (spec-v97),
// each cross-verified across >= 2 independent open sources at implementation:
//   - HCM Risk-SCD (O'Mahony C, Jichi F, Pavlou M, et al, Eur Heart J
//     2014;35(30):2010-2020): 5-year SCD probability = 1 − 0.998^exp(PI), with
//     the prognostic index PI = 0.15939858·MWT − 0.00294271·MWT² + 0.0259082·LA
//     + 0.00446131·maxLVOT + 0.4583082·FHxSCD + 0.82639195·NSVT + 0.71650361·
//     syncope − 0.01799934·age. Coefficients and the 0.998 baseline reproduced
//     identically across the ESC/Medscape/QxMD calculators. ESC bands: < 4% low,
//     4–6% intermediate, ≥ 6% high 5-year risk. Validated domain: age ≥ 16, no
//     prior cardiac arrest / sustained VT, no maximal wall thickness ≥ 35 mm, no
//     prior ICD.

import { num, r2 } from './num.js';

function inRange(v, lo, hi) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) return null;
  return n;
}
function bool(v) { return v === true || v === 1 || v === '1' || v === 'true' || v === 'yes'; }

// --- 2.1 HCM Risk-SCD --------------------------------------------------------
const HCM_NOTE = 'HCM Risk-SCD (O\'Mahony C, Jichi F, Pavlou M, et al, Eur Heart J 2014;35(30):2010-2020): the ESC-endorsed 5-year sudden-cardiac-death risk estimator for hypertrophic cardiomyopathy. 5-year SCD probability = 1 − 0.998^exp(PI) from seven predictors (age, maximal LV wall thickness, left-atrial diameter, maximal LVOT gradient, family history of SCD, NSVT, unexplained syncope). ESC bands: < 4% low, 4–6% intermediate, ≥ 6% high — these inform the ICD discussion. Validated domain: age ≥ 16, no prior cardiac arrest / sustained VT, no wall thickness ≥ 35 mm, no prior ICD. A risk estimate, not an ICD order.';

export function hcmRiskScd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = inRange(o.age, 16, 120);
  const mwt = inRange(o.wallThickness, 5, 35);
  const la = inRange(o.laDiameter, 20, 80);
  const lvot = inRange(o.lvotGradient, 0, 300);
  if (age === null || mwt === null || la === null || lvot === null) {
    return { valid: false, message: 'Enter age (≥ 16), maximal LV wall thickness (mm, model domain < 35), left-atrial diameter (mm), and maximal LVOT gradient (mmHg); set the three yes/no risk factors.' };
  }
  const pi = 0.15939858 * mwt
    - 0.00294271 * mwt * mwt
    + 0.0259082 * la
    + 0.00446131 * lvot
    + 0.4583082 * (bool(o.fhxScd) ? 1 : 0)
    + 0.82639195 * (bool(o.nsvt) ? 1 : 0)
    + 0.71650361 * (bool(o.syncope) ? 1 : 0)
    - 0.01799934 * age;
  const clamped = Math.max(-40, Math.min(40, pi));
  const pct = r2(Math.max(0, Math.min(100, (1 - Math.pow(0.998, Math.exp(clamped))) * 100)));
  const value = num('HCM Risk-SCD', pct, { min: 0, max: 100 });
  let tier; let abnormal = true;
  if (value < 4) { tier = 'low 5-year SCD risk (< 4%)'; abnormal = false; }
  else if (value < 6) tier = 'intermediate 5-year SCD risk (4–6%)';
  else tier = 'high 5-year SCD risk (≥ 6%)';
  const factors = [];
  if (bool(o.fhxScd)) factors.push('family history of SCD');
  if (bool(o.nsvt)) factors.push('NSVT');
  if (bool(o.syncope)) factors.push('unexplained syncope');
  return {
    valid: true,
    score: value,
    abnormal,
    bandLabel: `HCM Risk-SCD ${value}%`,
    band: `HCM Risk-SCD ${value}% — ${tier}.`,
    detail: `PI from age ${age}, wall thickness ${mwt} mm, LA ${la} mm, LVOT ${lvot} mmHg${factors.length ? ', ' + factors.join(', ') : ''}. Validated for age ≥ 16 without prior arrest/sustained VT, wall thickness < 35 mm, or prior ICD.`,
    note: HCM_NOTE,
  };
}

// --- 2.4 CHARGE-AF -----------------------------------------------------------
// COEFFICIENTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across the
// open-access CHARGE-AF Consortium paper reproductions (Alonso A, et al, J Am
// Heart Assoc 2013;2(2):e000102) and MDCalc/johnsonfrancis: the linear predictor
//   LP = 0.508·(age/5) + 0.465·[white] + 0.248·(height/10 cm) + 0.115·(weight/15
//        kg) + 0.197·(SBP/20) − 0.101·(DBP/10) + 0.359·smoker + 0.349·antiHTN
//        + 0.237·diabetes + 0.701·heart-failure + 0.496·MI;
// and the 5-year incident-AF risk = 1 − 0.9718412736^exp(LP − 12.5815600). The
// baseline-survival 0.9718412736 and centering 12.5815600 constants are the
// published simple-model values.
const CHARGE_NOTE = 'CHARGE-AF (Alonso A, Krijthe BP, Aspelund T, et al, J Am Heart Assoc 2013;2(2):e000102): a simple 5-year incident-atrial-fibrillation risk model from routine variables — age, race, height, weight, systolic and diastolic BP, current smoking, antihypertensive use, diabetes, heart failure, and prior MI. 5-year AF risk = 1 − 0.9718412736^exp(LP − 12.5815600). Used to select patients for AF screening — a risk estimate, not an anticoagulation or monitoring order.';

export function chargeAf(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const age = inRange(o.age, 18, 120);
  const height = inRange(o.height, 100, 250);
  const weight = inRange(o.weight, 20, 400);
  const sbp = inRange(o.sbp, 60, 300);
  const dbp = inRange(o.dbp, 30, 200);
  if (age === null || height === null || weight === null || sbp === null || dbp === null) {
    return { valid: false, message: 'Enter age, height (cm), weight (kg), and systolic and diastolic BP (mmHg); set race and the clinical risk factors.' };
  }
  const lp = 0.508 * (age / 5)
    + 0.465 * (bool(o.white) ? 1 : 0)
    + 0.248 * (height / 10)
    + 0.115 * (weight / 15)
    + 0.197 * (sbp / 20)
    - 0.101 * (dbp / 10)
    + 0.359 * (bool(o.smoker) ? 1 : 0)
    + 0.349 * (bool(o.antiHtn) ? 1 : 0)
    + 0.237 * (bool(o.diabetes) ? 1 : 0)
    + 0.701 * (bool(o.heartFailure) ? 1 : 0)
    + 0.496 * (bool(o.mi) ? 1 : 0);
  const expo = Math.max(-40, Math.min(40, lp - 12.5815600));
  const pct = r2(Math.max(0, Math.min(100, (1 - Math.pow(0.9718412736, Math.exp(expo))) * 100)));
  const value = num('CHARGE-AF', pct, { min: 0, max: 100 });
  const abnormal = value >= 5;
  return {
    valid: true,
    score: value,
    abnormal,
    bandLabel: `CHARGE-AF ${value}%`,
    band: `CHARGE-AF ${value}% — estimated 5-year risk of incident atrial fibrillation${abnormal ? ' (elevated; ≥ 5% is often used to select for AF screening)' : ''}.`,
    detail: `Linear predictor ${r2(lp)}; 5-year AF risk = 1 − 0.9718412736^exp(LP − 12.5816).`,
    note: CHARGE_NOTE,
  };
}
