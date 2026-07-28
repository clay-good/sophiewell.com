// spec-v568: the Cleveland Clinic (Thakar) score for acute renal failure after cardiac surgery. "thakar"
// was zero-hit across corpus.json, app.js and lib/meta.js, and both `grep -c "id: 'thakar-aki'" app.js` and
// `grep -c "id: 'cleveland-clinic-aki'" app.js` returned 0.
//
// **THE OUTCOME IS ACUTE RENAL FAILURE REQUIRING DIALYSIS, NOT KDIGO ACUTE KIDNEY INJURY, AND THAT
// DISTINCTION IS WHERE MOST OF THE CONFUSION ABOUT THIS SCORE COMES FROM.** Dialysis-requiring failure is a
// far rarer and far more severe endpoint than any-stage AKI, which is common after cardiac surgery. Studies
// revalidating this score against any-stage AKI are measuring something else, and a reader who takes the
// risk figures as "chance of AKI" will overestimate the severity of what is predicted by a wide margin.
//
// **THE PUBLISHED RISK CATEGORIES STOP AT 13 WHILE THE SCORE RUNS TO 17, SO SCORES OF 14 TO 17 ARE
// REACHABLE AND UNCLASSIFIED.** The four categories are 0-2, 3-5, 6-8 and 9-13. A patient can score 17 --
// every risk factor, the highest surgery type and the highest creatinine band -- and fall outside the
// published table entirely. This lib returns `bandAssigned: false` above 13 rather than stretching the top
// category, because extending a band that the source closed is inventing a risk estimate for patients the
// derivation did not describe.
//
// **THE EXACT RISK PERCENTAGES ARE DELIBERATELY NOT REPORTED.** Independent secondary sources disagree on
// them: one gives the 6-8 band as a range of 7.8 to 9.5 percent and the 9-13 band as 21.5 percent, another
// gives 9.5 and 21.3 percent, and the original abstract describes the test-set frequency as spanning 0.5 to
// 22.1 percent. These are probably test-set against validation-set figures, but the primary table is
// paywalled and could not be fetched to adjudicate, so no percentage is quoted (spec-v97). The score and
// the four band BOUNDARIES are consistent across sources and are reported.
//
// **SURGERY TYPE IS COUNTER-INTUITIVE AND MUST NOT BE RATIONALIZED.** Isolated coronary artery bypass
// grafting, the commonest operation, scores 0. "Other cardiac surgery" scores 2 -- the SAME as the far more
// invasive combined bypass and valve procedure. An implementer who orders these by apparent invasiveness
// will get "other" wrong, so this lib carries the published weights and states the oddity.
//
// **CREATININE IS A STEPPED TERM THAT JUMPS FROM 2 TO 5 ACROSS ONE THRESHOLD.** Below 1.2 mg/dL scores 0,
// 1.2 to under 2.1 scores 2, and 2.1 or above scores 5. That single step of 3 points is larger than any
// other item on the form, so 0.1 mg/dL of creatinine drift near the upper threshold can move a patient two
// risk bands. It is stepped, never interpolated.
//
// EVERY INPUT IS PREOPERATIVE EXCEPT THE SURGERY TYPE. "Emergency surgery" and "previous cardiac surgery"
// are separate items and can both apply to the same patient.
//
// HIGH-STAKES: a PREOPERATIVE risk estimate for one specific postoperative complication. It does NOT
// diagnose kidney disease, does not measure current kidney function beyond the single creatinine it takes
// as an input, and does not predict any other outcome -- not mortality, not length of stay, not
// non-dialysis AKI. It is not an indication to cancel or defer an operation, and it does not select
// perioperative management, fluid strategy, or nephroprotective measures (spec-v11 section 5.3). The
// surgical and perioperative decisions stay with the clinical team.
//
// WEIGHTS AND BAND BOUNDARIES RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from two independent
// secondary reproductions of the derivation table that agree on every weight, with the maximum verified
// arithmetically:
//   - Thakar CV, Arrigain S, Worley S, Yared JP, Paganini EP. A clinical score to predict acute renal
//     failure after cardiac surgery. J Am Soc Nephrol. 2005;16(1):162-168.

