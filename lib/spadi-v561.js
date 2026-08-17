// spec-v561: the Shoulder Pain and Disability Index (SPADI). "spadi" was zero-hit across corpus.json,
// app.js and lib/meta.js, and `grep -c "id: 'spadi'" app.js` returned 0.
//
// THIRTEEN ITEMS IN TWO SUBSCALES, EACH ITEM 0 TO 10: five pain items and eight disability items.
//
// **THE TOTAL IS THE MEAN OF THE TWO SUBSCALE PERCENTAGES, NOT THE SUM OF ALL THIRTEEN ITEMS OVER 130.**
// The pain subscale is its sum out of 50 as a percentage; the disability subscale is its sum out of 80 as a
// percentage; the total is the average of those two numbers. Summing all thirteen raw items and dividing by
// 130 gives a different and wrong answer, and it is the obvious thing to do -- thirteen items on the same
// 0-10 scale look like one questionnaire.
//
// **THE CONSEQUENCE IS UNEQUAL IMPLICIT ITEM WEIGHTING, WHICH THIS TILE REPORTS.** Five pain items carry
// half the total and eight disability items carry the other half, so a single pain item is worth 1.6 times
// a single disability item. A reader who believes every item counts equally will misread which answers are
// moving the score.
//
// **THE MISSING-DATA RULES DIVERGE BETWEEN SOURCES, SO THIS LIB IMPLEMENTS ONLY THE COMPLETE-DATA PATH.**
// One rendering drops an omitted item from its subscale denominator, requiring at least two thirds of each
// subscale to be answered; another replaces up to two missing values with the subscale mean and voids the
// subscale beyond that. Those two rules are NOT equivalent -- they give different totals on the same form.
// Picking one silently would report a number under an authority it does not have, so this lib requires all
// thirteen items and says in the refusal that the handling of omissions is disputed (spec-v97). A user with
// a genuinely incomplete form is better served by knowing that than by a plausible number.
//
// TWO RESPONSE FORMATS ARE IN CIRCULATION. The 1991 original used a visual analogue scale; the current
// widely reproduced form uses a 0-10 numeric rating scale, which is what this implements. The literature
// treats scores from the two as interchangeable, but the instruments differ, so the format is stated rather
// than assumed.
//
// THE MINIMAL DETECTABLE CHANGE IS A PROPERTY OF A COMPARISON. A change of 13 points at 90 percent
// confidence is the smallest difference between two of the SAME patient's scores that is unlikely to be
// measurement noise. It says nothing about whether a single score is high, so it is exposed as a constant
// and described as applying to a change.
//
// HIGH-STAKES: a patient-reported measure of shoulder pain and function. It does NOT diagnose anything and
// does not distinguish among the causes of shoulder pain, which are managed very differently -- rotator
// cuff disease, adhesive capsulitis, glenohumeral or acromioclavicular arthritis, instability, and referred
// pain from the cervical spine all produce a high score. It does not detect the findings that make a
// shoulder urgent rather than chronic: an acute traumatic tear in a young patient, a suspected dislocation,
// infection, or a mass all need assessment regardless of the score. Because it is entirely self-reported it
// measures neither range of motion nor strength, and it is not an indication for imaging, injection, or
// surgery (spec-v11 section 5.3). The clinical decision stays with the clinician.
//
// ITEMS AND THE SCORING RULE RE-FETCHED, NEVER RECALLED (spec-v97), checked against a permission-bearing
// reproduction of the form and against an independent rendering with matching item order and content. The
// labels below are neutral topic cues for those items, not the authors' question wording:
//   - Roach KE, Budiman-Mak E, Songsiridej N, Lertratanakul Y. Development of a shoulder pain and
//     disability index. Arthritis Care Res. 1991;4(4):143-149.
//   - Williams JW Jr, Holleman DR Jr, Simel DL. Measuring shoulder function with the Shoulder Pain and
//     Disability Index. J Rheumatol. 1995;22(4):727-732.

// Neutral topic labels for the thirteen items. The instrument's verbatim wording is the authors'
// (Roach and colleagues); these are short topic cues, not the questionnaire's questions. Scoring
// is positional and key-based, so shortening the labels cannot change either subscale or the
// total.
export const SPADI_PAIN_ITEMS = [
  { key: 'painWorst', text: 'Pain at its worst' },
  { key: 'painLyingOnSide', text: 'Lying on the involved side' },
  { key: 'painHighShelf', text: 'Reaching to a high shelf' },
  { key: 'painBackOfNeck', text: 'Touching the back of the neck' },
  { key: 'painPushing', text: 'Pushing with the involved arm' },
];

export const SPADI_DISABILITY_ITEMS = [
  { key: 'washHair', text: 'Washing hair' },
  { key: 'washBack', text: 'Washing back' },
  { key: 'pullover', text: 'Putting on a pullover' },
  { key: 'buttonShirt', text: 'Putting on a button-down shirt' },
  { key: 'pants', text: 'Putting on pants' },
  { key: 'highShelf', text: 'Placing an object on a high shelf' },
  { key: 'carryHeavy', text: 'Carrying 10 pounds' },
  { key: 'backPocket', text: 'Reaching a back pocket' },
];

export const SPADI_ITEMS = [
  ...SPADI_PAIN_ITEMS.map((i) => ({ ...i, subscale: 'pain' })),
  ...SPADI_DISABILITY_ITEMS.map((i) => ({ ...i, subscale: 'disability' })),
];

