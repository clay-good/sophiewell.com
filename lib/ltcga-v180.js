// spec-v180 (§3.8 cluster of the spec-v172 Long-Term Care & Geriatric
// Assessment program): older-adult mortality & LTC-prognosis instruments.
// v180 ships 2 of its 7 proposed tiles at this implementation; the other five
// are deferred on sourcing grounds (see the deferral note below).
//
//   leeMortalityIndex (Lee 4-Year Mortality Index) - a weighted point sum of
//     age band + male sex + four comorbidities + current smoking + BMI < 25 +
//     four functional difficulties (total 0-26), mapped to the published 4-year
//     all-cause mortality bands. This index is published as a point-total ->
//     observed-mortality-band table, so the mapping is a table lookup with no
//     exponentiation and no complement: the spec-v140 sigmoid-saturation hazard
//     does not arise here (there is no 1 - sigmoid(-bx) path to leak Infinity).
//   chessScale (interRAI CHESS scale) - the signs-and-symptoms items counted and
//     capped at 2, plus one point each for a decline in decision-making, a
//     decline in ADL status, and an end-stage-disease (<= 6-month) prognosis,
//     for a total of 0-5. A capped integer combination; the output is the 0-5
//     instability score itself, NOT a mortality percentage, so no band-% source
//     is required.
//
// DEFERRED at implementation (spec-v97, the >= 2-source verbatim bar not
// cleared for the band mappings):
//   - schonberg-index: the 5-year item weights are double-sourced (JGIM 2009
//     Table 2 + the PubMed abstract), but the point -> mortality-band
//     percentages rest on a SINGLE source each (5-year: PMC2762505 Table 3
//     only; 9-year: PMC3158286 Table 3 only), and the 9-year weights are
//     published only as a non-extractable image. Same failure mode as the
//     spec-v148 valproate-correction and the spec-v173/v177/v179 deferrals.
//   - walter-index, suemoto-index, mitchell-mri, adept: not re-verified against
//     >= 2 independent sources at this implementation; each is parked until it
//     clears the bar (the logistic MRI/ADEPT forms would additionally need the
//     spec-v140 odds-space guard).
//
// Every weight and band below was re-fetched and cross-verified against >= 2
// independent sources at implementation (spec-v97). The Lee point weights agree
// verbatim across the JAMA 2006 paper (Table 3), the PubMed abstract / MDCalc
// reproduction, and the SoFOG "Score de Lee" PDF. The band thresholds
// (0-5 / 6-9 / 10-13 / >= 14) and the validation-cohort mortality figures
// (4% / 15% / 42% / 64%) agree across the JAMA validation-cohort Table 4, MDCalc,
// and the abstract. The development cohort reports 3% / 15% / 41% / 65%; the
// validation-cohort figures are used here (matching MDCalc and the abstract),
// and the two are never blended. The CHESS item set, the signs-and-symptoms
// cap-at-2 rule, and the "+ 3 other variables, max 5" combination agree verbatim
// across the interRAI official CHESS scale PDF, the CIHI interRAI LTCF Outcome
// Scales Reference Guide (with a worked example scoring 4/5), and the CIHI
// interRAI Contact Assessment job aid.
//
// This is a PROGNOSTIC ESTIMATE framed as decision support for
// life-expectancy-informed care planning, NOT a prediction of an individual's
// death (spec-v50 §3, spec-v11 §5.3). No AI, no runtime network call.

// Age-band points (JAMA 2006 Table 3). The index is validated for
// community-dwelling older adults; only the published bands are offered.
const LEE_AGE = {
  '60to64': 1,
  '65to69': 2,
  '70to74': 3,
  '75to79': 4,
  '80to84': 5,
  '85plus': 7,
};

const LEE_NOTE = 'Lee 4-Year Mortality Index (Lee SJ, et al, JAMA 2006). A weighted point sum for community-dwelling older adults: age band (60–64 = 1 up to ≥ 85 = 7) + male sex (2) + diabetes (1) + cancer (2) + chronic lung disease (2) + heart failure (2) + current smoking (2) + BMI under 25 (1) + difficulty bathing (2), walking several blocks (2), managing money (2), and pushing/pulling heavy objects (1), total 0–26. The total maps to the validation-cohort 4-year all-cause mortality bands. It estimates life expectancy to inform screening and care-planning decisions; it is not a prediction of an individual’s death.';

