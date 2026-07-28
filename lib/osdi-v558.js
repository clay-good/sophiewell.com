// spec-v558: the Ocular Surface Disease Index (OSDI). WHOLE-CONCEPT GAP: "osdi", "dry-eye",
// "surface-disease" and "meibomian" were all zero-hit across corpus.json, app.js and lib/meta.js. The
// catalog had no dry-eye content of any kind, and no tear-production test either -- which matters, because
// tear production and symptoms correlate famously poorly and are opposite axes on the same disease.
//
// TWELVE ITEMS IN THREE SECTIONS, EACH 0-4, OVER THE LAST WEEK. OSDI = (sum of scores) x 25 / (number of
// questions answered).
//
// **THE DENOMINATOR IS VARIABLE, SO THE SCORE IS GENERALLY NOT AN INTEGER.** Questions answered "not
// applicable" are excluded from BOTH the numerator and the denominator. Twelve questions answered with a
// sum of 5 gives 5 x 25 / 12 = 10.4166..., and the instrument's own printed grid shows exactly these
// fractional values. A tile that divided by a fixed 12, or rounded to an integer, would report a different
// number from the instrument for most patients.
//
// **BECAUSE THE SCORE IS FRACTIONAL, THE COMMONLY QUOTED INTEGER BANDS LEAVE REAL GAPS, AND THIS LIB USES
// THE INTERVAL FORM.** The bands circulate two ways: as half-open intervals (0 to under 13 normal, 13 to
// under 23 mild, 23 to under 33 moderate, 33 and above severe) and as integer ranges (0-12, 13-22, 23-32,
// 33 and above). Under the integer rendering a score of 12.5 or 22.7 falls in NO band -- and those scores
// are ordinary, not contrived. The two renderings agree wherever both are defined, so this is not a source
// disagreement to be disclosed but a rendering that is simply unusable for a fractional score. This lib
// implements the half-open intervals. That is the single most important implementation decision here.
//
// **ONLY ITEMS 6 TO 12 OFFER "NOT APPLICABLE". ITEMS 1 TO 5 DO NOT.** The first section asks what the
// patient has experienced, which is always answerable; the later sections ask about limitation in specific
// activities and discomfort in specific situations, which may genuinely not apply -- a patient who does not
// drive cannot answer about driving at night. Allowing N/A on items 1 to 5 would let a patient be scored on
// fewer than five questions and would shrink the denominator in a way the instrument does not permit. This
// lib requires items 1 to 5, which also makes division by zero structurally impossible: the denominator can
// never fall below 5.
//
// A PATIENT WHO MARKS EVERY OPTIONAL ITEM "NOT APPLICABLE" IS SCORED ON FIVE QUESTIONS, and a maximum sum
// of 20 then still gives 20 x 25 / 5 = 100. The scale reaches its ceiling on any number of answered
// questions, which is the point of the variable denominator.
//
// HIGH-STAKES: a SYMPTOM questionnaire. It does NOT diagnose dry eye disease, which requires symptoms
// TOGETHER with an objective sign -- tear break-up time, osmolarity, or ocular surface staining -- and
// symptoms and signs are well known to correlate poorly, so a high OSDI with a normal examination and a low
// OSDI with marked staining are both common and both real. Several items ask about BLURRED AND POOR VISION,
// which are not specific to the ocular surface at all and move with refractive error, cataract and retinal
// disease. It does not identify the causes of an irritable eye that need different management, including
// blepharitis, allergy, medication toxicity and contact lens problems, and it does not detect the red flags
// that make an eye urgent -- pain with photophobia, vision loss, or a red eye with discharge all need
// examination regardless of the score. It does not select treatment (spec-v11 section 5.3). The clinical
// decision stays with the clinician.
//
// ITEMS, RESPONSE ANCHORS AND THE FORMULA RE-FETCHED, NEVER RECALLED (spec-v97), transcribed from the
// copyright-bearing instrument, with the formula and the 0-100 range independently confirmed by a national
// data-element registry:
//   - Schiffman RM, Christianson MD, Jacobsen G, Hirsch JD, Reis BL. Reliability and validity of the Ocular
//     Surface Disease Index. Arch Ophthalmol. 2000;118(5):615-621. Instrument copyright 1995, Allergan.
//   - An independent common-data-element definition restating the formula and range verbatim.
//   NOTE: the instrument itself encodes its severity bands GRAPHICALLY and prints no numeric cut points;
//   the numeric bands come from the secondary literature and are labeled as such in the result.

