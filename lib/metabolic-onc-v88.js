// spec-v88 (third feature spec of the spec-v85 Advanced Clinical Calculators
// program): three deterministic high-acuity endocrine/oncology calculators.
//
//   dkaHhs             - ADA hyperglycemic-crisis classification (DKA vs HHS)
//                        and DKA mild/moderate/severe grading
//   calvertCarboplatin - Calvert-formula carboplatin dose with the FDA GFR cap
//   tlsCairoBishop     - Cairo-Bishop tumor-lysis-syndrome lab/clinical grading
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v14.js wire these to the home grid.
// Every function takes a single destructured object so the spec-v59 fuzz
// harness can drive each field through its adversarial matrix. Each division is
// guarded so no non-finite value reaches a returned string (spec-v59): a
// zero/blank denominator surfaces a `valid:false` fallback rather than an
// Infinity or NaN. r1/r2 come from lib/num.js (spec-v53 §4.1). None authors a
// management order in Sophie's voice (spec-v11 §5.3) - each surfaces the
// computation and the cited source's own classification / grade.

import { r1 } from './num.js';

// Finite-or-null: any non-finite input (NaN/Infinity/''/undefined/null) is
// treated as "not provided" rather than throwing, so optional fields are safe.
const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
// Strictly-positive finite or null (a denominator we can divide by).
const pos = (v) => { const f = fin(v); return f != null && f > 0 ? f : null; };

// --- 2.1 dkaHhs - ADA hyperglycemic-crisis classification & DKA grading ------
// The ADA hyperglycemic-crisis criteria classify the crisis from glucose, pH,
// bicarbonate, ketones, effective serum osmolality, anion gap, and mental
// status; DKA is graded mild/moderate/severe on fixed pH and HCO3 cutoffs. This
// assembles math the catalog already ships (anion gap, effective osmolality)
// into the bedside classification. Glucose, pH, and HCO3 are required to
// classify; a partial input surfaces the complete-the-fields fallback rather
// than a misleading verdict. None of the cutoffs is computed - they are the
// published ADA thresholds, quoted.
export function dkaHhs({
  glucose, ph, bicarbonate, betaHydroxybutyrate, mental, sodium, chloride,
} = {}) {
  const g = pos(glucose);
  const phV = pos(ph);
  const hco3 = fin(bicarbonate);
  if (g == null || phV == null || hco3 == null) {
    return {
      valid: false,
      band: 'Enter glucose, pH, and bicarbonate to classify the crisis.',
      note: 'The DKA/HHS classification needs at least the plasma glucose, the arterial or venous pH, and the serum bicarbonate.',
    };
  }
  const na = fin(sodium);
  const cl = fin(chloride);
  const bohb = fin(betaHydroxybutyrate);

  // Effective serum osmolality = 2·Na + glucose/18 (mOsm/kg); BUN is excluded
  // from the *effective* form. Anion gap = Na − Cl − HCO3. Both render only
  // when their inputs are present (spec-v59: no compute from a missing field).
  const effOsm = na != null ? 2 * na + g / 18 : null;
  const anionGap = na != null && cl != null ? na - cl - hco3 : null;

  // ADA criteria. Ketosis is confirmed only when beta-hydroxybutyrate is
  // provided (>= 3.0 mmol/L is significant ketonemia); without it the ketosis
  // criterion is unknown and a strict DKA classification is withheld.
  const hyperglycemia = g >= 250;
  const acidosis = phV < 7.30 && hco3 < 18;
  const ketosisKnown = bohb != null;
  const ketosis = ketosisKnown && bohb >= 3.0;
  const hyperosmolar = effOsm != null && g > 600 && effOsm > 320;

  const dkaCore = hyperglycemia && acidosis && ketosis;
  // HHS: marked hyperglycemia + hyperosmolality, pH and HCO3 above the DKA
  // range, and minimal ketosis.
  const hhsCore = hyperosmolar && phV > 7.30 && hco3 > 18 && !ketosis;

  // DKA severity (ADA table): take the more severe of the pH grade and the
  // HCO3 grade when they disagree.
  const phGrade = phV < 7.00 ? 3 : (phV < 7.25 ? 2 : (phV <= 7.30 ? 1 : 0));
  const hco3Grade = hco3 < 10 ? 3 : (hco3 < 15 ? 2 : (hco3 <= 18 ? 1 : 0));
  const sev = Math.max(phGrade, hco3Grade);
  const gradeName = sev === 3 ? 'severe' : (sev === 2 ? 'moderate' : 'mild');

  let classification; let band; let grade = null;
  if (dkaCore && hyperosmolar) {
    classification = 'mixed';
    grade = gradeName;
    band = `Mixed DKA/HHS picture: diabetic ketoacidosis (${gradeName}) with hyperosmolality (effective osmolality over 320 mOsm/kg).`;
  } else if (dkaCore) {
    classification = 'DKA';
    grade = gradeName;
    band = `Diabetic ketoacidosis (DKA), ${gradeName} grade (ADA).`;
  } else if (hhsCore) {
    classification = 'HHS';
    band = 'Hyperosmolar hyperglycemic state (HHS): marked hyperglycemia and hyperosmolality with minimal ketosis and a pH above the DKA range.';
  } else {
    classification = 'none';
    band = ketosisKnown
      ? 'Criteria for a complete DKA or HHS classification are not met by these values; the criterion grid shows which thresholds are present.'
      : 'Enter beta-hydroxybutyrate (or a urine ketone grade) to confirm the ketosis criterion; absolute thresholds are shown in the grid.';
  }

  return {
    valid: true,
    classification,
    grade,
    band,
    anionGap: anionGap == null ? null : r1(anionGap),
    effOsm: effOsm == null ? null : Math.round(effOsm),
    criteria: {
      hyperglycemia,
      acidosis,
      ketosis: ketosisKnown ? ketosis : null,
      hyperosmolar,
    },
    note: 'Effective serum osmolality = 2 × Na + glucose/18; anion gap = Na − Cl − HCO3. Grading cutoffs are the ADA table (mild pH 7.25–7.30 / HCO3 15–18; moderate pH 7.00–7.24 / HCO3 10–14; severe pH < 7.00 / HCO3 < 10). Classification only; the insulin, fluid, and potassium orders stay with the clinician and protocol.',
  };
}

