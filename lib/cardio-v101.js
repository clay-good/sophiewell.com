// spec-v101 (Wave 1 of the spec-v100 MDCalc Parity Completion program): five
// deterministic atrial-fibrillation stroke-risk and QT-prolongation instruments
// that fill confirmed gaps beside the existing combined `chads` view and the
// `qtc-suite` corrected-interval calculator. None duplicates a live tile.
//
//   chads2      - CHADS2 stroke-risk score (Gage 2001) -> 0-6 + annual stroke rate
//   cha2ds2Va   - CHA2DS2-VA (2024 ESC, sex point removed) -> 0-8 + OAC framing
//   chads65     - CHADS-65 Canadian (CCS 2020) anticoagulation pathway verdict
//   atriaStroke - ATRIA Stroke Risk Score (Singer 2013) -> 0-15 + risk band
//   tisdaleQtc  - Tisdale QT-prolongation risk score (Tisdale 2013) -> 0-21 + band
//
// Pure functions only (spec-v29 §3 one-line test). Citations live inline in
// lib/meta.js; renderers in views/group-v26.js wire these to the home grid.
//
// Robustness (spec-v101 §3): every score is bounded point-sum or sequential-gate
// logic that names which factors fired and clamps the total to its published
// maximum. atriaStroke selects the age-point column from the prior-stroke flag
// BEFORE summing, so a fuzzed age never reads the wrong column; out-of-band ages
// clamp to the nearest published band. chads65 returns a single pathway verdict
// and the gate that produced it, never a half-evaluated pathway. None authors an
// anticoagulation or dosing recommendation in Sophie's voice (spec-v11 §5.3) --
// the high-stakes AF-anticoagulation decision stays with the clinician and local
// protocol.

const fin = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const onFlag = (v) => v === true || v === 'yes' || v === 'on' || v === 1 || v === '1';

// --- 2.1 chads2 - CHADS2 stroke-risk score (Gage 2001) -------------------------
// CHF(1) + HTN(1) + Age >= 75(1) + DM(1) + prior Stroke/TIA(2). Total 0-6.
// Adjusted annual stroke rate per point from the original NRAF derivation table.
const CHADS2_RATE = ['1.9', '2.8', '4.0', '5.9', '8.5', '12.5', '18.2'];
const CHADS2_NOTE = 'CHADS2 stroke-risk score (Gage BF et al, JAMA 2001): congestive heart failure (1), hypertension (1), age >= 75 (1), diabetes mellitus (1), prior stroke/TIA (2). Total 0-6. The adjusted annual ischemic-stroke rate per point is from the original National Registry of Atrial Fibrillation derivation cohort (0 = 1.9%/yr ... 6 = 18.2%/yr). Superseded for routine use by CHA2DS2-VASc / the 2024 ESC CHA2DS2-VA, which are cross-linked; CHADS2 is shown for the migration. A stroke-risk estimate, not an anticoagulation order.';
export function chads2({ chf, hypertension, age75, diabetes, stroke } = {}) {
  const items = [
    { label: 'Congestive heart failure', value: onFlag(chf) ? 1 : 0 },
    { label: 'Hypertension', value: onFlag(hypertension) ? 1 : 0 },
    { label: 'Age >= 75', value: onFlag(age75) ? 1 : 0 },
    { label: 'Diabetes mellitus', value: onFlag(diabetes) ? 1 : 0 },
    { label: 'Prior stroke or TIA', value: onFlag(stroke) ? 2 : 0 },
  ];
  const total = items.reduce((a, it) => a + it.value, 0);
  const rate = CHADS2_RATE[total];
  return {
    valid: true,
    total,
    rate,
    items,
    band: `CHADS2 ${total}/6: adjusted annual stroke rate ${rate}%/yr (Gage 2001 derivation cohort).`,
    note: CHADS2_NOTE,
  };
}