export const PAIN_MAX = 50;        // 5 items x 10
export const DISABILITY_MAX = 80;  // 8 items x 10
export const ITEM_MAX = 10;
export const SPADI_MDC = 13;       // 90 percent confidence, applies to a CHANGE

export const PAIN_ANCHORS = 'No pain at all (0) to worst pain imaginable (10).';
export const DISABILITY_ANCHORS = 'No difficulty (0) to so difficult it requires help (10).';

const WEIGHTING_TEXT = 'The total is the MEAN of the two subscale percentages, not the sum of all 13 items over 130. Five pain items therefore carry half the total and eight disability items the other half, so one pain item is worth 1.6 times one disability item.';

const MDC_TEXT = `A minimal detectable change of ${SPADI_MDC} points at 90 percent confidence applies to the DIFFERENCE between two of the same patient's scores, not to a single score. It says nothing about whether one score is high.`;

const FORMAT_TEXT = 'Scored on the 0 to 10 numeric rating scale of the current form. The 1991 original used a visual analogue scale; the literature treats the two as interchangeable, but the instruments differ.';

const MISSING_DATA_TEXT = 'The published rules for handling omitted items DISAGREE: one rendering drops the omitted item from its subscale denominator, while another replaces up to two missing values with the subscale mean. Those rules are not equivalent and give different totals on the same form, so only complete forms are scored here rather than reporting a number under an authority it does not have.';

const NOTE = 'The Shoulder Pain and Disability Index (Roach and colleagues 1991) has 13 items in two subscales, each item rated 0 to 10: five pain items anchored from no pain at all to worst pain imaginable, and eight disability items anchored from no difficulty to so difficult it requires help. The pain subscale is its sum out of 50 expressed as a percentage, the disability subscale is its sum out of 80 as a percentage, and the total is the MEAN of those two percentages rather than the sum of all 13 items over 130, which is the obvious thing to do and gives a different, wrong answer. The consequence is unequal implicit item weighting: five pain items carry half the total and eight disability items the other half, so a single pain item is worth 1.6 times a single disability item, and a reader who believes every item counts equally will misread which answers are moving the score. The published rules for omitted items disagree, one dropping the omitted item from its subscale denominator and another replacing up to two missing values with the subscale mean; those rules are not equivalent, so only complete forms are scored here. Scores are on the 0 to 10 numeric rating scale of the current form, while the 1991 original used a visual analogue scale, and although the literature treats the two as interchangeable the instruments differ. A minimal detectable change of 13 points at 90 percent confidence applies to the difference between two of the same patient’s scores rather than to a single score. This is a patient-reported measure of shoulder pain and function. It does not diagnose anything and does not distinguish among the causes of shoulder pain, which are managed very differently: rotator cuff disease, adhesive capsulitis, glenohumeral or acromioclavicular arthritis, instability, and pain referred from the cervical spine all produce a high score. It does not detect the findings that make a shoulder urgent rather than chronic, and an acute traumatic tear in a young patient, a suspected dislocation, infection, or a mass all need assessment regardless of the score. Being entirely self-reported it measures neither range of motion nor strength, and it is not an indication for imaging, injection or surgery.';

function readItem(raw) {
  if (raw === '' || raw === null || raw === undefined) return null;
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0 || n > ITEM_MAX) return NaN;
  return n;
}

const pct = (sum, max) => Math.round((sum / max) * 100 * 10) / 10;

// input: one key per item in SPADI_ITEMS, each 0-10. All 13 required.
export function spadi(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const reads = SPADI_ITEMS.map((item) => ({ item, points: readItem(o[item.key]) }));

  const missing = reads.filter((r) => r.points === null);
  if (missing.length) {
    return { valid: false, message: `All 13 items are needed. ${MISSING_DATA_TEXT} Still needed: ${missing.map((r) => r.item.key).join(', ')}.` };
  }
  const bad = reads.filter((r) => Number.isNaN(r.points));
  if (bad.length) {
    return { valid: false, message: `Each item must be a number from 0 to ${ITEM_MAX}. Unrecognized: ${bad.map((r) => r.item.key).join(', ')}.` };
  }

  const painSum = reads.filter((r) => r.item.subscale === 'pain').reduce((a, r) => a + r.points, 0);
  const disabilitySum = reads.filter((r) => r.item.subscale === 'disability').reduce((a, r) => a + r.points, 0);

  const painPercent = pct(painSum, PAIN_MAX);
  const disabilityPercent = pct(disabilitySum, DISABILITY_MAX);
  const total = Math.round(((painPercent + disabilityPercent) / 2) * 10) / 10;

  // The wrong-but-tempting computation, exposed so the difference is visible rather than asserted.
  const naiveTotal = pct(painSum + disabilitySum, PAIN_MAX + DISABILITY_MAX);

  return {
    valid: true,
    total,
    painPercent,
    disabilityPercent,
    painSum,
    disabilitySum,
    naiveTotal,
    mdc: SPADI_MDC,
    bandLabel: `SPADI ${total} percent`,
    bandText: `SPADI ${total} percent: pain ${painPercent} percent, disability ${disabilityPercent} percent. Higher is worse. ${WEIGHTING_TEXT} ${MDC_TEXT} ${FORMAT_TEXT} This is self-reported and measures neither range of motion nor strength; it does not diagnose the cause of shoulder pain.`,
    note: NOTE,
  };
}