// --- 2.2 calvertCarboplatin - Calvert dose with the FDA GFR cap -------------
// Dose (mg) = target AUC × (GFR + 25) (Calvert 1989). When GFR is estimated
// from serum creatinine the FDA recommends capping it at 125 mL/min to prevent
// systematic overdosing with IDMS-standardized assays. The cap is applied (when
// on) BEFORE the dose, and the substitution is reported so the user can never
// silently receive the uncapped (overdosing) result. A blank/zero AUC or GFR
// surfaces a fallback, never a dose computed from NaN.
export function calvertCarboplatin({ targetAuc, gfr, capGfr = true } = {}) {
  const auc = pos(targetAuc);
  const gfrV = pos(gfr);
  if (auc == null || gfrV == null) {
    return {
      valid: false,
      band: 'Enter a target AUC and a GFR greater than 0.',
      note: 'The Calvert dose needs a target AUC (typically 4–6 mg/mL·min) and a glomerular filtration rate (mL/min).',
    };
  }
  const cap = capGfr !== false && capGfr !== 'off';
  const wasCapped = cap && gfrV > 125;
  const gfrUsed = wasCapped ? 125 : gfrV;
  const dose = auc * (gfrUsed + 25);
  return {
    valid: true,
    dose: Math.round(dose),
    auc: r1(auc),
    gfrUsed,
    gfrEntered: r1(gfrV),
    wasCapped,
    band: wasCapped
      ? `Estimated GFR ${r1(gfrV)} mL/min capped at 125 mL/min (FDA): dose computed from the capped value to avoid overdosing.`
      : 'GFR used as entered (no cap applied).',
    note: 'Dose = target AUC × (GFR + 25). When GFR is estimated from serum creatinine the FDA recommends capping it at 125 mL/min; the cap is on by default and the substitution is shown above. Confirm against your institutional protocol and an independent dose check before administration.',
  };
}

