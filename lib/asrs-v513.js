// spec-v513: the ASRS v1.1 Part A screener, the six-item adult ADHD screen. Adult ADHD was a whole-concept
// gap: "asrs", "adhd", "attention deficit", "conners", and "vanderbilt" were all zero-hit across the corpus
// and app.js.
//
// The scoring is NOT a sum, and that is the error the tile exists to prevent. Each item is answered on the
// same 0-4 frequency scale, but the threshold that makes an answer count differs by item:
//   items 1-3 count at "sometimes" or more (2+)
//   items 4-6 count at "often" or more    (3+)
// Four or more counting answers is the positive screen. Printed forms encode this as shaded boxes, which is
// exactly what gets mis-transcribed when the form is not in front of you.
//
// HIGH-STAKES: this is a SCREEN, not a diagnosis. A positive screen means symptoms are consistent with adult
// ADHD and further clinical evaluation is warranted; it does not establish the diagnosis, which requires
// symptoms across settings, onset in childhood, functional impairment, and the exclusion of other causes. A
// negative screen does not exclude ADHD. It is NOT an indication for stimulant or non-stimulant medication,
// for a controlled-substance prescription, or for an academic or workplace accommodation (spec-v11
// section 5.3). The evaluation stays with the clinician.
//
// ITEMS AND THRESHOLDS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Kessler RC, Adler L, Ames M, et al. The World Health Organization Adult ADHD Self-Report Scale (ASRS):
//     a short screening scale for use in the general population. Psychol Med. 2005;35(2):245-256.
//   - Adult-ADHD references reproducing the same six Part A questions, the same 0-4 frequency scale, the same
//     split of item thresholds (2+ for items 1-3, 3+ for items 4-6), and the same positive cut of 4.

export const ASRS_ITEMS = [
  { text: 'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?', countsAt: 2 },
  { text: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?', countsAt: 2 },
  { text: 'How often do you have problems remembering appointments or obligations?', countsAt: 2 },
  { text: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?', countsAt: 3 },
  { text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?', countsAt: 3 },
  { text: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?', countsAt: 3 },
];

export const FREQUENCY_SCALE = [
  { value: '0', text: '0 - never' },
  { value: '1', text: '1 - rarely' },
  { value: '2', text: '2 - sometimes' },
  { value: '3', text: '3 - often' },
  { value: '4', text: '4 - very often' },
];

const POSITIVE_AT = 4;

const NOTE = 'The ASRS v1.1 Part A screener (Kessler and colleagues 2005) does not sum the answers. Each of the six items is answered 0 (never) to 4 (very often), but an answer only counts toward the screen at a threshold that differs by item: items 1 to 3 count at sometimes or more, items 4 to 6 only at often or more. Four or more counting answers is a positive screen, meaning symptoms are consistent with adult ADHD and further clinical evaluation is warranted. It does not establish the diagnosis, which needs symptoms across settings, onset in childhood, functional impairment, and the exclusion of other causes. A negative screen does not exclude ADHD. It is not an indication for stimulant or non-stimulant medication, for a controlled-substance prescription, or for an academic or workplace accommodation.';

function readItem(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 4) return NaN;
  return n;
}

// input:
//   q1 .. q6: each 0-4 (all six required), in ASRS_ITEMS order.
export function asrs(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = [];
  for (let i = 1; i <= ASRS_ITEMS.length; i += 1) vals.push(readItem(o[`q${i}`]));

  if (vals.some((n) => n === null)) {
    return { valid: false, message: 'Answer all six Part A items (each 0 to 4).' };
  }
  if (vals.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each item must be a whole number from 0 to 4.' };
  }

  const counting = vals.map((n, i) => n >= ASRS_ITEMS[i].countsAt);
  const countingTotal = counting.filter(Boolean).length;
  const rawTotal = vals.reduce((a, b) => a + b, 0);
  const positive = countingTotal >= POSITIVE_AT;

  const text = positive
    ? `ASRS Part A: ${countingTotal} of 6 items at or above their own threshold, a positive screen. Symptoms are consistent with adult ADHD and further clinical evaluation is warranted.`
    : `ASRS Part A: ${countingTotal} of 6 items at or above their own threshold, below the positive cut of 4. A negative screen does not exclude ADHD.`;

  return {
    valid: true,
    countingTotal,
    rawTotal,
    counting,
    positive,
    bandLabel: `${countingTotal} of 6 items counting`,
    band: text,
    note: NOTE,
  };
}
