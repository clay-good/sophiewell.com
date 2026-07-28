// spec-v565: the modified NIH activity and chronicity indices for lupus nephritis (2018 ISN/RPS revision).
// `grep -c "id: 'lupus-nephritis-activity'" app.js` returned 0, `grep -in "nephritis" app.js` returned
// nothing, and there is no lupus test in test/unit. The one "chronicity" hit is incidental prose.
//
// A REVISED-SUCCESSOR GAP. The 2018 revision introduced these indices specifically TO REPLACE the A, A/C
// and C subscripts that the 2003 scheme appended to classes III and IV. A report reading "Class IV-G (A/C)"
// is using the superseded scheme. The indices are what replaced it.
//
// **TWO SEPARATE INDICES THAT ARE NEVER ADDED TOGETHER.** The activity index runs 0 to 24 and the
// chronicity index 0 to 12. They measure opposite things -- what might still respond to treatment against
// what is already scarred -- and a combined "36" would be meaningless. This lib returns them as two
// numbers and never produces a sum.
//
// **ONLY TWO COMPONENTS ARE WEIGHTED, AND ONLY IN THE ACTIVITY INDEX.** Fibrinoid necrosis and cellular or
// fibrocellular crescents are multiplied by 2; every other activity component and EVERY chronicity
// component is multiplied by 1. Six components each scored 0 to 3 would give a maximum of 18, and the
// published maximum is 24 -- the difference is entirely those two doubled terms. The chronicity index is
// wholly unweighted, so its maximum really is 4 times 3.
//
// **TWO DIFFERENT 0-3 RUBRICS COEXIST INSIDE THE SAME TOTAL, AND THEY ARE INCOMMENSURABLE.** Glomerular
// components are scored by the PERCENTAGE OF GLOMERULI affected: 1 under 25 percent, 2 for 25 to 50, 3 for
// over 50. Tubulointerstitial components -- interstitial inflammation, tubular atrophy, interstitial
// fibrosis -- are scored MILD, MODERATE, SEVERE. The numeric range is identical and the meaning is not, so
// a reader who applies a percentage rubric to interstitial fibrosis is answering a different question. This
// lib carries each component's own rubric in its own option labels rather than sharing one list.
//
// **THE DENOMINATOR IS THE GLOMERULI IN THE BIOPSY SAMPLE, SO AN INADEQUATE BIOPSY CAN ONLY LOWER THE
// SCORE.** The percentages are of the glomeruli the core actually captured. A biopsy with few glomeruli
// cannot produce a high glomerular score, and the resulting low activity index reflects sampling rather
// than disease. The result says so, because this failure mode is silent.
//
// **THE 2018 AND 1984 INDICES ARE NOT INTERCONVERTIBLE, AND THE REASON IS SPECIFIC.** Karyorrhexis was
// SEPARATED from fibrinoid necrosis and MERGED with neutrophil infiltration, which the original scored as
// leukocyte exudation. One original component was therefore split and re-glued to another. A score copied
// from an older report is not comparable, and this lib says which version it computes.
//
// A WORDING POINT THAT CHANGES WHAT IS COUNTED: the chronicity component is TOTAL glomerulosclerosis,
// meaning global AND segmental. One secondary source writes "global glomerulosclerosis", which would omit
// segmental lesions and undercount chronicity. The revision's own wording is followed (spec-v97).
//
// HIGH-STAKES: these are HISTOLOGIC indices scored by a renal pathologist on a biopsy. They do NOT diagnose
// lupus or lupus nephritis, do not assign the ISN/RPS class -- which is a separate classification this does
// not compute -- and do not measure kidney function, so they say nothing about proteinuria or the estimated
// glomerular filtration rate. They are not by themselves an indication to start, escalate, or withdraw
// immunosuppression: a high chronicity index in particular is not a reason to withhold treatment, since
// activity and chronicity coexist and the activity is what may still respond (spec-v11 section 5.3). The
// treatment decision stays with the nephrologist and the pathologist.
//
// COMPONENTS, WEIGHTS AND RUBRICS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two independent
// reproductions of the revision's own table that agree on every component, every weight and both maxima:
//   - Bajema IM, Wilhelmus S, Alpers CE, et al. Revision of the International Society of Nephrology/Renal
//     Pathology Society classification for lupus nephritis: clarification of definitions, and modified
//     National Institutes of Health activity and chronicity indices. Kidney Int. 2018;93(4):789-796.

