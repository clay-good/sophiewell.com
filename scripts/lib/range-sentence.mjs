// spec-v1794: the one list of sentence shapes a library uses to say "that value is outside the range I
// accept", shared by the finders that need to tell a RANGE refusal from any other kind.
//
// It was written twice -- `probe-undeclared-cap` and `probe-envelope-inside` each carried a copy -- and the
// copies had already drifted two ways: only one knew the `must be a number` shape (spec-v1785 added it
// there), and only one knew the `Enter a ... between` shape. A finder's sentence list is part of its reach,
// so a shape missing from one copy is a hole nobody can see from the other. One rule, one place; see
// docs/spec-v1083.md on the same lesson in `lib/num.js`.
//
// The cases, in the order they appear below:
//
//   * `lib/bounds.js` envelopes:  "Input above the plausible range for weight (0.2 to 500 kg); verify..."
//   * `inputFault` / `gradeFault`: "The weight must be between 0.4 and 500 kg. Check the value entered."
//   * `num()`:                     "...must be at most 120", "...must be a number.", "...no more than 25"
//   * an exclusive floor:          "...must be greater than 0 and at most 3650. Check the value entered."
//   * a library's own wording:     "Each margin must be a number of microvolts from 0 to 200."
//   * `num({ computed: true })`:   "...works out to 4837.5, which is outside the range this tool reports"
//   * an `Enter ...` refusal:      "Enter a pre-test probability between 0 and 100% (exclusive)."
//
// The last shape is why this file carries a test. `^enter (?:a|an|the)[^.]*between` -- how it was written in
// `probe-undeclared-cap` -- matches "Enter the days between administrations as a whole number.", where
// `between` is part of the quantity's NAME and the sentence is about integers, not range. That read
// `auth-runout`'s whole-number refusal as a cap and printed a DISAGREES row against a declaration that was
// correct. A range sentence states a NUMBER after "between", so the number is required.
export const RANGE_SENTENCE = new RegExp([
  'plausible range',
  // `at least` / `at most` must be followed by a NUMBER. Without that, "The maximal extent (M) must be at
  // least as long as the circumferential extent (C)" -- a sibling comparison in `prague-barrett` -- reads as
  // a range refusal. `a number` stands alone because the sentence it comes from ends there: "must be a
  // number.", from `num()` on a non-finite value.
  'must be (?:between|from|no more|greater than|less than)',
  'must be at (?:most|least) -?[\\d.,]',
  'must be a number',
  'between -?[\\d.,]+ and -?[\\d.,]+',
  'outside -?[\\d.,]+ to',
  'no more than',
  'beyond (?:a plausible|recorded)',
  'works out to [-\\d.,]+, which is outside the range this tool reports',
  '^enter (?:a|an|the)[^.]*between -?[\\d.,]+',
].join('|'), 'i');

// True when `message` is a library saying the value is out of range, rather than missing, inconsistent with
// a sibling, or the wrong shape.
export const saysOutOfRange = (message) => RANGE_SENTENCE.test(String(message || ''));
