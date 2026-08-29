// spec-v603: the Bauer score and modified Bauer score for survival after surgery for skeletal metastases.
// A CLUSTER-COMPLETION gap: `tokuhashi-revised` and `tomita-score` are both in the catalog and this third
// widely compared member was not. Every slug spelling and filename search returned 0.
//
// **A HIGHER SCORE MEANS A BETTER PROGNOSIS.** This is the opposite of almost every severity score, and the
// published band table proves it rather than merely asserting it: 0 to 1 corresponds to under 6 months and
// 4 to 5 to over 12 months. Every item counts the ABSENCE of something bad or the PRESENCE of a favorable
// histology, so the score is a count of good news. Reading it as a severity scale inverts the answer
// completely. Scores in this family do NOT share a direction, so each must be read on its own terms.
//
// **THE MODIFICATION REMOVED AN ITEM AND ALSO MOVED THE BANDS, AND THE TWO VERSIONS DISAGREE IN EXACTLY TWO
// SITUATIONS -- IN OPPOSITE DIRECTIONS.** The original has five items and bands 0-1, 2-3, 4-5. The
// modification drops pathological fracture, leaving four items and bands 0-1, 2, 3-4. Enumerating all 32
// combinations gives exactly two disagreements:
//   (1) NO pathological fracture and only ONE other favorable factor: the original scores 2 and says over 6
//       months with palliative surgery, while the modification scores 1 and says under 6 months with
//       conservative treatment. THE ORIGINAL IS MORE OPTIMISTIC.
//   (2) A pathological fracture PRESENT and three favorable factors: both score 3, but the original says
//       over 6 months with palliative surgery while the modification says over 12 months with excisional
//       surgery. THE MODIFICATION IS MORE OPTIMISTIC.
// So NEITHER VERSION IS SYSTEMATICALLY MORE OPTIMISTIC -- the disagreement runs both ways, and both cases are
// management-changing. This lib computes both scores and flags either case.
//
// **TWO OF THE ITEMS ARE BOTH ABOUT THE PRIMARY TUMOUR, SO HISTOLOGY CARRIES TWO POINTS.** "Not lung cancer"
// and "primary is breast, kidney, lymphoma or myeloma" are separate points that overlap: a breast primary
// scores BOTH, a colon primary scores only the not-lung point, and a lung primary scores neither. Histology
// therefore contributes 0, 1 or 2 points -- two of five in the original and TWO OF FOUR, half the scale, in
// the modification.
//
// **THE ITEM THE MODIFICATION DROPPED WAS DROPPED FOR A REASON.** Pathological fracture was found to predict
// worse survival in the EXTREMITY group only, not in the spine, which is why it was removed. So the original
// is not simply the fuller score: the two are tuned to different anatomy.
//
// HIGH-STAKES: this is a group-level SURVIVAL estimate used historically to decide how extensive an
// operation to offer. It does NOT decide whether to operate, does not choose between conservative,
// palliative and excisional surgery on its own -- the bands describe what was DONE in the derivation cohorts,
// not what should be done -- and it does not account for modern systemic therapy, which has changed survival
// in several of the very histologies it rewards. A low score is not a reason to withhold an operation that
// would relieve pain or restore stability (spec-v11 section 5.3).
//
// ITEMS AND BANDS RE-FETCHED AND DOUBLE-CONFIRMED ACROSS TWO INDEPENDENT SOURCES, NEVER RECALLED
// (spec-v97):
//   - Bauer HC, Wedin R. Survival after surgery for spinal and extremity metastases. Prognostication in 241
//     patients. Acta Orthop Scand. 1995;66(2):143-146.
//   - Leithner A, Radl R, Gruber G, et al. Predictive value of seven preoperative prognostic scoring systems
//     for spinal metastases. Eur Spine J. 2008;17(11):1488-1495 (the modification).

