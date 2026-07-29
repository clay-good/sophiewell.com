// spec-v599: the myxedema coma diagnostic score (Popoveniuc and colleagues 2014). An AXIS COMPANION to the
// two thyroid-storm tiles already in the catalog -- `burch-wartofsky` and `jta-thyroid-storm`, the latter
// shipped one wave earlier: those grade the HYPERthyroid emergency, and the HYPOthyroid one had nothing.
// Every slug spelling and filename search returned 0.
//
// **THE DIAGNOSTIC THRESHOLD IS AGREED AT 60 BUT THE MIDDLE BAND'S LOWER EDGE IS NOT.** The widely
// reproduced adapted table gives 25 to 59 as "supportive of the diagnosis" and under 25 as "unlikely"; the
// primary's own abstract gives 45 to 59 as "at risk". A SCORE OF 30 IS THEREFORE "SUPPORTIVE" UNDER ONE
// RENDERING AND "UNLIKELY" UNDER THE OTHER. This lib applies the agreed threshold of 60, reports BOTH
// renderings of the middle band, and flags every score in the 25-to-44 interval where they disagree
// (spec-v97).
//
// **IT WAS DERIVED IN TWENTY-ONE PATIENTS.** Fourteen with myxedema coma and seven controls. The quoted 100
// percent sensitivity and 85.7 percent specificity come from that cohort. Any operating characteristic from
// n = 21 is fragile, and this lib says so rather than quoting the percentages as though they were settled.
//
// **TWO CATEGORIES ARE ADDITIVE SUB-CHECKLISTS AND THE REST ARE SINGLE GRADED PICKS.** Temperature, central
// nervous system effects and gastrointestinal findings are ladders where ONE option is chosen. But the
// cardiovascular category adds a graded bradycardia pick TO five independent items, and every metabolic item
// adds independently. So the cardiovascular category alone can contribute 100 points, more than the whole
// diagnostic threshold, and treating it as a single pick under-scores massively.
//
// **THE THRESHOLD OF 60 IS ONLY ABOUT A QUARTER OF THE MAXIMUM.** The maximum reachable score is 230. "60"
// sounds like a high bar and is not one, which is the opposite of the intuition most readers bring to a
// three-figure scale.
//
// **A PATIENT CAN CROSS 60 ON NON-SPECIFIC DERANGEMENT ALONE.** The five metabolic items -- hyponatremia,
// hypoglycemia, hypoxemia, hypercarbia and a reduced glomerular filtration rate -- total 50 and NONE of them
// is specific to hypothyroidism; they occur in most critically ill patients. Adding any single 10-point item
// crosses the diagnostic threshold. This lib computes how much of the total came from that non-specific
// block and says so when it dominates.
//
// HIGH-STAKES: myxedema coma is a life-threatening emergency, and the score is a DIAGNOSTIC AID for a
// diagnosis that is ultimately clinical. It does NOT treat: it does not select or dose thyroid hormone, does
// not decide the intravenous route, and does not decide on corticosteroids -- and the source's own framing
// is that steroids and thyroid hormone are given TOGETHER, because unrecognized adrenal insufficiency is
// precipitated by giving thyroid hormone alone. FAILING TO REACH THE THRESHOLD DOES NOT EXCLUDE MYXEDEMA
// COMA, and treatment should not wait on a score or on thyroid function tests (spec-v11 section 5.3).
//
// EVERY POINT VALUE RE-FETCHED AND DOUBLE-CONFIRMED CELL-FOR-CELL ACROSS TWO INDEPENDENT REPRODUCTIONS,
// NEVER RECALLED (spec-v97). The two agree on every cell of the table and disagree only on the middle band:
//   - Popoveniuc G, Chandra T, Sud A, et al. A diagnostic scoring system for myxedema coma. Endocr Pract.
//     2014;20(8):808-817.

export const DIAGNOSTIC_THRESHOLD = 60;
export const MIDDLE_BAND_LOW_ADAPTED = 25;   // the widely reproduced adapted table
export const MIDDLE_BAND_LOW_PRIMARY = 45;   // the primary's own abstract

