// spec-v1062: the Subjective Opiate Withdrawal Scale (SOWS-Handelsman) -- sixteen symptoms a
// patient rates about themselves, 0 to 4 each.
//
// Source:
//   Handelsman L, Cochrane KJ, Aronson MJ, Ness R, Rubinstein KJ, Kanof PD. Two new rating scales
//   for opiate withdrawal. Am J Drug Alcohol Abuse. 1987;13(3):293-308. PMID 3687892.
//
// The 1987 paper is not open access. The instrument below is taken from open-access sources that
// agree with each other:
//
//   - Chilcoat et al., PMC7530570, Table 1 ("COWS and SOWS items and scoring") lists all sixteen
//     items in order, "Items Scored Variably from 0-4", "Total Score Range: 0-64".
//   - Dunn et al., PMC11016949: "patients rate 16 items from a score of 'not at all' to
//     'extremely' (0 to 4)".
//   - A fentanyl-withdrawal trial, PMC12429306, reports per-item means under the same item
//     wording, corroborating the list.
//
// THE OTHER SOWS. Gossop's SHORT Opiate Withdrawal Scale (1990) is a different instrument with the
// same acronym -- ten items, 0-30 -- and it is `sows` in this catalog (spec-v1061). Sixteen items
// against ten; the totals are not comparable, and neither is a substitute for the other.
//
// NO SEVERITY BANDS FOR THIS SCALE, AND THE ONES IN THE LITERATURE BELONG TO A DIFFERENT VERSION.
// PMC10499405 publishes bands -- 1-10 mild, 11-20 moderate, >=21 severe -- but reads, in the same
// sentence, "The MODIFIED scale contained 15 items ... Total scores for the modified scale range
// from 0 to 60". Those bands are for a fifteen-item variant that drops the craving item, on a
// different denominator. Applying them to the sixteen-item total would be quoting a threshold from
// an instrument the reader is not using, which is the exact failure docs/spec-v963.md was written
// about. So this tile states the total and says there is no published band for it.
//
// Monotone, so spec-v1028's family rule applies: with items unrated there is no total, only what is
// outstanding.
//
// Pure: no DOM, no clock, no network.

export const SOWS_SUBJECTIVE_NOTE = 'The Subjective Opiate Withdrawal Scale (Handelsman 1987) is a self-report measure: the patient rates sixteen withdrawal symptoms from "not at all" to "extremely", scoring 0 to 4 each for a total of 0 to 64. A different instrument shares the acronym -- Gossop 1990\'s SHORT Opiate Withdrawal Scale, ten items, 0 to 30 -- and the two totals are not comparable. This scale publishes no severity bands. Bands do circulate for a FIFTEEN-item modified version scored out of 60; they do not apply to the sixteen-item scale here, and this tool does not borrow them. It records what the patient reports; it does not decide what to give them.';

// Neutral topic labels rather than the questionnaire's first-person wording, per the spec-v936
// posture on instrument text. Scoring is positional and keyed, never derived from the label, so
// relabelling changes no number. Order follows PMC7530570's Table 1.
export const SOWS_SUBJECTIVE_ITEMS = [
  { key: 'anxious', label: 'Anxiety' },
  { key: 'yawning', label: 'Yawning' },
  { key: 'perspiring', label: 'Perspiring' },
  { key: 'tearyEyes', label: 'Teary eyes' },
  { key: 'runnyNose', label: 'Runny nose' },
  { key: 'goosebumps', label: 'Goosebumps' },
  { key: 'shaking', label: 'Shaking' },
  { key: 'hotFlushes', label: 'Hot flushes' },
  { key: 'coldFlushes', label: 'Cold flushes' },
  { key: 'boneMuscleAche', label: 'Bone and muscle aches' },
  { key: 'restless', label: 'Restlessness' },
  { key: 'nauseous', label: 'Nausea' },
  { key: 'vomiting', label: 'Feeling like vomiting' },
  { key: 'muscleTwitch', label: 'Muscle twitching' },
  { key: 'stomachCramps', label: 'Stomach cramps' },
  { key: 'craving', label: 'Craving to use now' },
];

export const SOWS_SUBJECTIVE_SEVERITY = [
  { value: '0', text: '0 - not at all' },
  { value: '1', text: '1 - a little' },
  { value: '2', text: '2 - moderately' },
  { value: '3', text: '3 - quite a bit' },
  { value: '4', text: '4 - extremely' },
];

const MAX_PER_ITEM = 4;

function isBlank(v) {
  return v === null || v === undefined || (typeof v !== 'number' && String(v).trim() === '');
}

function rating(key, v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > MAX_PER_ITEM) {
    throw new RangeError(`sows-subjective: ${key} must be an integer 0-${MAX_PER_ITEM}`);
  }
  return n;
}

export function sowsSubjective(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unrated = [];
  const parts = {};
  let score = 0;
  let rated = 0;
  for (const item of SOWS_SUBJECTIVE_ITEMS) {
    const raw = o[item.key];
    if (isBlank(raw)) { unrated.push(item.label.toLowerCase()); parts[item.key] = null; continue; }
    const n = rating(item.key, raw);
    parts[item.key] = n;
    score += n;
    rated += 1;
  }

  const total = SOWS_SUBJECTIVE_ITEMS.length;
  const max = MAX_PER_ITEM * total;
  if (unrated.length) {
    const list = unrated.length === 1 ? unrated[0]
      : `${unrated.slice(0, -1).join(', ')} and ${unrated[unrated.length - 1]}`;
    return {
      score: null,
      partial: score,
      rated,
      incomplete: true,
      parts,
      band: `SOWS (subjective) is at least ${score} from ${rated} of ${total} symptoms. `
        + `Rate ${list}: each can only add points, so the total is not yet the patient's score.`,
      note: SOWS_SUBJECTIVE_NOTE,
    };
  }

  return {
    score,
    partial: score,
    rated: total,
    incomplete: false,
    parts,
    band: `SOWS (subjective, Handelsman 1987) ${score} of ${max}. Higher is a more severe `
      + 'withdrawal. The scale publishes no severity bands for its sixteen items -- the bands that '
      + 'circulate belong to a fifteen-item modified version scored out of 60 -- so this is a '
      + 'magnitude to follow over time rather than a threshold to act on.',
    note: SOWS_SUBJECTIVE_NOTE,
  };
}