// The two rubrics. Same numeric range, different questions.
export const GLOMERULAR_RUBRIC = [
  { value: 0, text: 'Not present' },
  { value: 1, text: 'Under 25 percent of glomeruli' },
  { value: 2, text: '25 to 50 percent of glomeruli' },
  { value: 3, text: 'Over 50 percent of glomeruli' },
];

export const SEVERITY_RUBRIC = [
  { value: 0, text: 'Not present' },
  { value: 1, text: 'Mild' },
  { value: 2, text: 'Moderate' },
  { value: 3, text: 'Severe' },
];

export const ACTIVITY_COMPONENTS = [
  { key: 'endocapillaryHypercellularity', text: 'Endocapillary hypercellularity', weight: 1, rubric: 'glomerular' },
  { key: 'neutrophilsKaryorrhexis', text: 'Neutrophils and/or karyorrhexis', weight: 1, rubric: 'glomerular' },
  { key: 'fibrinoidNecrosis', text: 'Fibrinoid necrosis', weight: 2, rubric: 'glomerular' },
  { key: 'hyalineDeposits', text: 'Hyaline deposits (wire loops and/or hyaline thrombi)', weight: 1, rubric: 'glomerular' },
  { key: 'cellularCrescents', text: 'Cellular and/or fibrocellular crescents', weight: 2, rubric: 'glomerular' },
  { key: 'interstitialInflammation', text: 'Interstitial inflammation', weight: 1, rubric: 'severity' },
];

export const CHRONICITY_COMPONENTS = [
  { key: 'totalGlomerulosclerosis', text: 'Total glomerulosclerosis (global AND segmental)', weight: 1, rubric: 'glomerular' },
  { key: 'fibrousCrescents', text: 'Fibrous crescents', weight: 1, rubric: 'glomerular' },
  { key: 'tubularAtrophy', text: 'Tubular atrophy', weight: 1, rubric: 'severity' },
  { key: 'interstitialFibrosis', text: 'Interstitial fibrosis', weight: 1, rubric: 'severity' },
];

export const ACTIVITY_MAX = 24;   // (1+1+2+1+2+1) x 3
export const CHRONICITY_MAX = 12; // 4 x 3

export function rubricFor(component) {
  return component.rubric === 'glomerular' ? GLOMERULAR_RUBRIC : SEVERITY_RUBRIC;
}

const WEIGHTING_TEXT = `Only fibrinoid necrosis and cellular or fibrocellular crescents are weighted, at twice, and only within the activity index. Six components each scored 0 to 3 would cap at 18; the published maximum of ${ACTIVITY_MAX} comes entirely from those two doubled terms. The chronicity index is wholly unweighted.`;

const RUBRIC_TEXT = 'Two different 0 to 3 rubrics coexist. Glomerular components are scored by the PERCENTAGE OF GLOMERULI affected, while interstitial inflammation, tubular atrophy and interstitial fibrosis are scored MILD, MODERATE or SEVERE. The numeric range is the same and the meaning is not.';

const DENOMINATOR_TEXT = 'The percentages are of the glomeruli the biopsy core actually captured, so an inadequate sample can only LOWER the glomerular scores. A low activity index on a biopsy with few glomeruli may reflect sampling rather than disease.';

const VERSION_TEXT = 'These are the 2018 modified indices. They are NOT interconvertible with the 1984 original, in which karyorrhexis sat with fibrinoid necrosis rather than with neutrophil infiltration, so a score copied from an older report is not comparable. The 2018 revision also abolished the A, A/C and C subscripts on classes III and IV: a report reading "Class IV-G (A/C)" is using the superseded 2003 scheme, and these indices are what replaced it.';

const NO_SUM_TEXT = 'The two indices are reported separately and are never added together. They measure opposite things, what may still respond to treatment against what is already scarred, so a combined figure would be meaningless.';