// --- 2.3 tlsCairoBishop - Cairo-Bishop tumor-lysis-syndrome grading ----------
// Laboratory TLS requires >= 2 metabolic abnormalities (uric acid, potassium,
// phosphate, calcium) within the window (3 days before to 7 days after
// cytotoxic therapy); each criterion is met by its absolute threshold OR, when
// a baseline is supplied, a >= 25% change in the adverse direction. Clinical
// TLS adds an end-organ criterion (creatinine >= 1.5× ULN, cardiac arrhythmia/
// sudden death, or seizure) and carries the Cairo-Bishop grade (0–V), assigned
// as the maximum manifestation grade. The corrected-calcium criterion reuses
// the catalog's albumin correction (Ca + 0.8·(4 − albumin)).
export function tlsCairoBishop({
  uricAcid, uricBaseline, potassium, potassiumBaseline,
  phosphate, phosphateBaseline, calcium, calciumBaseline, albumin,
  pediatric = false, creatinine, creatinineUln, arrhythmia, seizure,
} = {}) {
  const ua = fin(uricAcid);
  const k = fin(potassium);
  const phos = fin(phosphate);
  const ca = fin(calcium);
  if (ua == null && k == null && phos == null && ca == null) {
    return {
      valid: false,
      band: 'Enter at least the metabolic labs (uric acid, potassium, phosphate, calcium) to apply the Cairo-Bishop definition.',
      note: 'Laboratory TLS is defined on the four metabolic values; enter the ones available.',
    };
  }

  // A criterion is met by its absolute threshold OR, when a baseline is given,
  // a >= 25% change in the adverse direction (rise for uric/K/phos, fall for
  // calcium). `usedBaseline` records whether any percent-change branch fired.
  const phosThreshold = pediatric ? 6.5 : 4.5;
  const alb = fin(albumin);
  const correctedCa = ca == null ? null : (alb != null ? ca + 0.8 * (4 - alb) : ca);

  const roseBy25 = (v, base) => {
    const b = pos(base);
    return v != null && b != null && (v - b) / b >= 0.25;
  };
  const fellBy25 = (v, base) => {
    const b = pos(base);
    return v != null && b != null && (b - v) / b >= 0.25;
  };

  const uaBase = roseBy25(ua, uricBaseline);
  const kBase = roseBy25(k, potassiumBaseline);
  const phosBase = roseBy25(phos, phosphateBaseline);
  const caBase = fellBy25(correctedCa, calciumBaseline);
  const usedBaseline = uaBase || kBase || phosBase || caBase;

  const uaMet = (ua != null && ua >= 8) || uaBase;
  const kMet = (k != null && k >= 6) || kBase;
  const phosMet = (phos != null && phos >= phosThreshold) || phosBase;
  const caMet = (correctedCa != null && correctedCa <= 7) || caBase;

  const metCount = [uaMet, kMet, phosMet, caMet].filter(Boolean).length;
  const labTls = metCount >= 2;

  // End-organ (clinical) criteria. Creatinine ratio drives the renal grade; the
  // arrhythmia/seizure selects carry the Cairo-Bishop severity (0–V).
  const cr = pos(creatinine);
  const uln = pos(creatinineUln);
  const crRatio = cr != null && uln != null ? cr / uln : null;
  const renalCriterion = crRatio != null && crRatio >= 1.5;
  // Renal grade: 1.5×ULN is grade I; >1.5–3× is II; >3–6× is III; >6× is IV.
  let renalGrade = 0;
  if (crRatio != null && crRatio >= 1.5) {
    if (Math.abs(crRatio - 1.5) < 1e-9) renalGrade = 1;
    else if (crRatio <= 3) renalGrade = 2;
    else if (crRatio <= 6) renalGrade = 3;
    else renalGrade = 4;
  }
  const arrGrade = { none: 0, present: 3, 'life-threatening': 4, 'sudden-death': 5 }[arrhythmia] || 0;
  const szGrade = { none: 0, single: 2, 'poorly-controlled': 3, prolonged: 4 }[seizure] || 0;
  const clinicalCriterion = renalCriterion || arrGrade > 0 || szGrade > 0;

  const clinicalTls = labTls && clinicalCriterion;
  const grade = clinicalTls ? Math.max(renalGrade, arrGrade, szGrade, 1) : 0;
  const gradeRoman = ['0', 'I', 'II', 'III', 'IV', 'V'][grade];

  let band;
  if (clinicalTls) {
    band = `Clinical tumor lysis syndrome (Cairo-Bishop grade ${gradeRoman}): laboratory TLS plus an end-organ criterion.`;
  } else if (labTls) {
    band = 'Laboratory tumor lysis syndrome: 2 or more metabolic criteria met; no end-organ (clinical) criterion entered.';
  } else {
    band = `Criteria for laboratory TLS are not met (${metCount} of the 4 metabolic criteria present; 2 are required).`;
  }

  return {
    valid: true,
    labTls,
    clinicalTls,
    metCount,
    grade,
    gradeRoman,
    crRatio: crRatio == null ? null : r1(crRatio),
    usedBaseline,
    criteria: { uaMet, kMet, phosMet, caMet, renalCriterion },
    correctedCa: correctedCa == null ? null : r1(correctedCa),
    band,
    note: `Laboratory TLS: ≥ 2 of uric acid ≥ 8, potassium ≥ 6, phosphate ≥ ${phosThreshold} (${pediatric ? 'pediatric' : 'adult'}), corrected calcium ≤ 7 mg/dL — each by the absolute threshold or, when a baseline is given, a 25% change. Assumed window: 3 days before to 7 days after cytotoxic therapy. ${usedBaseline ? 'A 25%-change criterion was applied against an entered baseline. ' : 'No baseline entered, so only the absolute thresholds were applied. '}The risk tier and prophylaxis choice stay with the clinician and protocol.`,
  };
}
