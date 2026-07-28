// spec-v538: the NEOS score (Anti-NMDAR Encephalitis One-Year Functional Status). Zero-hit before this tile:
// "neos", "nmdar", "balu", and "titulaer" across corpus.json, app.js, and lib/meta.js. The `encephalitis`
// hits belong to the Bickerstaff brainstem-encephalitis DIAGNOSTIC criteria tile, which asks whether a
// patient has a particular encephalitis. NEOS assumes the diagnosis is made and predicts the OUTCOME of a
// different disease.
//
// FIVE BINARY PREDICTORS, ONE POINT EACH, TOTAL 0-5:
//   admission to intensive care
//   no treatment started within 4 weeks of symptom onset
//   no clinical improvement 4 weeks after starting treatment (tumor removal or immunotherapy)
//   abnormal MRI
//   CSF white cell count above 20 cells per microlitre
// The outcome predicted is POOR FUNCTIONAL STATUS AT ONE YEAR, defined as a modified Rankin Scale of 3 or
// more.
//
// **THE TILE REPORTS ONLY THE TWO PROBABILITY BANDS THE SOURCE ACTUALLY PUBLISHED, AND SAYS SO.** The
// derivation paper reports a probability of poor one-year status for a score of 0 or 1 and for a score of 4
// or 5, and deliberately pooled the middle because groups of twenty patients or fewer were combined with
// adjacent scores to avoid unstable estimates. Per-score probabilities for 2 and 3 exist only as points on a
// figure and are printed nowhere in the paper or in the validation studies. Figures for those scores do
// circulate; they appear in no primary source, so this tile returns NO probability for a score of 2 or 3 and
// states that the source did not publish one. Inventing the middle of a five-point scale is exactly the kind
// of plausible fabrication a calculator makes easy.
//
// THE "ABNORMAL MRI" PREDICTOR IS DELIBERATELY LOOSE IN THE SOURCE, and the tile does not tighten it. The
// derivation classified an MRI as abnormal on the referring physician's opinion, that is, findings
// consistent with or suggestive of encephalitis. A tile that substituted a specific radiologic criterion
// would be scoring a different variable from the one that was validated, so the field says what the source
// said.
//
// TWO OF THE FIVE PREDICTORS ARE ABOUT TREATMENT TIMING, WHICH IS WHY THE SCORE IS NOT AVAILABLE ON DAY ONE.
// "No treatment within 4 weeks of onset" and "no improvement 4 weeks after starting treatment" both require
// four weeks to have passed. The score is a prognostic instrument for a patient already some way into their
// illness, not an early triage tool, and the tile says so rather than letting a reader assume it can be
// applied at presentation.
//
// HIGH-STAKES: anti-NMDAR encephalitis is a disease in which prolonged, severe illness is COMPATIBLE WITH
// GOOD RECOVERY, and recovery often continues over eighteen to twenty-four months. A high NEOS score
// identifies a group with worse average one-year outcomes; it is not a prediction for the patient in front
// of you and it is emphatically NOT a basis for withdrawing or limiting treatment, which is the decision it
// would most damagingly be misused to support (spec-v11 section 5.3). It does not diagnose anti-NMDAR
// encephalitis, which requires the clinical syndrome plus antibody testing, and it does not select or
// sequence immunotherapy. The care decision stays with the clinician.
//
// PREDICTORS, DEFINITIONS, AND PUBLISHED PROBABILITIES RE-FETCHED, NEVER RECALLED (spec-v97), transcribed
// from the derivation paper and an independent validation cohort that agree on all five predictors:
//   - Balu R, McCracken L, Lancaster E, Graus F, Dalmau J, Titulaer MJ. A score that predicts 1-year
//     functional status in patients with anti-NMDA receptor encephalitis. Neurology. 2019;92(3):e244-e252.
//   - An independent validation cohort reproducing the same five predictors and the same outcome definition.