export const OSDI_SECTIONS = [
  {
    key: 'symptoms',
    stem: 'Have you experienced any of the following during the last week?',
    allowsNotApplicable: false,
    items: [
      { key: 'q1', text: 'Eyes that are sensitive to light?' },
      { key: 'q2', text: 'Eyes that feel gritty?' },
      { key: 'q3', text: 'Painful or sore eyes?' },
      { key: 'q4', text: 'Blurred vision?' },
      { key: 'q5', text: 'Poor vision?' },
    ],
  },
  {
    key: 'function',
    stem: 'Have problems with your eyes limited you in performing any of the following during the last week?',
    allowsNotApplicable: true,
    items: [
      { key: 'q6', text: 'Reading?' },
      { key: 'q7', text: 'Driving at night?' },
      { key: 'q8', text: 'Working with a computer or bank machine (ATM)?' },
      { key: 'q9', text: 'Watching TV?' },
    ],
  },
  {
    key: 'environment',
    stem: 'Have your eyes felt uncomfortable in any of the following situations during the last week?',
    allowsNotApplicable: true,
    items: [
      { key: 'q10', text: 'Windy conditions?' },
      { key: 'q11', text: 'Places or areas with low humidity (very dry)?' },
      { key: 'q12', text: 'Areas that are air conditioned?' },
    ],
  },
];

export const OSDI_ITEMS = OSDI_SECTIONS.flatMap((s) =>
  s.items.map((i) => ({ ...i, section: s.key, allowsNotApplicable: s.allowsNotApplicable })));

export const OSDI_OPTIONS = [
  { value: 4, text: 'All of the time' },
  { value: 3, text: 'Most of the time' },
  { value: 2, text: 'Half of the time' },
  { value: 1, text: 'Some of the time' },
  { value: 0, text: 'None of the time' },
];

export const NOT_APPLICABLE = 'na';
export const OSDI_MAX = 100;
export const OSDI_MULTIPLIER = 25;
export const MIN_DENOMINATOR = 5; // items 1-5 cannot be marked not applicable

// Half-open intervals. The integer rendering (0-12, 13-22, 23-32) leaves fractional scores unbanded.
const BANDS = [
  { below: 13, label: 'Normal' },
  { below: 23, label: 'Mild' },
  { below: 33, label: 'Moderate' },
  { below: Infinity, label: 'Severe' },
];

const INTERVAL_TEXT = 'Banded on half-open intervals: normal from 0 to under 13, mild 13 to under 23, moderate 23 to under 33, and severe 33 or above. The integer rendering that also circulates, 0 to 12, 13 to 22 and 23 to 32, leaves a fractional score such as 12.5 or 22.7 in no band at all, and those scores are ordinary here because the denominator varies.';

const BANDS_PROVENANCE = 'The instrument itself encodes its severity bands graphically and prints no numeric cut points; the numeric bands come from the secondary literature.';

const DENOMINATOR_TEXT = 'Questions answered "not applicable" are excluded from BOTH the sum and the count, so the divisor varies and the score is generally not a whole number.';