export const ORIGINAL_MAX = 5;
export const MODIFIED_MAX = 4;
// The two enumerated disagreement cases, verified exhaustively over all 32 item combinations.
export const DISAGREEMENT_CASES = [
  { originalTotal: 2, modifiedTotal: 1, fractureAbsent: true, moreOptimistic: 'original' },
  { originalTotal: 3, modifiedTotal: 3, fractureAbsent: false, moreOptimistic: 'modification' },
];

// Every item scores 1 for the FAVOURABLE state. `inModified` marks which survive the modification.
export const ITEMS = [
  { key: 'noVisceralMetastases', text: 'No visceral metastases', inModified: true, aboutPrimary: false },
  { key: 'solitarySkeletalMetastasis', text: 'A solitary skeletal metastasis', inModified: true, aboutPrimary: false },
  { key: 'notLungCancer', text: 'The primary is NOT lung cancer', inModified: true, aboutPrimary: true },
  { key: 'favorablePrimary', text: 'The primary is breast, kidney, lymphoma or myeloma', inModified: true, aboutPrimary: true },
  { key: 'noPathologicalFracture', text: 'No pathological fracture', inModified: false, aboutPrimary: false },
];

export const ORIGINAL_BANDS = [
  { max: 1, label: '0 to 1', survival: 'under 6 months', strategy: 'conservative treatment' },
  { max: 3, label: '2 to 3', survival: 'over 6 months', strategy: 'palliative surgery' },
  { max: ORIGINAL_MAX, label: '4 to 5', survival: 'over 12 months', strategy: 'excisional surgery' },
];
export const MODIFIED_BANDS = [
  { max: 1, label: '0 to 1', survival: 'under 6 months', strategy: 'conservative treatment' },
  { max: 2, label: '2', survival: 'over 6 months', strategy: 'palliative surgery' },
  { max: MODIFIED_MAX, label: '3 to 4', survival: 'over 12 months', strategy: 'excisional surgery' },
];

export const DIRECTION_NOTE = 'A HIGHER score means a BETTER prognosis. Every item counts the absence of something bad or the presence of a favorable histology, so this is a count of good news, and the published bands prove the direction: 0 to 1 is under 6 months and the top band is over 12 months. Reading it as a severity scale inverts the answer. Scores in this family do not share a direction, so each must be read on its own terms.';
export const DISAGREEMENT_NOTE = 'The modification removed an item AND moved the bands, and across all 32 item combinations the two versions disagree in exactly TWO situations, in OPPOSITE directions. With no pathological fracture and only one other favorable factor the original scores 2 and says palliative surgery while the modification scores 1 and says conservative treatment, so the ORIGINAL is more optimistic. With a fracture present and three favorable factors both score 3, but the original says palliative surgery and the modification says excisional surgery, so the MODIFICATION is more optimistic. Neither version is systematically more optimistic.';
export const HISTOLOGY_NOTE = 'Two of the items are both about the primary tumor and they overlap: a breast primary scores BOTH "not lung cancer" and "favorable primary", a colon primary scores only the not-lung point, and a lung primary scores neither. Histology therefore carries 0, 1 or 2 points - two of five in the original and TWO OF FOUR, half the scale, in the modification.';
export const DROPPED_ITEM_NOTE = 'Pathological fracture was dropped because it predicted worse survival in the EXTREMITY group only, not in the spine. The original is therefore not simply the fuller score; the two are tuned to different anatomy.';