// Single-pick ladders: exactly one option counts.
export const TEMPERATURE_OPTIONS = [
  { value: 'above-35', points: 0, text: 'Above 35 degrees C (above 95 F)' },
  { value: '32-35', points: 10, text: '32 to 35 degrees C (89.6 to 95 F)' },
  { value: 'below-32', points: 20, text: 'Below 32 degrees C (below 89.6 F)' },
];
export const CNS_OPTIONS = [
  { value: 'absent', points: 0, text: 'Absent' },
  { value: 'somnolent', points: 10, text: 'Somnolent or lethargic' },
  { value: 'obtunded', points: 15, text: 'Obtunded' },
  { value: 'stupor', points: 20, text: 'Stupor' },
  { value: 'coma-seizures', points: 30, text: 'Coma or seizures' },
];
export const GI_OPTIONS = [
  { value: 'absent', points: 0, text: 'Absent' },
  { value: 'anorexia', points: 5, text: 'Anorexia, abdominal pain or constipation' },
  { value: 'decreased-motility', points: 15, text: 'Decreased intestinal motility' },
  { value: 'paralytic-ileus', points: 20, text: 'Paralytic ileus' },
];
export const BRADYCARDIA_OPTIONS = [
  { value: 'absent', points: 0, text: 'Absent' },
  { value: '50-59', points: 10, text: 'Heart rate 50 to 59' },
  { value: '40-49', points: 20, text: 'Heart rate 40 to 49' },
  { value: 'below-40', points: 30, text: 'Heart rate below 40' },
];

// Additive sub-checklists: each item adds independently.
export const CARDIOVASCULAR_ITEMS = [
  { key: 'ekgChanges', points: 10, text: 'Other ECG changes (QT prolongation, low voltage, bundle branch block, non-specific ST-T changes, or heart block)' },
  { key: 'effusion', points: 10, text: 'Pericardial or pleural effusion' },
  { key: 'pulmonaryEdema', points: 15, text: 'Pulmonary edema' },
  { key: 'cardiomegaly', points: 15, text: 'Cardiomegaly' },
  { key: 'hypotension', points: 20, text: 'Hypotension' },
];
export const METABOLIC_ITEMS = [
  { key: 'hyponatremia', points: 10, text: 'Hyponatremia' },
  { key: 'hypoglycemia', points: 10, text: 'Hypoglycemia' },
  { key: 'hypoxemia', points: 10, text: 'Hypoxemia' },
  { key: 'hypercarbia', points: 10, text: 'Hypercarbia' },
  { key: 'reducedGfr', points: 10, text: 'Decrease in glomerular filtration rate' },
];
export const PRECIPITATING_EVENT_POINTS = 10;

const maxOf = (list) => Math.max(...list.map((i) => i.points));
const sumOf = (list) => list.reduce((a, i) => a + i.points, 0);

export const MAX_SCORE = maxOf(TEMPERATURE_OPTIONS) + maxOf(CNS_OPTIONS) + maxOf(GI_OPTIONS)
  + PRECIPITATING_EVENT_POINTS + maxOf(BRADYCARDIA_OPTIONS) + sumOf(CARDIOVASCULAR_ITEMS)
  + sumOf(METABOLIC_ITEMS);
export const METABOLIC_BLOCK_MAX = sumOf(METABOLIC_ITEMS);
export const CARDIOVASCULAR_BLOCK_MAX = maxOf(BRADYCARDIA_OPTIONS) + sumOf(CARDIOVASCULAR_ITEMS);

export const BAND_NOTE = `The diagnostic threshold of ${DIAGNOSTIC_THRESHOLD} is agreed, but the middle band's lower edge is NOT: the widely reproduced adapted table gives ${MIDDLE_BAND_LOW_ADAPTED} to 59 as "supportive of the diagnosis" and under ${MIDDLE_BAND_LOW_ADAPTED} as "unlikely", while the primary's own abstract gives ${MIDDLE_BAND_LOW_PRIMARY} to 59 as "at risk". A score of 30 is therefore "supportive" under one rendering and "unlikely" under the other.`;
export const COHORT_NOTE = 'It was derived in TWENTY-ONE patients - fourteen with myxedema coma and seven controls - and the quoted 100 percent sensitivity and 85.7 percent specificity come from that cohort. Any operating characteristic from n = 21 is fragile.';
export const ADDITIVE_NOTE = `Two categories are ADDITIVE SUB-CHECKLISTS and the rest are single graded picks. Temperature, CNS effects and gastrointestinal findings are ladders where ONE option counts. But the cardiovascular category adds a graded bradycardia pick TO five independent items, and every metabolic item adds independently, so the cardiovascular category alone can contribute ${CARDIOVASCULAR_BLOCK_MAX} points - more than the whole diagnostic threshold. Treating either as a single pick under-scores massively.`;
export const SCALE_NOTE = `The threshold of ${DIAGNOSTIC_THRESHOLD} is only about a quarter of the maximum reachable score of ${MAX_SCORE}. It sounds like a high bar and is not one.`;
export const NONSPECIFIC_NOTE = `The five metabolic items total ${METABOLIC_BLOCK_MAX} and NONE of them is specific to hypothyroidism - hyponatremia, hypoglycemia, hypoxemia, hypercarbia and a reduced glomerular filtration rate occur in most critically ill patients. Adding any single 10-point item crosses the diagnostic threshold on non-specific derangement alone.`;