const NOTE = 'The Ocular Surface Disease Index (Schiffman and colleagues 2000) asks 12 questions in three sections about the last week: symptoms experienced, limitation of activities, and discomfort in particular environments. Each is answered all of the time 4, most of the time 3, half of the time 2, some of the time 1, or none of the time 0. The score is the sum of the answered items multiplied by 25 and divided by the number of questions answered, giving 0 to 100 with higher scores representing greater disability. The denominator is variable because questions answered not applicable are excluded from both the sum and the count, so the score is generally not a whole number: twelve questions answered with a sum of 5 gives 10.4, and the instrument’s own printed grid shows exactly such fractional values. Because the score is fractional, this uses half-open interval bands, normal from 0 to under 13, mild 13 to under 23, moderate 23 to under 33, and severe 33 or above; the integer rendering that also circulates, 0 to 12, 13 to 22 and 23 to 32, leaves scores like 12.5 or 22.7 in no band. The instrument itself encodes its bands graphically and prints no numeric cut points, so the numeric bands come from the secondary literature. Only items 6 to 12 offer a not-applicable answer, because a patient who does not drive genuinely cannot answer about driving at night, while the first five items ask what the patient has experienced and are always answerable; the denominator therefore never falls below 5 and division by zero cannot occur. A patient who marks every optional item not applicable is scored on five questions, and a maximum sum of 20 still gives 100. This is a symptom questionnaire. It does not diagnose dry eye disease, which requires symptoms together with an objective sign such as tear break-up time, osmolarity or ocular surface staining, and symptoms and signs correlate poorly, so a high score with a normal examination and a low score with marked staining are both common and both real. Several items ask about blurred and poor vision, which are not specific to the ocular surface and move with refractive error, cataract and retinal disease. It does not identify the causes of an irritable eye that need different management, including blepharitis, allergy, medication toxicity and contact lens problems, and it does not detect the red flags that make an eye urgent: pain with photophobia, vision loss, or a red eye with discharge all need examination regardless of the score. It does not select treatment.';

function readItem(item, raw) {
  if (raw === '' || raw === null || raw === undefined) return { state: 'missing' };
  const s = String(raw).trim().toLowerCase();
  if (s === NOT_APPLICABLE || s === 'n/a') {
    if (!item.allowsNotApplicable) return { state: 'na-not-allowed' };
    return { state: 'na' };
  }
  const n = Number(s);
  if (!Number.isInteger(n) || n < 0 || n > 4) return { state: 'bad' };
  return { state: 'answered', points: n };
}

// input: one key per item (q1..q12), each 0-4, or 'na' for items 6-12 only.
export function osdi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const reads = OSDI_ITEMS.map((item) => ({ item, read: readItem(item, o[item.key]) }));

  const naNotAllowed = reads.filter((r) => r.read.state === 'na-not-allowed');
  if (naNotAllowed.length) {
    return { valid: false, message: `Items 1 to 5 ask what you have experienced and cannot be answered "not applicable". Only items 6 to 12 offer it. Reconsider: ${naNotAllowed.map((r) => r.item.key).join(', ')}.` };
  }
  const missing = reads.filter((r) => r.read.state === 'missing');
  if (missing.length) {
    return { valid: false, message: `Answer every item from 0 to 4, using "not applicable" only on items 6 to 12. Still needed: ${missing.map((r) => r.item.key).join(', ')}.` };
  }
  const bad = reads.filter((r) => r.read.state === 'bad');
  if (bad.length) {
    return { valid: false, message: `Each item must be a whole number from 0 to 4, or "na" on items 6 to 12. Unrecognized: ${bad.map((r) => r.item.key).join(', ')}.` };
  }

  const answered = reads.filter((r) => r.read.state === 'answered');
  const notApplicable = reads.filter((r) => r.read.state === 'na').map((r) => r.item.key);

  const sum = answered.reduce((a, r) => a + r.read.points, 0);
  const count = answered.length;
  const raw = (sum * OSDI_MULTIPLIER) / count;
  const total = Math.round(raw * 10) / 10;

  const band = BANDS.find((b) => total < b.below);

  return {
    valid: true,
    total,
    max: OSDI_MAX,
    sum,
    questionsAnswered: count,
    notApplicable,
    band: band.label,
    bandLabel: `OSDI ${total} of ${OSDI_MAX}, ${band.label.toLowerCase()}`,
    bandText: `OSDI ${total} of ${OSDI_MAX}: ${band.label.toLowerCase()}. Computed as a sum of ${sum} times ${OSDI_MULTIPLIER}, divided by the ${count} questions answered. ${DENOMINATOR_TEXT} ${INTERVAL_TEXT} ${BANDS_PROVENANCE} Higher scores represent greater disability. This is a symptom questionnaire and does not diagnose dry eye disease, which needs an objective sign as well.`,
    note: NOTE,
  };
}