export const NEOS_PREDICTORS = [
  {
    key: 'icu',
    text: 'Admission to an intensive care unit',
    detail: 'During the current illness.',
  },
  {
    key: 'noEarlyTreatment',
    text: 'No treatment started within 4 weeks of symptom onset',
    detail: 'Requires four weeks to have passed since onset, so the score cannot be computed at presentation.',
  },
  {
    key: 'noImprovement',
    text: 'No clinical improvement 4 weeks after starting treatment (tumor removal or immunotherapy)',
    detail: 'Requires four weeks to have passed since treatment began.',
  },
  {
    key: 'abnormalMri',
    text: 'Abnormal MRI',
    detail: 'The derivation classified an MRI as abnormal on the referring physician’s opinion, meaning findings consistent with or suggestive of encephalitis. That loose definition is what was validated and is kept here deliberately.',
  },
  {
    key: 'csfPleocytosis',
    text: 'CSF white cell count above 20 cells per microlitre',
    detail: 'Strictly above 20.',
  },
];

// Only the bands the paper actually printed. 2 and 3 are deliberately absent.
const PUBLISHED_PROBABILITY = {
  0: '3 percent (published for a score of 0 or 1)',
  1: '3 percent (published for a score of 0 or 1)',
  4: '69 percent (published for a score of 4 or 5)',
  5: '69 percent (published for a score of 4 or 5)',
};

const UNPUBLISHED = 'The source did not publish a probability for this score. It pooled groups of twenty patients or fewer with adjacent scores to avoid unstable estimates, so figures for a score of 2 or 3 appear in no primary source. None is given here.';

const NOTE = 'The NEOS score (Balu and colleagues 2019) predicts poor functional status one year after anti-NMDA receptor encephalitis, defined as a modified Rankin Scale of 3 or more. Five predictors score one point each: admission to intensive care, no treatment started within 4 weeks of symptom onset, no clinical improvement 4 weeks after starting treatment, an abnormal MRI, and a CSF white cell count above 20 cells per microlitre. The source published a probability of poor one-year status only for a score of 0 or 1, at 3 percent, and for a score of 4 or 5, at 69 percent; it pooled groups of twenty patients or fewer with adjacent scores, so no probability was printed for a score of 2 or 3 and none is given here, because the figures that circulate for those scores appear in no primary source. The abnormal-MRI predictor was defined loosely in the derivation, on the referring physician’s opinion of findings consistent with or suggestive of encephalitis, and that loose definition is what was validated, so it is not tightened here. Two predictors concern treatment timing and both require four weeks to have passed, which means the score is a prognostic instrument for a patient already some way into their illness rather than an early triage tool. Anti-NMDA receptor encephalitis is a disease in which prolonged and severe illness is compatible with good recovery, and recovery often continues over eighteen to twenty-four months. A high score identifies a group with worse average one-year outcomes; it is not a prediction for an individual patient and it is not a basis for withdrawing or limiting treatment. It does not diagnose anti-NMDA receptor encephalitis, which requires the clinical syndrome together with antibody testing, and it does not select or sequence immunotherapy.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input: icu, noEarlyTreatment, noImprovement, abnormalMri, csfPleocytosis -- each yes/no.
export function neos(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const read = NEOS_PREDICTORS.map((p) => ({ p, v: readBool(o[p.key]) }));
  const missing = read.filter((r) => r.v === null);
  if (missing.length) {
    return { valid: false, message: `Answer every predictor. Still needed: ${missing.map((r) => r.p.key).join(', ')}.` };
  }
  const bad = read.filter((r) => Number.isNaN(r.v));
  if (bad.length) {
    return { valid: false, message: `Each predictor must be yes or no. Unrecognized: ${bad.map((r) => r.p.key).join(', ')}.` };
  }

  const total = read.filter((r) => r.v).length;
  const published = Object.prototype.hasOwnProperty.call(PUBLISHED_PROBABILITY, total);
  const probability = published ? PUBLISHED_PROBABILITY[total] : null;

  return {
    valid: true,
    total,
    probabilityPublished: published,
    probability,
    bandLabel: `NEOS ${total} of 5`,
    band: `NEOS ${total} of 5. ${published ? `Probability of poor one-year functional status, a modified Rankin Scale of 3 or more: ${probability}.` : UNPUBLISHED} This identifies a group with worse average outcomes, not a prediction for an individual, and it is not a basis for withdrawing or limiting treatment: prolonged severe illness in this disease is compatible with good recovery, often continuing over eighteen to twenty-four months.`,
    note: NOTE,
  };
}