const NOTE = `The myxedema coma diagnostic score (Popoveniuc and colleagues 2014) is a diagnostic aid for the hypothyroid emergency, scoring thermoregulatory dysfunction, central nervous system effects, gastrointestinal findings, a precipitating event, cardiovascular dysfunction and metabolic disturbances. A score of ${DIAGNOSTIC_THRESHOLD} or more is highly suggestive of myxedema coma. The diagnostic threshold is agreed but the middle band's lower edge is not: the widely reproduced adapted table gives ${MIDDLE_BAND_LOW_ADAPTED} to 59 as supportive and under ${MIDDLE_BAND_LOW_ADAPTED} as unlikely, while the primary's own abstract gives ${MIDDLE_BAND_LOW_PRIMARY} to 59 as at risk, so a score of 30 is supportive under one rendering and unlikely under the other; both are reported here. It was derived in twenty-one patients, fourteen with myxedema coma and seven controls, and the quoted 100 percent sensitivity and 85.7 percent specificity come from that cohort, so any operating characteristic from it is fragile. Two categories are additive sub-checklists while the rest are single graded picks: temperature, CNS effects and gastrointestinal findings are ladders where one option counts, but the cardiovascular category adds a graded bradycardia pick to five independent items and every metabolic item adds independently, so the cardiovascular category alone can contribute ${CARDIOVASCULAR_BLOCK_MAX} points, more than the whole threshold. The threshold of ${DIAGNOSTIC_THRESHOLD} is only about a quarter of the maximum of ${MAX_SCORE} and sounds like a higher bar than it is. The five metabolic items total ${METABOLIC_BLOCK_MAX} and none is specific to hypothyroidism, so a patient can cross the threshold on non-specific derangement alone. Myxedema coma is a life-threatening emergency and this is a diagnostic aid for a diagnosis that is ultimately clinical. It does not treat: it does not select or dose thyroid hormone, does not decide the intravenous route, and does not decide on corticosteroids, which the source gives together with thyroid hormone because unrecognized adrenal insufficiency is precipitated by giving thyroid hormone alone. Failing to reach the threshold does not exclude myxedema coma, and treatment should not wait on a score or on thyroid function tests.`;

