// spec-v508: the Voice Handicap Index-10 (VHI-10), the 10-item patient-reported measure of self-perceived
// voice handicap. Laryngology was a whole-concept gap: "voice handicap", "dysphonia", "hoarseness", and
// "grbas" were all zero-hit across the corpus.
//
// The patient rates each of ten statements 0-4 (0 never, 1 almost never, 2 sometimes, 3 almost always,
// 4 always). The total runs 0-40.
//
// HIGH-STAKES: this sums the answers the patient gives. It is NOT a diagnosis, NOT a laryngeal examination,
// and NOT an indication for laryngoscopy, therapy, or surgery (spec-v11 section 5.3). A high score reflects
// how much handicap the patient perceives, not what is causing it. Persistent hoarseness still warrants
// laryngeal visualization regardless of the score. The management decision stays with the ENT and
// speech-language-pathology team.
//
// ITEMS AND THRESHOLD RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Rosen CA, Lee AS, Osborne J, Zullo T, Murry T. Development and validation of the Voice Handicap
//     Index-10. Laryngoscope. 2004;114(9):1549-1556.
//   - Laryngology references reproducing the same ten items, the same 0-4 per-item scale, and the commonly
//     cited abnormal threshold of 11.
//
// Item wording note: item 10 is conventionally quoted as a question others ask the patient; it is written
// here without quotation marks or an apostrophe to stay inside this codebase's string rules, with the meaning
// preserved.

export const VHI10_ITEMS = [
  'My voice makes it difficult for people to hear me.',
  'People have difficulty understanding me in a noisy room.',
  'My voice difficulties restrict my personal and social life.',
  'I feel left out of conversations because of my voice.',
  'My voice problem causes me to lose income.',
  'I feel as though I have to strain to produce voice.',
  'The clarity of my voice is unpredictable.',
  'My voice problem upsets me.',
  'My voice makes me feel handicapped.',
  'People ask what is wrong with my voice.',
];

const ABNORMAL_AT = 11;

const NOTE = 'The Voice Handicap Index-10 (Rosen and colleagues 2004) sums ten patient-rated statements, each 0 (never) to 4 (always), for a total of 0 to 40. A total of 11 or more is the commonly cited threshold for an abnormal degree of self-perceived voice handicap. The score reflects how much handicap the patient perceives, not what is causing it: it is not a diagnosis, not a laryngeal examination, and not an indication for laryngoscopy, therapy, or surgery. Persistent hoarseness warrants laryngeal visualization regardless of the score.';

function readItem(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 4) return NaN;
  return n;
}

// input:
//   v1 .. v10: each 0-4 (all ten required).
export function vhi10(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vals = [];
  for (let i = 1; i <= 10; i += 1) {
    vals.push(readItem(o[`v${i}`]));
  }
  if (vals.some((n) => n === null)) {
    return { valid: false, message: 'Answer all ten items (each 0 to 4).' };
  }
  if (vals.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each item must be a whole number from 0 to 4.' };
  }

  const total = vals.reduce((a, b) => a + b, 0);
  const abnormal = total >= ABNORMAL_AT;
  const text = abnormal
    ? `VHI-10 total ${total} of 40: at or above the commonly cited threshold of 11 for an abnormal degree of self-perceived voice handicap.`
    : `VHI-10 total ${total} of 40: below the commonly cited threshold of 11 for an abnormal degree of self-perceived voice handicap.`;

  return {
    valid: true,
    total,
    abnormal,
    bandLabel: `VHI-10 ${total} of 40`,
    band: text,
    note: NOTE,
  };
}