// --- 2.2 cha2ds2Va - CHA2DS2-VA (2024 ESC, sex point removed) ------------------
// CHF/LV dysfunction(1) + HTN(1) + Age >= 75(2) + DM(1) + Stroke/TIA/TE(2) +
// Vascular disease(1) + Age 65-74(1). NO sex point (the 2024 ESC change vs
// CHA2DS2-VASc). Age is a single banded input: >= 75 scores 2, 65-74 scores 1.
const CHA2DS2VA_NOTE = 'CHA2DS2-VA (2024 ESC atrial-fibrillation guideline; Van Gelder IC et al, Eur Heart J 2024): congestive heart failure / LV dysfunction (1), hypertension (1), age >= 75 (2), diabetes (1), prior stroke / TIA / thromboembolism (2), vascular disease (1), age 65-74 (1). The 2024 ESC form removes the sex (Sc) point of CHA2DS2-VASc. Total 0-8; the ESC frames a score >= 2 as favoring oral anticoagulation. A stroke-risk estimate, not an anticoagulation order; the start/agent decision stays with the clinician and local protocol.';
export function cha2ds2Va({ age, chf, hypertension, diabetes, stroke, vascular } = {}) {
  const a = fin(age);
  if (a == null) {
    return { valid: false, band: '(enter age and the risk factors)', note: CHA2DS2VA_NOTE };
  }
  const clampedAge = Math.max(0, Math.min(130, a));
  const agePts = clampedAge >= 75 ? 2 : clampedAge >= 65 ? 1 : 0;
  const ageLabel = clampedAge >= 75 ? 'Age >= 75' : clampedAge >= 65 ? 'Age 65-74' : 'Age < 65';
  const items = [
    { label: 'CHF / LV dysfunction', value: onFlag(chf) ? 1 : 0 },
    { label: 'Hypertension', value: onFlag(hypertension) ? 1 : 0 },
    { label: ageLabel, value: agePts },
    { label: 'Diabetes mellitus', value: onFlag(diabetes) ? 1 : 0 },
    { label: 'Prior stroke / TIA / thromboembolism', value: onFlag(stroke) ? 2 : 0 },
    { label: 'Vascular disease', value: onFlag(vascular) ? 1 : 0 },
  ];
  const total = items.reduce((acc, it) => acc + it.value, 0);
  const favorsOac = total >= 2;
  return {
    valid: true,
    total,
    favorsOac,
    items,
    band: `CHA2DS2-VA ${total}/8: ${favorsOac ? 'at or above' : 'below'} the ESC score >= 2 threshold that favors oral anticoagulation.`,
    note: CHA2DS2VA_NOTE,
  };
}

// --- 2.3 chads65 - CHADS-65 Canadian (CCS 2020) pathway ------------------------
// Sequential gates: age >= 65 -> OAC; else any CHADS2 risk factor (CHF, HTN, DM,
// prior stroke/TIA -- age >= 75 cannot fire below 65) -> OAC; else coronary or
// peripheral arterial disease -> antiplatelet; else no antithrombotic.
const CHADS65_NOTE = 'CHADS-65 Canadian anticoagulation pathway (2020 CCS/CHRS atrial-fibrillation guideline; Andrade JG et al, Can J Cardiol 2020). Sequential gates: age >= 65 -> oral anticoagulant. Otherwise any CHADS2 risk factor (congestive heart failure, hypertension, diabetes, or prior stroke/TIA) -> oral anticoagulant. Otherwise coronary or peripheral arterial disease -> antiplatelet. Otherwise no antithrombotic therapy. The pathway names the gate that fired; the agent and dosing decision stays with the clinician and local protocol.';
export function chads65({ age, chf, hypertension, diabetes, stroke, vascularDisease } = {}) {
  const a = fin(age);
  if (a == null) {
    return { valid: false, band: '(enter age and the risk factors)', note: CHADS65_NOTE };
  }
  const clampedAge = Math.max(0, Math.min(130, a));
  const anyChads2 = onFlag(chf) || onFlag(hypertension) || onFlag(diabetes) || onFlag(stroke);
  let verdict;
  let gate;
  if (clampedAge >= 65) {
    verdict = 'oac';
    gate = 'Age >= 65';
  } else if (anyChads2) {
    verdict = 'oac';
    gate = 'CHADS2 risk factor present (CHF, hypertension, diabetes, or prior stroke/TIA)';
  } else if (onFlag(vascularDisease)) {
    verdict = 'antiplatelet';
    gate = 'Coronary or peripheral arterial disease';
  } else {
    verdict = 'none';
    gate = 'No qualifying gate';
  }
  const verdictText = {
    oac: 'Oral anticoagulant',
    antiplatelet: 'Antiplatelet therapy',
    none: 'No antithrombotic therapy',
  };
  return {
    valid: true,
    verdict,
    gate,
    band: `CHADS-65 pathway: ${verdictText[verdict]} -- gate: ${gate}.`,
    note: CHADS65_NOTE,
  };
}

