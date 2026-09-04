// spec-v1061: the Short Opiate Withdrawal Scale (SOWS-Gossop) -- ten symptoms a patient rates
// about themselves.
//
// Source:
//   Gossop M. The development of a Short Opiate Withdrawal Scale (SOWS).
//   Addict Behav. 1990;15(5):487-490. PMID 2248123.
//
// The 1990 paper is not open access. The instrument below is taken from three independent
// open-access descriptions that agree with each other item for item and on the scoring:
//
//   - Rich et al., PMC11036405: "a 10-item self-report measure ... rate the following 10 items as
//     'None', 'Mild', 'Moderate' or 'Severe' ... total score ... ranges from 0 to 30".
//   - Bergeria et al., PMC9992259: the same ten items, same four response options, "scores range
//     from 0 to 30", and "a change score of 2-4 points indicates a clinically meaningful change".
//   - Fishman et al., PMC6968526 (the lofexidine trials): the same ten items as the primary
//     efficacy endpoint, "total score ranging from 0 to 30", same 2-4 point response threshold.
//
// THIS SCALE HAS NO PUBLISHED SEVERITY BANDS, AND THIS TILE DOES NOT INVENT ANY. Its sibling COWS
// has them (5-12 mild, 13-24 moderate, 25-36 moderately severe, >36 severe) and the temptation is
// to write the same shape here. None of the three sources gives a cut-off; all three say only that
// a higher score is a more severe withdrawal, and two give the 2-4 point change as the meaningful
// unit. So the tile reports the total, what it is out of, and the change threshold -- and says in
// words that there is no published cut-off, because a reader who has used COWS will expect one.
//
// SELF-REPORT, NOT OBSERVATION. COWS is rated by a clinician from signs; SOWS is rated by the
// patient from symptoms. The two are not interchangeable and their numbers are not comparable.
//
// AND TWO DIFFERENT SCALES ABBREVIATE TO SOWS. This is Gossop's SHORT Opiate Withdrawal Scale, ten
// items, 0-30. Handelsman L, et al. "Two new rating scales for opiate withdrawal."
// Am J Drug Alcohol Abuse. 1987 -- PMID 3687892 -- introduced the SUBJECTIVE Opiate Withdrawal
// Scale, sixteen items, alongside its observer companion the OOWS. Neither Handelsman scale is in
// this catalog. A reader who arrives here having meant the sixteen-item one needs to be told at
// once, so the note below says it in the first sentence rather than in a footnote.
//
// It is monotone: every item adds points or leaves them alone. So a partial total is a LOWER bound
// -- it can carry a worse reading and never a better one -- and with items unrated this returns
// what is outstanding rather than a total, in the shape spec-v1028 set for CIWA-Ar and COWS and
// spec-v1047 for WAT-1.
//
// Pure: no DOM, no clock, no network.

export const SOWS_NOTE = 'This is the SHORT Opiate Withdrawal Scale (Gossop 1990), ten items. A different instrument abbreviates to SOWS as well -- the SUBJECTIVE Opiate Withdrawal Scale (Handelsman 1987), which has sixteen items and a companion observer scale, the OOWS. They are not the same scale and their totals are not comparable. This one is a self-report measure: the patient rates ten withdrawal symptoms as none, mild, moderate or severe, scoring 0 to 3 each for a total of 0 to 30. A higher score is a more severe withdrawal, and a change of 2 to 4 points is the smallest change usually treated as meaningful. The scale publishes no severity bands -- unlike the clinician-rated COWS, there is no score at which it declares mild or moderate withdrawal, and this tool does not invent one. It records what the patient reports; it does not decide what to give them.';

// The ten items, as the three open-access sources describe them. Neutral topic labels rather than
// questionnaire wording, per the spec-v936 posture on instrument text.
export const SOWS_ITEMS = [
  { key: 'feelingSick', label: 'Feeling sick' },
  { key: 'stomachCramps', label: 'Stomach cramps' },
  { key: 'muscleSpasms', label: 'Muscle spasms or twitching' },
  { key: 'feelingCold', label: 'Feeling cold' },
  { key: 'heartPounding', label: 'Heart pounding' },
  { key: 'muscularTension', label: 'Muscular tension' },
  { key: 'achesAndPains', label: 'Aches and pains' },
  { key: 'yawning', label: 'Yawning' },
  { key: 'runnyEyes', label: 'Runny eyes' },
  { key: 'insomnia', label: 'Trouble sleeping' },
];

export const SOWS_SEVERITY = [
  { value: '0', text: '0 - none' },
  { value: '1', text: '1 - mild' },
  { value: '2', text: '2 - moderate' },
  { value: '3', text: '3 - severe' },
];

const MAX_PER_ITEM = 3;
const MEANINGFUL_CHANGE = '2 to 4 points';

function isBlank(v) {
  return v === null || v === undefined || (typeof v !== 'number' && String(v).trim() === '');
}

function rating(key, v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > MAX_PER_ITEM) {
    throw new RangeError(`sows: ${key} must be an integer 0-${MAX_PER_ITEM}`);
  }
  return n;
}

export function sows(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const rated = [];
  const unrated = [];
  let score = 0;
  const parts = {};
  for (const item of SOWS_ITEMS) {
    const raw = o[item.key];
    if (isBlank(raw)) { unrated.push(item.label.toLowerCase()); parts[item.key] = null; continue; }
    const n = rating(item.key, raw);
    parts[item.key] = n;
    score += n;
    rated.push(item.key);
  }

  const total = SOWS_ITEMS.length;
  if (unrated.length) {
    const list = unrated.length === 1 ? unrated[0]
      : `${unrated.slice(0, -1).join(', ')} and ${unrated[unrated.length - 1]}`;
    return {
      score: null,
      partial: score,
      rated: rated.length,
      incomplete: true,
      parts,
      band: `SOWS is at least ${score} from ${rated.length} of ${total} symptoms. `
        + `Rate ${list}: each can only add points, so the total is not yet the patient's score.`,
      note: SOWS_NOTE,
    };
  }

  return {
    score,
    partial: score,
    rated: total,
    incomplete: false,
    parts,
    band: `SOWS ${score} of ${MAX_PER_ITEM * total} (Gossop 1990). Higher is a more severe `
      + `withdrawal; a change of ${MEANINGFUL_CHANGE} is the smallest usually treated as meaningful. `
      + 'The scale publishes no severity bands, so this is a magnitude to follow over time rather '
      + 'than a threshold to act on.',
    note: SOWS_NOTE,
  };
}
