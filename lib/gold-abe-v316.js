// spec-v316: GOLD ABE assessment tool — the 2023 GOLD refined "ABE" grouping that
// assigns a COPD patient to group A, B, or E from symptom burden (mMRC or CAT) and
// exacerbation history. The catalog already carries the GOLD spirometric grade
// (gold-spirometry, FEV1 severity), CAT, and mMRC individually, and each of those
// tiles' notes points to the ABE group "that drives pharmacotherapy" as a separate,
// un-built clinician tool — this fills that gap. The 2023 report replaced the older
// 2017-2022 ABCD grid, collapsing the former C and D into a single exacerbation-prone
// group E; the axes below have been stable across the 2023, 2024, and 2025 reports.
//
// HIGH-STAKES: this reports the GROUP ASSIGNMENT (A / B / E), NOT a treatment order
// (spec-v11 §5.3). The group informs initial pharmacotherapy, but the drug choice, the
// eosinophil / comorbidity nuances, and the management plan stay with the clinician.
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), from the GOLD report (same issuer as
// the existing gold-spirometry tile):
//   - Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global Strategy
//     for the Prevention, Diagnosis and Management of COPD: 2025 Report. goldcopd.org.
//     The "Assessment of ... symptoms/risk of exacerbations" ABE tool.
//
// Two independent axes:
//   Symptoms  : "more symptoms" if mMRC >= 2 OR CAT >= 10; otherwise "less symptoms".
//   Exacerbations (past 12 months): "high risk" if >= 2 moderate exacerbations OR
//     >= 1 leading to hospital admission; otherwise (0-1 moderate, none hospitalized).
// Group:
//   E : high exacerbation risk (regardless of symptom burden).
//   B : low exacerbation risk AND more symptoms.
//   A : low exacerbation risk AND less symptoms.

function toNum(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}
function on(v) { return v === true; }

const NOTE = 'GOLD ABE assessment tool (GOLD 2025 Report; introduced in the 2023 refinement, which replaced the 2017-2022 ABCD grid by merging C and D into group E). Two axes: symptom burden — "more symptoms" if mMRC >= 2 or CAT >= 10 — and exacerbation history over the past 12 months — "high risk" if >= 2 moderate exacerbations or >= 1 leading to hospital admission. Group A: low exacerbation risk and less symptoms. Group B: low exacerbation risk and more symptoms. Group E: high exacerbation risk, regardless of symptom burden. The group informs initial pharmacotherapy per the GOLD algorithm, but is a classification, not a drug order; the treatment choice, eosinophil count, and comorbidities stay with the clinician. The spirometric grade (GOLD 1-4) is reported separately (gold-spirometry) and no longer sets the letter group.';

// input:
//   mmrc: number 0-4 (mMRC dyspnea grade) -- optional
//   cat: number 0-40 (COPD Assessment Test total) -- optional
//     (at least one of mmrc / cat is required)
//   moderateExacerbations: number >= 0, moderate exacerbations in the past 12 months
//     that did not lead to hospital admission (default 0)
//   hospitalizedExacerbation: bool, >= 1 exacerbation leading to hospital admission
export function goldAbe(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const mmrc = toNum(o.mmrc);
  const cat = toNum(o.cat);
  if (mmrc === null && cat === null) {
    return { valid: false, message: 'Enter the mMRC dyspnea grade (0-4) or the CAT score (0-40) — at least one symptom measure is required.' };
  }
  if (mmrc !== null && (Number.isNaN(mmrc) || mmrc < 0 || mmrc > 4)) {
    return { valid: false, message: 'mMRC dyspnea grade must be 0-4.' };
  }
  if (cat !== null && (Number.isNaN(cat) || cat < 0 || cat > 40)) {
    return { valid: false, message: 'CAT score must be 0-40.' };
  }

  let moderate = toNum(o.moderateExacerbations);
  if (moderate === null) moderate = 0;
  if (Number.isNaN(moderate) || moderate < 0) {
    return { valid: false, message: 'Moderate exacerbations must be 0 or more.' };
  }
  const hospitalized = on(o.hospitalizedExacerbation);

  // Symptom axis: "more symptoms" if either instrument crosses its threshold.
  const moreSymptoms = (mmrc !== null && mmrc >= 2) || (cat !== null && cat >= 10);
  // The measure that names the axis result (the one that crossed, when more symptoms;
  // otherwise whichever measures were entered).
  let symptomDetail;
  if (mmrc !== null && mmrc >= 2) symptomDetail = `mMRC ${mmrc} >= 2`;
  else if (cat !== null && cat >= 10) symptomDetail = `CAT ${cat} >= 10`;
  else if (mmrc !== null && cat !== null) symptomDetail = `mMRC ${mmrc} < 2 and CAT ${cat} < 10`;
  else if (mmrc !== null) symptomDetail = `mMRC ${mmrc} < 2`;
  else symptomDetail = `CAT ${cat} < 10`;

  // Exacerbation axis: high risk (-> E) if >= 2 moderate or any hospitalization.
  const highExacRisk = moderate >= 2 || hospitalized;
  const exacPhrase = hospitalized
    ? `${moderate} moderate exacerbation${moderate === 1 ? '' : 's'} plus >= 1 hospitalized in the past year`
    : `${moderate} moderate exacerbation${moderate === 1 ? '' : 's'}, none hospitalized in the past year`;

  let group, band;
  if (highExacRisk) {
    group = 'E';
    band = `Group E — high future-exacerbation risk (${exacPhrase}); this sets the group regardless of symptom burden (${moreSymptoms ? 'more' : 'less'} symptoms, ${symptomDetail}).`;
  } else if (moreSymptoms) {
    group = 'B';
    band = `Group B — more symptoms (${symptomDetail}) with low future-exacerbation risk (${exacPhrase}).`;
  } else {
    group = 'A';
    band = `Group A — less symptoms (${symptomDetail}) with low future-exacerbation risk (${exacPhrase}).`;
  }

  return {
    valid: true,
    group,
    moreSymptoms,
    highExacRisk,
    mmrc: mmrc === null ? null : mmrc,
    cat: cat === null ? null : cat,
    moderateExacerbations: moderate,
    hospitalizedExacerbation: hospitalized,
    abnormal: group === 'E',
    bandLabel: `GOLD group ${group}`,
    band,
    note: NOTE,
  };
}