export const THAKAR_FACTORS = [
  { key: 'female', points: 1, text: 'Female' },
  { key: 'congestiveHeartFailure', points: 1, text: 'Congestive heart failure' },
  { key: 'lvefUnder35', points: 1, text: 'Left ventricular ejection fraction under 35 percent' },
  { key: 'preoperativeIabp', points: 2, text: 'Preoperative intra-aortic balloon pump' },
  { key: 'copd', points: 1, text: 'Chronic obstructive pulmonary disease' },
  { key: 'insulinDiabetes', points: 1, text: 'Diabetes requiring insulin' },
  { key: 'previousCardiacSurgery', points: 1, text: 'Previous cardiac surgery' },
  { key: 'emergencySurgery', points: 2, text: 'Emergency surgery' },
];

// Note the ordering: "other" equals "CABG plus valve", and isolated CABG scores nothing.
export const SURGERY_TYPES = [
  { value: 'cabg', points: 0, text: 'Coronary artery bypass grafting only' },
  { value: 'valve', points: 1, text: 'Valve only' },
  { value: 'cabg-valve', points: 2, text: 'CABG plus valve' },
  { value: 'other', points: 2, text: 'Other cardiac surgery' },
];

export const CREATININE_BANDS = [
  { below: 1.2, points: 0, text: 'Under 1.2 mg/dL' },
  { below: 2.1, points: 2, text: '1.2 to under 2.1 mg/dL' },
  { below: Infinity, points: 5, text: '2.1 mg/dL or above' },
];

export const THAKAR_MAX = 17;
export const HIGHEST_PUBLISHED_SCORE = 13;

const BANDS = [
  { max: 2, label: 'Category 1 (score 0 to 2)' },
  { max: 5, label: 'Category 2 (score 3 to 5)' },
  { max: 8, label: 'Category 3 (score 6 to 8)' },
  { max: HIGHEST_PUBLISHED_SCORE, label: 'Category 4 (score 9 to 13)' },
];

const OUTCOME_TEXT = 'The predicted outcome is acute renal failure REQUIRING DIALYSIS, not KDIGO acute kidney injury. Dialysis-requiring failure is far rarer and far more severe than any-stage AKI, and studies revalidating this score against any-stage AKI are measuring something else.';

const UNBANDED_TEXT = `This score is above ${HIGHEST_PUBLISHED_SCORE}, and the published risk categories STOP at ${HIGHEST_PUBLISHED_SCORE} while the score runs to ${THAKAR_MAX}. Scores of ${HIGHEST_PUBLISHED_SCORE + 1} to ${THAKAR_MAX} are reachable and fall outside the published table, so no category is assigned. Extending the top band would invent a risk estimate for patients the derivation did not describe.`;

const RATES_WITHHELD = 'The exact risk percentages are NOT reported here. Independent secondary sources disagree on them, probably because some quote the test set and others the validation set, and the primary table is paywalled and could not be fetched to adjudicate. The score and the four band boundaries are consistent across sources; the percentages are not.';

const SURGERY_ODDITY = 'Surgery type is counter-intuitive: isolated coronary artery bypass grafting, the commonest operation, scores 0, while "other cardiac surgery" scores 2, the same as the far more invasive combined bypass and valve procedure. The weights are the published ones and are not ordered by apparent invasiveness.';

const CREATININE_ODDITY = 'Creatinine is a stepped term that jumps from 2 to 5 points across one threshold, a step larger than any other item, so a small change near 2.1 mg/dL can move a patient two risk bands. It is never interpolated.';

