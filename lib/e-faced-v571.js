// spec-v571: the E-FACED score for bronchiectasis. A REVISED-SUCCESSOR GAP: the catalog already has
// `faced-bronchiectasis` and `bronchiectasis-bsi`; E-FACED, the exacerbation-augmented successor to FACED by
// the same authors, was zero-hit and `grep -c "id: 'e-faced'" app.js` returned 0.
//
// **THE SUCCESSOR ANSWERS A DIFFERENT QUESTION FROM ITS PREDECESSOR.** FACED was built to predict MORTALITY;
// E-FACED was built to predict FUTURE EXACERBATIONS. The mortality performance is essentially unchanged
// between them, and the gain is in exacerbation prediction. So this is not simply a better FACED -- choosing
// between them is choosing which outcome you are asking about.
//
// **THE PAPER'S OWN ABSTRACT CONTRADICTS ITS OWN RESULTS SECTION ON THE ADDED ITEM, AND THIS LIB FOLLOWS THE
// BODY.** The abstract says the best cut point was at least TWO EXACERBATIONS in the previous year. The
// results section says the variable chosen was at least ONE HOSPITALIZATION in the previous year, and
// describes building the model and Table 3 around it. Those are different questions: a count of
// any-severity exacerbations against a single severe one. The body describes the actual model construction,
// so it governs, and the discrepancy is stated rather than hidden -- a reader who has only seen the abstract
// will otherwise think this tile has the wrong item (spec-v97). The paper's own methods define a severe
// exacerbation as one the physician considered to require hospitalization.
//
// **THE BANDS DO NOT CARRY OVER FROM FACED, AND A WIDELY COPIED SOURCE GETS THIS WRONG.** FACED runs 0 to 7
// with bands 0-2 mild, 3-4 moderate and 5-7 severe. E-FACED runs 0 to 9 with bands 0-3, 4-6 and 7-9. At
// least one widely reproduced secondary source lists the E-FACED COMPONENTS under the FACED BANDS, which
// would call a score of 5 "severe" when E-FACED calls it moderate. That live error is much of the reason
// this tile exists, and the result says so.
//
// **THE WEIGHTING IS UNEVEN: SIX ITEMS BUT NINE POINTS.** The exacerbation item, FEV1 and age each carry 2
// points, while chronic Pseudomonas colonization, radiological extension and dyspnea each carry 1. A reader
// treating the six items as equal will misjudge which answers move the score.
//
// HIGH-STAKES: this predicts a risk of future exacerbations at a group level. It does NOT diagnose
// bronchiectasis, which is a radiological diagnosis, and does not identify its cause -- and cause matters,
// because cystic fibrosis, immunodeficiency, allergic bronchopulmonary aspergillosis and nontuberculous
// mycobacterial disease all require specific treatment this score knows nothing about. It does not select
// antibiotics, airway clearance, or long-term suppressive therapy, and a high score is not by itself an
// indication for any of them (spec-v11 section 5.3). The clinical decision stays with the clinician.
//
// COMPONENTS, WEIGHTS AND BANDS RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the primary full
// text and an independent reproduction of the component table, with the predecessor's own bands checked
// separately so the difference could be stated:
//   - Martinez-Garcia MA, Athanazio RA, Giron R, et al. Predicting high risk of exacerbations in
//     bronchiectasis: the E-FACED score. Int J Chron Obstruct Pulmon Dis. 2017;12:275-284.

export const E_FACED_ITEMS = [
  {
    key: 'severeExacerbation',
    letter: 'E',
    points: 2,
    text: 'At least one severe exacerbation in the previous year',
    detail: 'The paper defines a severe exacerbation as one the physician considered to require hospitalization.',
  },
  { key: 'fev1Under50', letter: 'F', points: 2, text: 'FEV1 under 50 percent predicted' },
  { key: 'ageAtLeast70', letter: 'A', points: 2, text: 'Age 70 years or over' },
  { key: 'pseudomonas', letter: 'C', points: 1, text: 'Chronic colonization with Pseudomonas aeruginosa' },
  { key: 'extensionOver2Lobes', letter: 'E', points: 1, text: 'Radiological extension involving more than 2 lobes' },
  { key: 'dyspnea3or4', letter: 'D', points: 1, text: 'Dyspnea, mMRC grade 3 or 4' },
];

export const E_FACED_MAX = 9;
export const FACED_MAX = 7;

const BANDS = [
  { max: 3, label: 'Mild bronchiectasis' },
  { max: 6, label: 'Moderate bronchiectasis' },
  { max: E_FACED_MAX, label: 'Severe bronchiectasis' },
];

// The predecessor's bands, carried only so the difference can be stated.
export const FACED_BANDS_TEXT = 'FACED runs 0 to 7 with bands 0-2 mild, 3-4 moderate and 5-7 severe. E-FACED runs 0 to 9 with bands 0-3, 4-6 and 7-9.';