// --- 2.4 atriaStroke - ATRIA Stroke Risk Score (Singer 2013) -------------------
// Two age-point columns selected by the prior-stroke flag (the published
// age x prior-stroke interaction; the prior-stroke 2x weighting is folded into
// the age points -- there is no separate prior-stroke line item). Other factors:
// female sex, diabetes, CHF, hypertension, proteinuria, eGFR < 45 or ESRD (1 each).
// Total 0-15. Risk bands: low 0-5 (< 1%/yr), intermediate 6 (1-< 2%/yr),
// high 7-15 (>= 2%/yr).
const ATRIA_AGE_NO_STROKE = [0, 3, 5, 6]; // <65, 65-74, 75-84, >=85
const ATRIA_AGE_STROKE = [8, 7, 7, 9];
function atriaAgeBand(age) {
  return age < 65 ? 0 : age < 75 ? 1 : age < 85 ? 2 : 3;
}
const ATRIA_NOTE = 'ATRIA Stroke Risk Score (Singer DE et al, J Am Heart Assoc 2013): an age + sex + comorbidity model for ischemic stroke / thromboembolism in atrial fibrillation. Age is scored from one of two columns depending on prior stroke (the published age x prior-stroke interaction -- with a prior stroke the < 65 band scores higher than the 65-84 bands; the prior-stroke weighting is folded into the age points, so there is no separate prior-stroke item). Female sex, diabetes, congestive heart failure, hypertension, proteinuria, and eGFR < 45 mL/min or ESRD add 1 point each. Total 0-15: low 0-5 (< 1%/yr), intermediate 6 (1-< 2%/yr), high 7-15 (>= 2%/yr). A stroke-risk estimate, not an anticoagulation order.';
export function atriaStroke(input = {}) {
  const { age, female, diabetes, chf, hypertension, proteinuria, renal, priorStroke } = input;
  const a = fin(age);
  if (a == null) {
    return { valid: false, band: '(enter age and the risk factors)', note: ATRIA_NOTE };
  }
  const clampedAge = Math.max(0, Math.min(130, a));
  const hasStroke = onFlag(priorStroke);
  const band = atriaAgeBand(clampedAge);
  const agePts = hasStroke ? ATRIA_AGE_STROKE[band] : ATRIA_AGE_NO_STROKE[band];
  const ageLabel = `Age (${clampedAge < 65 ? '< 65' : clampedAge < 75 ? '65-74' : clampedAge < 85 ? '75-84' : '>= 85'}, ${hasStroke ? 'prior stroke' : 'no prior stroke'} column)`;
  const items = [
    { label: ageLabel, value: agePts },
    { label: 'Female sex', value: onFlag(female) ? 1 : 0 },
    { label: 'Diabetes mellitus', value: onFlag(diabetes) ? 1 : 0 },
    { label: 'Congestive heart failure', value: onFlag(chf) ? 1 : 0 },
    { label: 'Hypertension', value: onFlag(hypertension) ? 1 : 0 },
    { label: 'Proteinuria', value: onFlag(proteinuria) ? 1 : 0 },
    { label: 'eGFR < 45 mL/min or ESRD', value: onFlag(renal) ? 1 : 0 },
  ];
  const total = items.reduce((acc, it) => acc + it.value, 0);
  const risk = total <= 5 ? 'low' : total === 6 ? 'intermediate' : 'high';
  const riskText = {
    low: 'low (< 1%/yr)',
    intermediate: 'intermediate (1-< 2%/yr)',
    high: 'high (>= 2%/yr)',
  };
  return {
    valid: true,
    total,
    risk,
    items,
    band: `ATRIA Stroke Score ${total}/15: ${riskText[risk]} annual ischemic-stroke risk.`,
    note: ATRIA_NOTE,
  };
}