function onFlag(v) {
  return v === true || v === 1 || v === '1' || v === 'on';
}

// Point-total -> validation-cohort 4-year mortality band (JAMA 2006 Table 4).
function leeBand(total) {
  if (total <= 5) return { pct: '4%', label: '0–5 points' };
  if (total <= 9) return { pct: '15%', label: '6–9 points' };
  if (total <= 13) return { pct: '42%', label: '10–13 points' };
  return { pct: '64%', label: '≥ 14 points' };
}

export function leeMortalityIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!(o.age in LEE_AGE)) {
    return { valid: false, message: 'Select an age band to compute the Lee 4-year mortality index.' };
  }
  let total = 0;
  const factors = [];
  const agePts = LEE_AGE[o.age];
  total += agePts;
  factors.push(`age (${agePts} pt${agePts > 1 ? 's' : ''})`);
  const add = (flag, pts, label) => {
    if (onFlag(flag)) { total += pts; factors.push(`${label} (${pts})`); }
  };
  add(o.male, 2, 'male sex');
  add(o.diabetes, 1, 'diabetes');
  add(o.cancer, 2, 'cancer');
  add(o.lung, 2, 'chronic lung disease');
  add(o.heartFailure, 2, 'heart failure');
  add(o.smoker, 2, 'current smoker');
  add(o.bmiUnder25, 1, 'BMI < 25');
  add(o.bathing, 2, 'difficulty bathing');
  add(o.walking, 2, 'difficulty walking several blocks');
  add(o.money, 2, 'difficulty managing money');
  add(o.pushing, 1, 'difficulty pushing/pulling heavy objects');

  const band = leeBand(total);
  return {
    valid: true,
    score: total,
    mortality: band.pct,
    // Flag the two higher-mortality bands (>= 10 points -> 42% / 64%).
    abnormal: total >= 10,
    factors,
    band: `Lee index ${total}/26 → 4-year all-cause mortality about ${band.pct} (${band.label}).`,
    note: LEE_NOTE,
  };
}

// --- 2.7 CHESS (interRAI LTCF variant) ---------------------------------------
const CHESS_NOTE = 'interRAI CHESS scale (Changes in Health, End-stage disease, Signs and Symptoms; Hirdes 2003), operationalized per the interRAI Long-Term Care Facility Outcome Scales (CIHI). The signs-and-symptoms items are counted and capped at 2 (none → 0, exactly one → 1, two or more → 2); one point each is then added for a decline in decision-making, a decline in ADL status, and an end-stage-disease (≤ 6-month) prognosis, for a total of 0–5. Higher scores indicate greater health instability and mortality risk. It is a health-instability marker for care planning, not a prediction of an individual’s death.';

export function chessScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  // Signs & symptoms: each present item counts once (the two OR-groups are
  // pre-combined by the renderer into a single item each); the count is then
  // capped at 2 per the interRAI/CIHI rule.
  let symptomCount = 0;
  const symptoms = [];
  const sx = (flag, label) => { if (onFlag(flag)) { symptomCount += 1; symptoms.push(label); } };
  sx(o.vomiting, 'vomiting');
  sx(o.edema, 'peripheral edema');
  sx(o.dyspnea, 'dyspnea');
  sx(o.weightLoss, 'weight loss');
  sx(o.dehydration, 'dehydration / insufficient fluid');
  sx(o.reducedIntake, 'reduced food/fluid intake');
  const symptomScore = symptomCount > 2 ? 2 : symptomCount;

  let total = symptomScore;
  const factors = [];
  if (symptomScore > 0) factors.push(`signs/symptoms ${symptomScore} (${symptoms.join(', ')})`);
  const add = (flag, label) => { if (onFlag(flag)) { total += 1; factors.push(label); } };
  add(o.declineCognition, 'decline in decision-making');
  add(o.declineAdl, 'decline in ADL status');
  add(o.endStage, 'end-stage disease (≤ 6 months)');

  // 2 (symptom cap) + 3 other variables = 5; the score is inherently 0–5.
  const abnormal = total >= 3;
  const label = total === 0 ? 'no health instability'
    : abnormal ? 'substantial health instability'
      : 'some health instability';
  return {
    valid: true,
    score: total,
    abnormal,
    factors,
    band: `CHESS score ${total}/5: ${label} — higher scores indicate greater health instability and mortality risk.`,
    note: CHESS_NOTE,
  };
}