const ABSTRACT_DISCREPANCY = 'The paper’s own abstract and results section disagree about the added item: the abstract says at least TWO EXACERBATIONS in the previous year, while the results section says at least ONE HOSPITALIZATION and builds the model around it. Those are different questions, a count of any-severity exacerbations against a single severe one. The body describes the actual model construction, so it governs here.';

const BANDS_WARNING = `The bands do NOT carry over from FACED. ${FACED_BANDS_TEXT} At least one widely reproduced secondary source lists the E-FACED components under the FACED bands, which would call a score of 5 severe when E-FACED calls it moderate.`;

const WEIGHTING_TEXT = 'The weighting is uneven: six items but nine points. The exacerbation item, FEV1 and age carry 2 points each, while Pseudomonas colonization, radiological extension and dyspnea carry 1 each.';

const OUTCOME_TEXT = 'E-FACED predicts FUTURE EXACERBATIONS, while its predecessor FACED was built to predict MORTALITY. The mortality performance is essentially unchanged between them, so choosing between the two scores is choosing which outcome you are asking about.';

const NOTE = 'The E-FACED score (Martinez-Garcia and colleagues 2017) predicts the risk of future exacerbations in bronchiectasis, and is the exacerbation-augmented successor to FACED by the same authors. Six items give 0 to 9 points: at least one severe exacerbation in the previous year 2, FEV1 under 50 percent predicted 2, age 70 or over 2, chronic Pseudomonas aeruginosa colonization 1, radiological extension beyond 2 lobes 1, and dyspnea at mMRC grade 3 or 4 1. The bands are 0 to 3 mild, 4 to 6 moderate and 7 to 9 severe. The successor answers a different question from its predecessor: FACED was built for mortality and E-FACED for exacerbations, with essentially unchanged mortality performance, so choosing between them is choosing which outcome is being asked about. The paper’s own abstract contradicts its own results section on the added item, the abstract saying at least two exacerbations in the previous year and the results section saying at least one hospitalization and building the model around it; those are different questions, and the body describes the actual model construction, so it governs here while the discrepancy is stated rather than hidden. The paper defines a severe exacerbation as one the physician considered to require hospitalization. The bands do not carry over from FACED, which runs 0 to 7 with bands 0-2, 3-4 and 5-7, and at least one widely reproduced secondary source lists the E-FACED components under the FACED bands, which would call a score of 5 severe when E-FACED calls it moderate. The weighting is uneven, with six items but nine points, since the exacerbation item, FEV1 and age carry 2 points each while Pseudomonas, extension and dyspnea carry 1. This predicts a risk of future exacerbations at a group level. It does not diagnose bronchiectasis, which is a radiological diagnosis, and does not identify its cause, which matters because cystic fibrosis, immunodeficiency, allergic bronchopulmonary aspergillosis and nontuberculous mycobacterial disease all require specific treatment this score knows nothing about. It does not select antibiotics, airway clearance or long-term suppressive therapy, and a high score is not by itself an indication for any of them.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

// input: one key per item in E_FACED_ITEMS, each yes/no. All six required.
export function eFaced(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const read = E_FACED_ITEMS.map((i) => ({ i, value: readBool(o[i.key]) }));
  const missing = read.filter((r) => r.value === null);
  if (missing.length) {
    return { valid: false, message: `Answer every item. Still needed: ${missing.map((r) => r.i.key).join(', ')}.` };
  }
  const bad = read.filter((r) => Number.isNaN(r.value));
  if (bad.length) {
    return { valid: false, message: `Each item must be yes or no. Unrecognized: ${bad.map((r) => r.i.key).join(', ')}.` };
  }

  const total = read.filter((r) => r.value).reduce((a, r) => a + r.i.points, 0);
  const band = BANDS.find((b) => total <= b.max);

  // The score at which the two band tables disagree most visibly.
  const misbandedUnderFaced = total >= 5 && total <= 6;

  return {
    valid: true,
    total,
    max: E_FACED_MAX,
    band: band.label,
    predecessorMax: FACED_MAX,
    bandLabel: `E-FACED ${total} of ${E_FACED_MAX}, ${band.label.toLowerCase()}`,
    bandText: `E-FACED ${total} of ${E_FACED_MAX}: ${band.label.toLowerCase()}. ${OUTCOME_TEXT} ${BANDS_WARNING}${misbandedUnderFaced ? ' This score is in exactly the range where that error shows: FACED bands would call it severe.' : ''} ${WEIGHTING_TEXT} ${ABSTRACT_DISCREPANCY} This predicts exacerbation risk at a group level and does not diagnose bronchiectasis or select treatment.`,
    note: NOTE,
  };
}
