// spec-v1056: the words a calculator uses when it is asking rather than answering.
//
// Two whole-catalog sweeps need this vocabulary: the empty-form sweep
// (no-answer-from-nothing-sweep.spec.js), which clears every field, and the
// required-field sweep (required-field-agreement.spec.js), which clears one. A
// reading that ASKS is not a tile that answered, and both must skip it.
//
// They had a copy each, and the copies had drifted -- the second was written by
// copying the first and then extended as tiles were fixed. The consequence is
// not symmetrical noise: a phrase missing from one sweep makes that sweep flag a
// tile that is refusing correctly, and the way a flagged tile gets quiet is a
// LEDGER LINE. So the drift had been paid for in exemptions -- `ascvd` and
// `prevent` refuse with "PCE valid for ages 40-79 only", which one sweep
// recognised and the other did not.
//
// A tile exempted for nothing is a tile the gate is not protecting.
//
// Two rules about editing this list, both learned the hard way (spec-v1039,
// spec-v1046):
//
//   1. Before adding a phrase, check which tiles it stops flagging. "not
//      reached" was nearly added on the strength of one tile's refusal, and
//      would have exempted every tile that phrases a RULE-OUT that way.
//   2. A phrase here is matched against the whole reading, so a tile that says
//      the words and then answers anyway is skipped. Do not soften the list to
//      accommodate such a tile; make the tile refuse.
export const ASKING = new RegExp([
  'enter ', 'choose ', 'select ', 'complete ', 'provide ',
  'missing', 'still needed', 'is required', 'required',
  'not scored', 'unscored', 'score all', 'rate all', 'rate the remaining',
  // How the rating tiles ask for one item: "Rate vascularity on the 1-10 scale",
  // "Score memory from 0 to 8". Written as a pattern rather than the bare verb
  // so it cannot swallow "heart rate 80".
  '(?:rate|score) [a-z0-9 ]{1,30}\\b(?:from|on the) \\d',
  'measure ', 'awaiting', 'fill ', 'add at least',
  'must be ', 'out of range', 'cannot be', 'check the value',
  'no criteria', 'blank', 'outstanding',
  // A tile refusing because the instrument does not apply to the value given.
  'valid for ages',
].join('|'), 'i');