// --- 2.5 tisdaleQtc - Tisdale QT-prolongation risk score (Tisdale 2013) --------
// Age >= 68(1) + female(1) + loop diuretic(1) + K <= 3.5(2) + admission QTc >= 450(2)
// + acute MI(2) + sepsis(3) + heart failure(3) + QT-prolonging drugs (one 3, >= two 6).
// The two drug items are cumulative in the MDCalc input model (>= 2 drugs = 1-drug
// 3 + 3 more), which is what makes the published maximum 21. Total 0-21:
// low <= 6, moderate 7-10, high >= 11.
const TISDALE_DRUGS = { none: 0, one: 3, 'two-plus': 6 };
const TISDALE_NOTE = 'Tisdale QT-prolongation risk score (Tisdale JE et al, Circ Cardiovasc Qual Outcomes 2013): age >= 68 (1), female sex (1), loop diuretic (1), serum potassium <= 3.5 mEq/L (2), admission QTc >= 450 ms (2), acute MI (2), sepsis (3), heart failure (3), and QT-prolonging drugs (one drug 3; two or more 6). Total 0-21: low <= 6, moderate 7-10, high >= 11 risk of drug-associated QTc prolongation. Takes the clinician-entered admission QTc and the drug/electrolyte flags, not a raw ECG tracing (qtc-suite computes the corrected interval). A risk estimate, not a drug-stop order.';
export function tisdaleQtc(input = {}) {
  const { age68, female, loopDiuretic, hypokalemia, qtcProlonged, acuteMi, sepsis, heartFailure, qtDrugs } = input;
  const drugPts = Object.prototype.hasOwnProperty.call(TISDALE_DRUGS, String(qtDrugs))
    ? TISDALE_DRUGS[String(qtDrugs)]
    : 0;
  const items = [
    { label: 'Age >= 68', value: onFlag(age68) ? 1 : 0 },
    { label: 'Female sex', value: onFlag(female) ? 1 : 0 },
    { label: 'Loop diuretic', value: onFlag(loopDiuretic) ? 1 : 0 },
    { label: 'Serum potassium <= 3.5 mEq/L', value: onFlag(hypokalemia) ? 2 : 0 },
    { label: 'Admission QTc >= 450 ms', value: onFlag(qtcProlonged) ? 2 : 0 },
    { label: 'Acute MI', value: onFlag(acuteMi) ? 2 : 0 },
    { label: 'Sepsis', value: onFlag(sepsis) ? 3 : 0 },
    { label: 'Heart failure', value: onFlag(heartFailure) ? 3 : 0 },
    { label: 'QT-prolonging drugs', value: drugPts },
  ];
  const total = items.reduce((acc, it) => acc + it.value, 0);
  const risk = total <= 6 ? 'low' : total <= 10 ? 'moderate' : 'high';
  const riskText = { low: 'low (<= 6)', moderate: 'moderate (7-10)', high: 'high (>= 11)' };
  return {
    valid: true,
    total,
    risk,
    items,
    band: `Tisdale QT risk ${total}/21: ${riskText[risk]} risk of drug-associated QTc prolongation.`,
    note: TISDALE_NOTE,
  };
}
