// spec-v609: the Hijdra sum score for blood burden after subarachnoid hemorrhage. A CLUSTER-COMPLETION gap:
// `fisher-grade`, `modified-fisher` and `ogilvy-carter` are all in the catalog and the quantitative member
// of that family was not. Every slug spelling and filename search returned 0.
//
// (Checked and rejected on the way here: the "Claassen scale" is NOT a separate instrument - it IS the
// modified Fisher scale, which already ships as `modified-fisher`. A second eponym is not a second tile.)
//
// **IT IS A SUM ACROSS 14 SITES, NOT A GRADE.** Fisher and modified Fisher assign one ordinal category to
// the whole scan. This counts blood at ten cisterns and fissures and four ventricles, 0 to 3 each, and adds
// them: cisternal 0 to 30, ventricular 0 to 12, total 0 to 42. It is a continuous burden measure and it has
// NO official severity bands, so this lib returns none.
//
// **THE TWO HALVES USE THE SAME 0-TO-3 RANGE WITH DIFFERENT ANCHOR DEFINITIONS.** In a cistern, 1 is "a
// small amount of blood"; in a ventricle, 1 is specifically "sedimentation of blood in the posterior part".
// A point in one half does not mean what a point in the other half means, and yet they are summed into one
// total. A reader who applies the cisternal wording to the ventricles is scoring a different instrument.
//
// **EIGHT OF THE TEN CISTERNAL SITES ARE PAIRED, SO THERE ARE ONLY SIX NAMED STRUCTURES.** The
// interhemispheric fissure and the quadrigeminal cistern are scored ONCE; the lateral part of the sylvian
// fissure, the basal part of the sylvian fissure, the suprasellar cistern and the ambient cistern are each
// scored TWICE, left and right. Scoring "the sylvian fissure" once instead of twice silently halves four of
// the ten sites. The same applies to the ventricles: the frontal horns are scored left and right, the third
// and fourth once each.
//
// **WHICH SCALE IS BEST DEPENDS ON WHICH OUTCOME.** In a direct comparison the modified Fisher (Claassen)
// scale had the largest area under the curve for VASOSPASM at 0.78, ahead of this score at 0.68 and the
// original Fisher scale at 0.62 - but only this score correlated significantly with radiological DELAYED
// CEREBRAL ISCHEMIA. Vasospasm and delayed cerebral ischemia are not the same endpoint, and the ranking
// flips between them.
//
// **REPORTED THRESHOLDS ARE NOT APPLIED.** Individual studies report a total of 19 or below as a limited
// clot burden and a total of 23 or above as predicting vasospasm. These come from single studies, not from
// the instrument, so they are REPORTED and NOT used to band the result (spec-v97).
//
// HIGH-STAKES: this quantifies blood on the initial CT. It does NOT diagnose subarachnoid hemorrhage, does
// NOT locate or grade an aneurysm, does NOT measure clinical severity - that is what Hunt and Hess and the
// WFNS grade do - and does NOT decide whether or when to treat vasospasm (spec-v11 section 5.3).
//
// SITES, POINT DEFINITIONS AND SUBTOTALS RE-FETCHED AND DOUBLE-CONFIRMED ACROSS INDEPENDENT SOURCES, NEVER
// RECALLED (spec-v97):
//   - Hijdra A, Brouwers PJAM, Vermeulen M, van Gijn J. Grading the amount of blood on computed tomograms
//     after subarachnoid hemorrhage. Stroke. 1990;21(8):1156-1161.

export const CISTERN_LEVELS = [
  { value: 0, text: 'No blood' },
  { value: 1, text: 'Small amount of blood' },
  { value: 2, text: 'Moderately filled with blood' },
  { value: 3, text: 'Completely filled with blood' },
];

// NOT the same wording as the cisterns. Level 1 in particular is a specific finding, not "a small amount".
export const VENTRICLE_LEVELS = [
  { value: 0, text: 'No blood' },
  { value: 1, text: 'Sedimentation of blood in the posterior part' },
  { value: 2, text: 'Partly filled with blood' },
  { value: 3, text: 'Completely filled with blood' },
];

export const CISTERNS = [
  { key: 'interhemispheric', text: 'Interhemispheric fissure', paired: false },
  { key: 'sylvianLateralLeft', text: 'Sylvian fissure, lateral part - left', paired: true },
  { key: 'sylvianLateralRight', text: 'Sylvian fissure, lateral part - right', paired: true },
  { key: 'sylvianBasalLeft', text: 'Sylvian fissure, basal part - left', paired: true },
  { key: 'sylvianBasalRight', text: 'Sylvian fissure, basal part - right', paired: true },
  { key: 'suprasellarLeft', text: 'Suprasellar cistern - left', paired: true },
  { key: 'suprasellarRight', text: 'Suprasellar cistern - right', paired: true },
  { key: 'ambiensLeft', text: 'Ambient cistern - left', paired: true },
  { key: 'ambiensRight', text: 'Ambient cistern - right', paired: true },
  { key: 'quadrigeminal', text: 'Quadrigeminal cistern', paired: false },
];

export const VENTRICLES = [
  { key: 'frontalLeft', text: 'Frontal horn of the lateral ventricle - left', paired: true },
  { key: 'frontalRight', text: 'Frontal horn of the lateral ventricle - right', paired: true },
  { key: 'third', text: 'Third ventricle', paired: false },
  { key: 'fourth', text: 'Fourth ventricle', paired: false },
];