const NOTE = `The Bauer score (Bauer and Wedin 1995) estimates survival after surgery for skeletal metastases from five favorable factors, one point each: no visceral metastases, a solitary skeletal metastasis, a primary that is not lung cancer, a primary that is breast, kidney, lymphoma or myeloma, and no pathological fracture. The modified Bauer score (Leithner and colleagues 2008) drops pathological fracture, leaving four. A HIGHER score means a BETTER prognosis, which the bands prove: originally 0 to 1 is under 6 months with conservative treatment, 2 to 3 over 6 months with palliative surgery and 4 to 5 over 12 months with excisional surgery, while the modification bands 0 to 1, 2, and 3 to 4 across the same three descriptions. The modification therefore removed an item AND moved the bands, and the two versions disagree at exactly one total: with no pathological fracture and one other favorable factor the original says palliative surgery and the modification says conservative treatment, while with a fracture and three favorable factors the original says palliative surgery and the modification says excisional surgery, so neither version is systematically more optimistic. Two of the items are both about the primary tumor and overlap, so a breast primary scores both the not-lung point and the favorable-primary point while a lung primary scores neither, and histology carries up to two points - half the modified scale. Pathological fracture was dropped because it predicted worse survival in the extremity group only, so the two versions are tuned to different anatomy rather than one being simply fuller. This is a group-level survival estimate used historically to decide how extensive an operation to offer. It does not decide whether to operate, and the strategies attached to the bands describe what was done in the derivation cohorts rather than what should be done. It does not account for modern systemic therapy, which has changed survival in several of the very histologies it rewards. A low score is not a reason to withhold an operation that would relieve pain or restore stability.`;

function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}
const bandFor = (bands, score) => bands.find((b) => score <= b.max);

// input: one key per ITEMS entry, each yes/no for the FAVOURABLE state.
export function bauerScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let read;
  try {
    read = ITEMS.map((i) => ({ i, v: readBool(o[i.key], i.text) }));
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = read.filter((x) => x.v === null).map((x) => x.i.key);
  if (missing.length) {
    return { valid: false, message: `Answer every item. Still needed: ${missing.join(', ')}. Each item scores 1 for the FAVORABLE state - a higher score means a BETTER prognosis.` };
  }

  const original = read.filter((x) => x.v).length;
  const modified = read.filter((x) => x.v && x.i.inModified).length;
  const originalBand = bandFor(ORIGINAL_BANDS, original);
  const modifiedBand = bandFor(MODIFIED_BANDS, modified);
  const versionsDisagree = originalBand.strategy !== modifiedBand.strategy;
  const histologyPoints = read.filter((x) => x.v && x.i.aboutPrimary).length;

  const parts = [];
  parts.push(`Bauer ${original} of ${ORIGINAL_MAX}; modified Bauer ${modified} of ${MODIFIED_MAX}.`);
  parts.push(`Original band ${originalBand.label}: ${originalBand.survival}, ${originalBand.strategy} in the derivation cohort. Modified band ${modifiedBand.label}: ${modifiedBand.survival}, ${modifiedBand.strategy}.`);
  if (versionsDisagree) {
    parts.push(`THE TWO VERSIONS DISAGREE FOR THIS PATIENT: ${originalBand.survival} and ${originalBand.strategy} by the original against ${modifiedBand.survival} and ${modifiedBand.strategy} by the modification. ${DISAGREEMENT_NOTE}`);
  } else {
    parts.push(DISAGREEMENT_NOTE);
  }
  parts.push(DIRECTION_NOTE);
  parts.push(`Histology contributed ${histologyPoints} of the ${histologyPoints === 1 ? 'two available points' : 'two available points'} through the two overlapping primary-tumor items. ${HISTOLOGY_NOTE}`);
  parts.push(DROPPED_ITEM_NOTE);
  parts.push('This is a group-level survival estimate. It does not decide whether to operate; the strategies attached to the bands describe what was done in the derivation cohorts, not what should be done. It does not account for modern systemic therapy, and a low score is not a reason to withhold an operation that would relieve pain or restore stability.');

  return {
    valid: true,
    original,
    modified,
    originalMax: ORIGINAL_MAX,
    modifiedMax: MODIFIED_MAX,
    originalBand: originalBand.label,
    modifiedBand: modifiedBand.label,
    originalSurvival: originalBand.survival,
    modifiedSurvival: modifiedBand.survival,
    originalStrategy: originalBand.strategy,
    modifiedStrategy: modifiedBand.strategy,
    versionsDisagree,
    histologyPoints,
    band: `Bauer ${original} / modified ${modified}`,
    bandLabel: `Bauer ${original} of ${ORIGINAL_MAX}, modified ${modified} of ${MODIFIED_MAX}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