const NOTE = 'The modified NIH activity and chronicity indices for lupus nephritis (Bajema and colleagues 2018) were introduced by the ISN/RPS revision specifically to replace the A, A/C and C subscripts that the 2003 scheme appended to classes III and IV, so a report reading Class IV-G (A/C) is using the superseded scheme. The activity index runs 0 to 24 from six components and the chronicity index 0 to 12 from four, each component scored 0 to 3. The two are reported separately and never added together, because they measure opposite things: what may still respond to treatment against what is already scarred. Only two components are weighted, fibrinoid necrosis and cellular or fibrocellular crescents, both at twice, and only within the activity index; six components each scored 0 to 3 would cap at 18, and the published maximum of 24 comes entirely from those two doubled terms, while the chronicity index is wholly unweighted. Two different 0 to 3 rubrics coexist inside the same total and are incommensurable: glomerular components are scored by the percentage of glomeruli affected, under 25 percent scoring 1, 25 to 50 scoring 2 and over 50 scoring 3, while interstitial inflammation, tubular atrophy and interstitial fibrosis are scored mild, moderate or severe. The percentages are of the glomeruli the biopsy core actually captured, so an inadequate sample can only lower the glomerular scores and a low activity index on a biopsy with few glomeruli may reflect sampling rather than disease. The 2018 indices are not interconvertible with the 1984 original, because karyorrhexis was separated from fibrinoid necrosis and merged with neutrophil infiltration, which the original scored as leukocyte exudation, so one original component was split and re-glued to another. The chronicity component is total glomerulosclerosis, meaning global and segmental; a secondary source writing global glomerulosclerosis would omit segmental lesions and undercount chronicity. These are histologic indices scored by a renal pathologist on a biopsy. They do not diagnose lupus or lupus nephritis, do not assign the ISN/RPS class, which is a separate classification, and do not measure kidney function, so they say nothing about proteinuria or the estimated glomerular filtration rate. They are not by themselves an indication to start, escalate or withdraw immunosuppression, and a high chronicity index in particular is not a reason to withhold treatment, since activity and chronicity coexist and the activity is what may still respond.';

function readComponent(component, raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 0 || n > 3) return NaN;
  return n;
}

function scoreSet(components, o) {
  const rows = [];
  for (const component of components) {
    const value = readComponent(component, o[component.key]);
    if (value === null) return { missing: component.key };
    if (Number.isNaN(value)) return { bad: component.key };
    rows.push({
      key: component.key,
      text: component.text,
      rubric: component.rubric,
      raw: value,
      weight: component.weight,
      points: value * component.weight,
    });
  }
  return { rows };
}

// input: one key per component in ACTIVITY_COMPONENTS and CHRONICITY_COMPONENTS, each 0-3. All required.
export function lupusNephritisIndices(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const activity = scoreSet(ACTIVITY_COMPONENTS, o);
  if (activity.missing) {
    return { valid: false, message: `Score every activity component 0 to 3, using each component’s own rubric: glomerular components by percentage of glomeruli, interstitial inflammation by mild, moderate or severe. Still needed: ${activity.missing}.` };
  }
  if (activity.bad) {
    return { valid: false, message: `Each component must be a whole number from 0 to 3. Unrecognized: ${activity.bad}.` };
  }

  const chronicity = scoreSet(CHRONICITY_COMPONENTS, o);
  if (chronicity.missing) {
    return { valid: false, message: `Score every chronicity component 0 to 3. Still needed: ${chronicity.missing}.` };
  }
  if (chronicity.bad) {
    return { valid: false, message: `Each component must be a whole number from 0 to 3. Unrecognized: ${chronicity.bad}.` };
  }

  const activityIndex = activity.rows.reduce((a, r) => a + r.points, 0);
  const chronicityIndex = chronicity.rows.reduce((a, r) => a + r.points, 0);
  const weightedComponents = activity.rows.filter((r) => r.weight === 2 && r.raw > 0).map((r) => r.key);

  return {
    valid: true,
    activityIndex,
    activityMax: ACTIVITY_MAX,
    chronicityIndex,
    chronicityMax: CHRONICITY_MAX,
    activityComponents: activity.rows,
    chronicityComponents: chronicity.rows,
    weightedComponentsPresent: weightedComponents,
    version: '2018 modified NIH indices',
    bandLabel: `Activity ${activityIndex} of ${ACTIVITY_MAX}, chronicity ${chronicityIndex} of ${CHRONICITY_MAX}`,
    bandText: `Modified NIH activity index ${activityIndex} of ${ACTIVITY_MAX} and chronicity index ${chronicityIndex} of ${CHRONICITY_MAX}. ${NO_SUM_TEXT} ${WEIGHTING_TEXT} ${RUBRIC_TEXT} ${DENOMINATOR_TEXT} ${VERSION_TEXT} These are histologic indices: they do not assign the ISN/RPS class, do not measure kidney function, and are not by themselves an indication to start or withdraw immunosuppression.`,
    note: NOTE,
  };
}