export const CISTERNAL_MAX = CISTERNS.length * 3;   // 30
export const VENTRICULAR_MAX = VENTRICLES.length * 3; // 12
export const TOTAL_MAX = CISTERNAL_MAX + VENTRICULAR_MAX; // 42

export const REPORTED_THRESHOLDS = [
  { value: 19, text: 'A total of 19 or below is widely interpreted as a limited clot burden.' },
  { value: 23, text: 'A total of 23 or above predicted cerebral vasospasm in one series.' },
];

export const SUM_NOTE = `It is a SUM ACROSS ${CISTERNS.length + VENTRICLES.length} SITES, NOT A GRADE: ${CISTERNS.length} cisterns and fissures (0 to ${CISTERNAL_MAX}) plus ${VENTRICLES.length} ventricles (0 to ${VENTRICULAR_MAX}), total 0 to ${TOTAL_MAX}. Fisher and the modified Fisher scale assign ONE ordinal category to the whole scan; this counts blood site by site.`;
export const ANCHOR_NOTE = 'THE TWO HALVES USE THE SAME 0-TO-3 RANGE WITH DIFFERENT ANCHOR DEFINITIONS: in a cistern 1 is "a small amount of blood", but in a ventricle 1 is specifically "sedimentation of blood in the posterior part". A point in one half does not mean what a point in the other means, and they are still summed into one total.';
export const PAIRED_NOTE = `EIGHT OF THE TEN CISTERNAL SITES ARE PAIRED, so there are only SIX named structures: the interhemispheric fissure and the quadrigeminal cistern are scored ONCE, while the lateral and basal parts of the sylvian fissure, the suprasellar cistern and the ambient cistern are each scored TWICE, left and right. Scoring "the sylvian fissure" once instead of twice silently halves four of the ten sites. The frontal horns are likewise left and right, with the third and fourth ventricles once each.`;
export const OUTCOME_NOTE = 'WHICH SCALE IS BEST DEPENDS ON WHICH OUTCOME. In a direct comparison the modified Fisher (Claassen) scale had the largest area under the curve for VASOSPASM at 0.78, ahead of this score at 0.68 and the original Fisher scale at 0.62 - but only this score correlated significantly with radiological DELAYED CEREBRAL ISCHEMIA. The ranking flips between the two endpoints.';
export const NO_BANDS_NOTE = `It has NO official severity bands and none is applied here. Individual studies report thresholds - ${REPORTED_THRESHOLDS.map((t) => t.text).join(' ')} - but those come from single studies rather than from the instrument, so they are reported and not used to band the result.`;

const NOTE = `The Hijdra sum score (Hijdra and colleagues 1990) quantifies blood on the initial CT after subarachnoid hemorrhage. ${SUM_NOTE} ${ANCHOR_NOTE} ${PAIRED_NOTE} ${OUTCOME_NOTE} ${NO_BANDS_NOTE} This quantifies blood. It does not diagnose subarachnoid hemorrhage, does not locate or grade an aneurysm, does not measure clinical severity, which is what the Hunt and Hess and WFNS grades do, and does not decide whether or when to treat vasospasm.`;

function readLevel(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 3) throw new Error(`${name} must be 0, 1, 2 or 3.`);
  return n;
}

// input: one 0-3 value per CISTERNS and VENTRICLES key.
export function hijdraScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const values = {};
  try {
    for (const s of [...CISTERNS, ...VENTRICLES]) values[s.key] = readLevel(o[s.key], s.text);
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = [...CISTERNS, ...VENTRICLES].filter((s) => values[s.key] === null);
  if (missing.length) {
    return { valid: false, message: `Score all ${CISTERNS.length + VENTRICLES.length} sites 0 to 3. ${missing.length} still unscored. ${PAIRED_NOTE}` };
  }

  const cisternal = CISTERNS.reduce((a, s) => a + values[s.key], 0);
  const ventricular = VENTRICLES.reduce((a, s) => a + values[s.key], 0);
  const total = cisternal + ventricular;
  const cisternsWithBlood = CISTERNS.filter((s) => values[s.key] > 0).length;
  const ventriclesWithBlood = VENTRICLES.filter((s) => values[s.key] > 0).length;

  const parts = [];
  parts.push(`Hijdra sum score ${total} of ${TOTAL_MAX}: cisternal ${cisternal} of ${CISTERNAL_MAX} across ${cisternsWithBlood} of ${CISTERNS.length} sites, ventricular ${ventricular} of ${VENTRICULAR_MAX} across ${ventriclesWithBlood} of ${VENTRICLES.length} ventricles.`);
  parts.push(SUM_NOTE);
  parts.push(ANCHOR_NOTE);
  parts.push(PAIRED_NOTE);
  parts.push(OUTCOME_NOTE);
  parts.push(NO_BANDS_NOTE);
  parts.push('This quantifies blood on the initial CT. It does not diagnose subarachnoid hemorrhage, does not locate or grade an aneurysm, does not measure clinical severity, and does not decide whether or when to treat vasospasm.');

  return {
    valid: true,
    total,
    max: TOTAL_MAX,
    cisternal,
    cisternalMax: CISTERNAL_MAX,
    ventricular,
    ventricularMax: VENTRICULAR_MAX,
    cisternsWithBlood,
    ventriclesWithBlood,
    band: null,                 // deliberately: the instrument has no official bands
    bandLabel: `Hijdra sum score ${total} of ${TOTAL_MAX}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