function pick(list, v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const found = list.find((i) => i.value === String(v).trim());
  if (!found) throw new Error(`${name} must be one of: ${list.map((i) => i.value).join(', ')}.`);
  return found;
}
function readBool(v, name) {
  if (v === '' || v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (['yes', 'y', 'true', '1'].includes(s)) return true;
  if (['no', 'n', 'false', '0'].includes(s)) return false;
  throw new Error(`${name} must be yes or no.`);
}

// input: temperature, cns, gi, bradycardia (single picks); precipitatingEvent plus one key per
// CARDIOVASCULAR_ITEMS and METABOLIC_ITEMS entry (yes/no).
export function myxedemaComa(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let temp, cns, gi, brady, precip, cardio, metabolic;
  try {
    temp = pick(TEMPERATURE_OPTIONS, o.temperature, 'Temperature');
    cns = pick(CNS_OPTIONS, o.cns, 'CNS effects');
    gi = pick(GI_OPTIONS, o.gi, 'Gastrointestinal findings');
    brady = pick(BRADYCARDIA_OPTIONS, o.bradycardia, 'Bradycardia');
    precip = readBool(o.precipitatingEvent, 'Precipitating event');
    cardio = CARDIOVASCULAR_ITEMS.map((i) => ({ i, v: readBool(o[i.key], i.text) }));
    metabolic = METABOLIC_ITEMS.map((i) => ({ i, v: readBool(o[i.key], i.text) }));
  } catch (err) {
    return { valid: false, message: err.message };
  }
  const missing = [];
  for (const [k, v] of [['temperature', temp], ['cns', cns], ['gi', gi], ['bradycardia', brady]]) {
    if (!v) missing.push(k);
  }
  if (precip === null) missing.push('precipitatingEvent');
  missing.push(...cardio.filter((x) => x.v === null).map((x) => x.i.key));
  missing.push(...metabolic.filter((x) => x.v === null).map((x) => x.i.key));
  if (missing.length) {
    return { valid: false, message: `Answer every item. Still needed: ${missing.join(', ')}. The cardiovascular and metabolic items are ADDITIVE - each adds independently, unlike the single-pick ladders.` };
  }

  const cardioPoints = brady.points + cardio.filter((x) => x.v).reduce((a, x) => a + x.i.points, 0);
  const metabolicPoints = metabolic.filter((x) => x.v).reduce((a, x) => a + x.i.points, 0);
  const total = temp.points + cns.points + gi.points + (precip ? PRECIPITATING_EVENT_POINTS : 0)
    + cardioPoints + metabolicPoints;

  const diagnostic = total >= DIAGNOSTIC_THRESHOLD;
  const bandsDisagree = !diagnostic && total >= MIDDLE_BAND_LOW_ADAPTED && total < MIDDLE_BAND_LOW_PRIMARY;
  const nonSpecificShare = total > 0 ? Math.round((metabolicPoints / total) * 100) : 0;

  let band;
  if (diagnostic) band = 'Highly suggestive of myxedema coma';
  else if (total >= MIDDLE_BAND_LOW_PRIMARY) band = 'Supportive / at risk (both renderings agree)';
  else if (total >= MIDDLE_BAND_LOW_ADAPTED) band = 'Renderings disagree - supportive or unlikely';
  else band = 'Myxedema coma unlikely';

  const parts = [];
  parts.push(`Myxedema coma score ${total} of a possible ${MAX_SCORE}: ${diagnostic ? `at or above the diagnostic threshold of ${DIAGNOSTIC_THRESHOLD}, highly suggestive of myxedema coma.` : `below the diagnostic threshold of ${DIAGNOSTIC_THRESHOLD}.`}`);
  parts.push(`Contributions: temperature ${temp.points}, CNS ${cns.points}, gastrointestinal ${gi.points}, precipitating event ${precip ? PRECIPITATING_EVENT_POINTS : 0}, cardiovascular ${cardioPoints}, metabolic ${metabolicPoints}.`);
  if (bandsDisagree) {
    parts.push(`THIS SCORE FALLS WHERE THE PUBLISHED RENDERINGS DISAGREE. At ${total}, the adapted table calls this SUPPORTIVE of the diagnosis and the primary's abstract calls it below its at-risk band. ${BAND_NOTE}`);
  } else {
    parts.push(BAND_NOTE);
  }
  if (metabolicPoints > 0 && nonSpecificShare >= 50) {
    parts.push(`${nonSpecificShare} percent of this total came from the metabolic block, none of which is specific to hypothyroidism. ${NONSPECIFIC_NOTE}`);
  } else {
    parts.push(NONSPECIFIC_NOTE);
  }
  parts.push(ADDITIVE_NOTE);
  parts.push(SCALE_NOTE);
  parts.push(COHORT_NOTE);
  parts.push('This is a diagnostic aid for a diagnosis that is ultimately clinical. It does not select or dose thyroid hormone and does not decide on corticosteroids, which the source gives together with thyroid hormone. FAILING TO REACH THE THRESHOLD DOES NOT EXCLUDE MYXEDEMA COMA, and treatment should not wait on a score or on thyroid function tests.');

  return {
    valid: true,
    total,
    max: MAX_SCORE,
    threshold: DIAGNOSTIC_THRESHOLD,
    diagnostic,
    bandsDisagree,
    categoryPoints: {
      temperature: temp.points, cns: cns.points, gi: gi.points,
      precipitatingEvent: precip ? PRECIPITATING_EVENT_POINTS : 0,
      cardiovascular: cardioPoints, metabolic: metabolicPoints,
    },
    nonSpecificSharePercent: nonSpecificShare,
    band,
    bandLabel: `Myxedema coma score ${total} of ${MAX_SCORE}`,
    bandText: parts.join(' '),
    note: NOTE,
  };
}
