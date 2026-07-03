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

// --- 2.2 GLIM criteria for malnutrition -------------------------------------
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across the ESPEN
// GLIM fact sheet and the consensus report (Cederholm T, Jensen GL, Correia MITD,
// et al, Clin Nutr 2019;38(1):1-9): malnutrition requires ≥ 1 PHENOTYPIC criterion
// (non-volitional weight loss, low BMI, or reduced muscle mass) AND ≥ 1 ETIOLOGIC
// criterion (reduced intake/assimilation, or inflammation/disease burden).
// Severity is graded on the phenotypic criteria alone: Stage 1 (moderate) = weight
// loss 5-10% within 6 mo (or 10-20% beyond) or BMI < 20 (< 22 if ≥ 70 y); Stage 2
// (severe) = weight loss > 10% within 6 mo (or > 20% beyond) or BMI < 18.5 (< 20
// if ≥ 70 y).
const GLIM_NOTE = 'GLIM criteria (Cederholm T, Jensen GL, Correia MITD, et al, Clin Nutr 2019;38(1):1-9): the international consensus that unifies ESPEN / ASPEN / PENSA / FELANPE malnutrition diagnosis after a positive screen. Malnutrition requires ≥ 1 phenotypic criterion (weight loss, low BMI, or reduced muscle mass) AND ≥ 1 etiologic criterion (reduced intake/assimilation, or inflammation/disease burden). Severity is graded on the phenotypic criteria: Stage 1 moderate vs Stage 2 severe (weight loss > 10% within 6 mo, or BMI < 18.5). A diagnostic step, not a feeding order.';
const GLIM_GRADE = { none: 0, moderate: 1, severe: 2 };

export function glim(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const wl = Object.prototype.hasOwnProperty.call(GLIM_GRADE, o.weightLoss) ? o.weightLoss : 'none';
  const bmi = Object.prototype.hasOwnProperty.call(GLIM_GRADE, o.lowBmi) ? o.lowBmi : 'none';
  const muscle = o.reducedMuscle === true || o.reducedMuscle === 1 || o.reducedMuscle === '1' || o.reducedMuscle === 'yes';
  const intake = o.reducedIntake === true || o.reducedIntake === 1 || o.reducedIntake === '1' || o.reducedIntake === 'yes';
  const inflam = o.inflammation === true || o.inflammation === 1 || o.inflammation === '1' || o.inflammation === 'yes';
  const phenotypic = [];
  if (wl !== 'none') phenotypic.push(`weight loss (${wl})`);
  if (bmi !== 'none') phenotypic.push(`low BMI (${bmi})`);
  if (muscle) phenotypic.push('reduced muscle mass');
  const etiologic = [];
  if (intake) etiologic.push('reduced intake/assimilation');
  if (inflam) etiologic.push('inflammation/disease burden');
  const diagnosed = phenotypic.length >= 1 && etiologic.length >= 1;
  let stage = null;
  if (diagnosed) stage = (GLIM_GRADE[wl] === 2 || GLIM_GRADE[bmi] === 2) ? 2 : 1;
  return {
    valid: true,
    diagnosed,
    stage,
    abnormal: diagnosed,
    bandLabel: diagnosed ? `GLIM Stage ${stage}` : 'GLIM: not diagnosed',
    band: diagnosed
      ? `Malnutrition diagnosed (GLIM) — Stage ${stage} (${stage === 2 ? 'severe' : 'moderate'}).`
      : 'Malnutrition not diagnosed by GLIM — needs ≥ 1 phenotypic AND ≥ 1 etiologic criterion.',
    detail: `Phenotypic: ${phenotypic.length ? phenotypic.join(', ') : 'none'}. Etiologic: ${etiologic.length ? etiologic.join(', ') : 'none'}.`,
    note: GLIM_NOTE,
  };
}

// --- 2.1 Subjective Global Assessment (Detsky SGA) --------------------------
// STRUCTURE RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across the
// Detsky paper (Detsky AS, et al, JPEN 1987;11(1):8-13) and standard nutrition
// references: the original SGA emits NO numeric score — it is a structured
// clinician gestalt from five history features (weight change over 6 mo and the
// past 2 weeks, dietary-intake change, GI symptoms > 2 weeks, functional
// capacity, disease metabolic demand) and four physical-exam features (loss of
// subcutaneous fat, muscle wasting, ankle/sacral edema, ascites), yielding an
// overall rating: A (well nourished), B (moderately / suspected malnourished), or
// C (severely malnourished). Weight loss > 10% ongoing, poor intake, and
// fat/muscle loss weigh heaviest. The tile records the clinician's A/B/C rating.
const SGA_NOTE = 'Subjective Global Assessment (Detsky AS, McLaughlin JR, Baker JP, et al, JPEN 1987;11(1):8-13): the reference bedside malnutrition assessment, a structured clinician gestalt from five history features (weight change, intake change, GI symptoms > 2 weeks, functional capacity, disease metabolic demand) and four exam features (subcutaneous-fat loss, muscle wasting, edema, ascites). The original SGA emits no numeric score — it yields an overall rating: A (well nourished), B (moderately or suspected malnourished), or C (severely malnourished). Weight loss > 10% ongoing, poor intake, and fat/muscle loss weigh heaviest. A structured assessment, not a feeding order.';
const SGA_RATING = {
  A: 'A — well nourished',
  B: 'B — moderately (or suspected) malnourished',
  C: 'C — severely malnourished',
};

export function sga(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rating = Object.prototype.hasOwnProperty.call(SGA_RATING, o.rating) ? o.rating : null;
  if (rating === null) {
    return { valid: false, message: 'Grade the five history and four physical-exam features, then select the overall SGA rating (A, B, or C).' };
  }
  const abnormal = rating !== 'A';
  return {
    valid: true,
    rating,
    abnormal,
    bandLabel: `SGA ${rating}`,
    band: `SGA ${SGA_RATING[rating]}.`,
    detail: rating === 'A'
      ? 'Well nourished (or anabolic with recent improvement) — no significant weight loss, intact intake, no fat/muscle loss.'
      : rating === 'B'
        ? 'Moderate / suspected malnutrition — e.g. ~5–10% weight loss, reduced intake, mild fat/muscle loss.'
        : 'Severe malnutrition — ongoing > 10% weight loss with marked fat/muscle loss and functional deficit.',
    note: SGA_NOTE,
  };
}