const NOTE = 'The Cleveland Clinic score (Thakar and colleagues 2005) estimates the preoperative risk of acute renal failure requiring dialysis after cardiac surgery, from a maximum of 17 points. The weights are female 1, congestive heart failure 1, ejection fraction under 35 percent 1, preoperative intra-aortic balloon pump 2, chronic obstructive pulmonary disease 1, insulin-requiring diabetes 1, previous cardiac surgery 1, emergency surgery 2, surgery type from 0 for isolated bypass grafting through 1 for valve only to 2 for bypass with valve or for other cardiac surgery, and preoperative creatinine from 0 below 1.2 mg/dL through 2 for 1.2 to under 2.1 to 5 at 2.1 or above. The predicted outcome is acute renal failure requiring dialysis, not KDIGO acute kidney injury, which is a far commoner and much less severe endpoint, and that distinction is where most confusion about this score arises. The published risk categories are 0 to 2, 3 to 5, 6 to 8 and 9 to 13, so scores of 14 to 17 are reachable and fall outside the published table entirely, and no category is assigned to them here rather than stretching the top band and inventing a risk estimate for patients the derivation did not describe. The exact risk percentages are not reported, because independent secondary sources disagree on them, probably quoting test-set against validation-set figures, and the primary table is paywalled and could not be fetched to adjudicate; the score itself and the band boundaries are consistent across sources. Surgery type is counter-intuitive, since isolated bypass grafting scores nothing while other cardiac surgery scores the same as the far more invasive combined bypass and valve procedure, so the weights must not be reordered by apparent invasiveness. Creatinine is stepped rather than linear and jumps from 2 to 5 points across one threshold, a step larger than any other item, so a small change near 2.1 mg/dL can move a patient two risk bands. Every input is preoperative except the surgery type, and emergency surgery and previous cardiac surgery are separate items that can both apply. This is a preoperative risk estimate for one specific postoperative complication. It does not diagnose kidney disease, does not measure current kidney function beyond the single creatinine it takes as an input, and does not predict any other outcome, including mortality, length of stay, or non-dialysis acute kidney injury. It is not an indication to cancel or defer an operation, and it does not select perioperative management, fluid strategy, or nephroprotective measures.';

function readBool(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (v === true || v === 1) return true;
  if (v === false || v === 0) return false;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', '1', 'true'].includes(s)) return true;
  if (['no', 'n', '0', 'false'].includes(s)) return false;
  return NaN;
}

export function thakarAki(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const read = THAKAR_FACTORS.map((f) => ({ f, value: readBool(o[f.key]) }));
  const missing = read.filter((r) => r.value === null);
  if (missing.length) {
    return { valid: false, message: `Answer every risk factor. Still needed: ${missing.map((r) => r.f.key).join(', ')}.` };
  }
  const bad = read.filter((r) => Number.isNaN(r.value));
  if (bad.length) {
    return { valid: false, message: `Each risk factor must be yes or no. Unrecognized: ${bad.map((r) => r.f.key).join(', ')}.` };
  }

  const surgery = SURGERY_TYPES.find((s) => s.value === String(o.surgeryType || '').trim().toLowerCase());
  if (!surgery) {
    return { valid: false, message: `Choose the surgery type: ${SURGERY_TYPES.map((s) => s.value).join(', ')}. Note that "other" scores the same as CABG plus valve, and isolated CABG scores 0.` };
  }

  const rawCreatinine = o.creatinine;
  if (rawCreatinine === '' || rawCreatinine === null || rawCreatinine === undefined) {
    return { valid: false, message: 'Enter the preoperative serum creatinine in mg/dL. It is a stepped term, not interpolated.' };
  }
  const creatinine = Number(String(rawCreatinine).trim());
  if (!Number.isFinite(creatinine) || creatinine < 0 || creatinine > 30) {
    return { valid: false, message: 'Creatinine must be a number in mg/dL between 0 and 30.' };
  }
  const creatinineBand = CREATININE_BANDS.find((b) => creatinine < b.below);

  const factorPoints = read.filter((r) => r.value).reduce((a, r) => a + r.f.points, 0);
  const total = factorPoints + surgery.points + creatinineBand.points;

  const band = BANDS.find((b) => total <= b.max);
  const bandAssigned = Boolean(band);

  return {
    valid: true,
    total,
    max: THAKAR_MAX,
    factorPoints,
    surgeryPoints: surgery.points,
    creatininePoints: creatinineBand.points,
    creatinineBand: creatinineBand.text,
    band: bandAssigned ? band.label : null,
    bandAssigned,
    bandLabel: bandAssigned ? `Thakar score ${total} of ${THAKAR_MAX}, ${band.label.toLowerCase()}` : `Thakar score ${total} of ${THAKAR_MAX}, above the published categories`,
    bandText: `Cleveland Clinic (Thakar) score ${total} of ${THAKAR_MAX}. ${bandAssigned ? `${band.label}.` : UNBANDED_TEXT} ${OUTCOME_TEXT} ${RATES_WITHHELD} ${SURGERY_ODDITY} ${CREATININE_ODDITY} This is a preoperative estimate for one complication and is not an indication to cancel or defer an operation.`,
    note: NOTE,
  };
}
