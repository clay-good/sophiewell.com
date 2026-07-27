// spec-v514: the Young Mania Rating Scale (YMRS), the eleven-item clinician rating of manic severity. Mania
// was a whole-concept gap: "ymrs", "mania", "young mania" were all effectively zero-hit across the corpus and
// app.js.
//
// The scale is a sum, but NOT a uniform one, and that is the error the tile exists to prevent: seven items
// score 0-4 and four items score 0-8. The double-weighted four are irritability, speech, thought content, and
// disruptive-aggressive behavior - the items hardest to rate and the ones that carry twice the weight.
// Total 0-60.
//
// HIGH-STAKES: this sums a clinician's own ratings. It is NOT a diagnosis of bipolar disorder or of a manic
// episode, NOT a capacity assessment, and NOT an indication for admission, involuntary hold, restraint, or
// any medication (spec-v11 section 5.3). The score measures severity at one interview; substance
// intoxication, delirium, and agitated psychosis can all raise it. The original scale defines no severity
// bands - trials commonly treat a total of 12 or less as remission, which is a convention rather than a rule
// the scale itself states. The clinical decision stays with the psychiatry team.
//
// ITEMS AND WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Young RC, Biggs JT, Ziegler VE, Meyer DA. A rating scale for mania: reliability, validity and
//     sensitivity. Br J Psychiatry. 1978;133:429-435.
//   - Psychiatry references reproducing the same eleven items, the same four double-weighted items, and the
//     same 0-60 range.

export const YMRS_ITEMS = [
  { label: 'Elevated mood', max: 4 },
  { label: 'Increased motor activity and energy', max: 4 },
  { label: 'Sexual interest', max: 4 },
  { label: 'Sleep', max: 4 },
  { label: 'Irritability', max: 8 },
  { label: 'Speech (rate and amount)', max: 8 },
  { label: 'Language and thought disorder', max: 4 },
  { label: 'Thought content', max: 8 },
  { label: 'Disruptive or aggressive behavior', max: 8 },
  { label: 'Appearance', max: 4 },
  { label: 'Insight', max: 4 },
];

const MAX_TOTAL = YMRS_ITEMS.reduce((a, item) => a + item.max, 0); // 60
const REMISSION_AT = 12;

const NOTE = 'The Young Mania Rating Scale (Young and colleagues 1978) rates eleven items at one interview, but it does not weight them equally: seven items score 0 to 4 and four items - irritability, speech, thought content, and disruptive or aggressive behavior - score 0 to 8. Total 0 to 60. It sums the ratings a clinician assigns. It is not a diagnosis of bipolar disorder or of a manic episode, not a capacity assessment, and not an indication for admission, an involuntary hold, restraint, or any medication. Substance intoxication, delirium, and agitated psychosis can all raise the score. The original scale defines no severity bands; trials commonly treat a total of 12 or less as remission, which is a convention rather than a rule the scale itself states.';

function readItem(v, max) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > max) return NaN;
  return n;
}

// input:
//   q1 .. q11: each 0 to that item's max (4 or 8), in YMRS_ITEMS order. All eleven required.
export function ymrs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = YMRS_ITEMS.map((item, i) => readItem(o[`q${i + 1}`], item.max));

  if (vals.some((n) => n === null)) {
    return { valid: false, message: 'Rate all eleven items.' };
  }
  if (vals.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each item must be a whole number from 0 to its own maximum: 4 for most items, 8 for irritability, speech, thought content, and disruptive or aggressive behavior.' };
  }

  const total = vals.reduce((a, b) => a + b, 0);
  const doubleWeighted = vals.reduce((sum, n, i) => sum + (YMRS_ITEMS[i].max === 8 ? n : 0), 0);
  const inRemissionRange = total <= REMISSION_AT;

  const text = inRemissionRange
    ? `YMRS total ${total} of ${MAX_TOTAL}, at or below the total of 12 that trials commonly treat as remission. The scale itself defines no severity bands.`
    : `YMRS total ${total} of ${MAX_TOTAL}, above the total of 12 that trials commonly treat as remission. The scale itself defines no severity bands.`;

  return {
    valid: true,
    total,
    doubleWeighted,
    inRemissionRange,
    bandLabel: `YMRS ${total} of ${MAX_TOTAL}`,
    band: text,
    note: NOTE,
  };
}
