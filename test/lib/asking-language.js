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
  // spec-v1097: the house refuses two ways. "is required" was on the list and
  // "is needed" was not, though it appears 26 times across 20 library files --
  // the same drift as `can only add` in spec-v1094, where the list knew one of
  // two synonymous house phrasings.
  //
  // Measured before adding, as the rule above requires: exactly ONE tile moves
  // from flagged to exempt, `hf-ef-classification`, which answers "Not
  // classified: an ejection fraction is needed" and gives no reading at all.
  // The other nineteen files were already exempt on other phrases.
  'is needed',
  'not scored', 'unscored', 'score all', 'rate all', 'rate the remaining',
  // How the rating tiles ask for one item: "Rate vascularity on the 1-10 scale",
  // "Score memory from 0 to 8". Written as a pattern rather than the bare verb
  // so it cannot swallow "heart rate 80".
  //
  // spec-v1155: the character class had no parentheses, so an item that names
  // itself and then explains itself in a bracket did not match --
  // `posas-patient-scar` asks "Rate pliability (stiffness) from 1 to 10" and was
  // counted as a tile that answered. A generalisation of the pattern already
  // here rather than a new phrase, like spec-v1102's article and spec-v1114's
  // adjective before it.
  //
  // Measured before adding, as the rule above requires: across every tile and
  // every required field it moves exactly TWO rows from flagged to exempt, both
  // `posas-patient-scar`, and it changes nothing in either empty-form sweep.
  '(?:rate|score) [a-z0-9 ()]{1,30}\\b(?:from|on the) \\d',
  'measure ', 'awaiting', 'fill ', 'add at least',
  'must be ', 'out of range', 'cannot be', 'check the value',
  'no criteria', 'blank', 'outstanding',
  // A tile refusing because the instrument does not apply to the value given.
  'valid for ages',
].join('|'), 'i');

// spec-v1067: the OTHER half of owning up, and deliberately a separate export.
//
// ASKING above is "this tile is refusing to answer". DISCLOSING is "this tile
// answered, and said what it was missing" -- the monotone-score response the
// one-blank-field programme settled on ("scored from 3 of the 6 measurements;
// the ones still blank can only raise it").
//
// They are kept apart because the two whole-catalog sweeps that use ASKING are
// asking a different question: a tile that ANSWERS an empty form has not been
// excused by disclosing, because with nothing entered there is nothing to
// disclose about. Merging the two would exempt every tile that says "scored
// from 0 of 6" and then prints a total. Only the one-blank-field gate, which
// starts from a complete example, accepts a disclosure as sufficient.
export const DISCLOSING = new RegExp([
  // spec-v1094: the house says this rule two ways and the list knew one of them.
  // `can only raise` appears 28 times across 17 library files; `can only add
  // points` appears 19 times across 10 -- the same sentence about the same
  // monotone property, written by different hands, and only the first was
  // recognised. That is the drift in [[project_duplicated_rule_drift]], not a
  // tile-specific carve-out, so the fix belongs here rather than in one tile's
  // wording.
  //
  // Measured before adding, as the rule above requires: across every tile and
  // every numeric field, dropping one field changes exactly ONE tile from
  // flagged to exempt -- `isth-bat`, which says "each domain still unrated can
  // only add points, so a partial score cannot yet read as within the normal
  // range" and then refuses to give the reassuring reading. It is disclosing,
  // not answering anyway.
  'can only add',
  'scored from', 'can only raise', 'not entered', 'was not entered',
  'were not entered', 'has not been entered', 'have not been entered',
  'not assessed', 'among those entered', 'not enough entered',
  // spec-v1164: the house says this a fourth way. `not entered` appears 63 times
  // across 46 library files and was on the list; `not stated` appears 15 times
  // across 10 and was not -- and it is the phrasing the aneurysm scores use for
  // exactly the disclosure this list exists to recognise ("the location is not
  // stated, and it is worth 5 points"). The same drift as `can only add` in
  // spec-v1094 and `is needed` in spec-v1097: one rule, two hands, one phrasing
  // known.
  //
  // Measured before adding, as the rule at the top requires: across every tile and
  // every field, it moves FOUR rows from flagged to exempt -- three on
  // `impede-vte` ("IMPEDE VTE between 5 and 9 on what was entered: the
  // thromboprophylaxis ... not stated") and one on `glim-malnutrition` ("Not yet
  // assessable by GLIM: the weight loss and the body mass index ... not stated").
  // All four are tiles disclosing correctly, and none of them answers anyway.
  'not stated',
  // spec-v1238: a sixth hand, and the narrowest one yet. Three tiles say the
  // unstated field CANNOT change the verdict rather than that it is missing --
  // `duke-treadmill` ("moderate risk (DTS -10 to +4) whatever the angina index
  // turns out to be"), `mascc` and the two aneurysm scores in neuro-v118 ("which
  // holds whatever the location and the population turn out to be"). That is a
  // disclosure, and a stronger one than "not entered": it names the gap AND says
  // it does not matter here.
  //
  // THE PATTERN HAS TO BE NARROW. The bare word `whatever` appears in 30 library
  // files, and nearly all of them are STATIC PROSE about the instrument -- "a
  // disoriented patient scores it whatever the cause", "a lung score of 2 or 3 is
  // severe whatever the other organs show". Matching that would exempt tiles for
  // a sentence that was in the note before any field was dropped, which is the
  // trap spec-v1196 named. Only the two forms these three tiles use are here.
  'holds whatever', 'turns out to be',
  'not \\w+(?:able|ed) without', 'cannot be \\w+ without',
  //
  // spec-v1239: a seventh hand, and the same family as the sixth -- the tile
  // says it cannot REACH a classification without the field, rather than that
  // the field is missing. `not classifiable without` (ph-hemodynamics-2022),
  // `not defined without` (rope-score), `not staged without`
  // (aortic-stenosis-stage), and `cannot be assigned / applied / excluded
  // without` across seven more files.
  //
  // Measured before adding, as the rule at the top requires:
  //   probe-half-guarded            18 calculators -> 17
  //   probe-omitted-field-decides   51 fields / 35 calculators -> 49 / 34 (section 3)
  //
  // `cannot be given without` is in that family by grammar and is about a DOSE
  // rather than a gap, so it is worth knowing it is matched -- it appears only in
  // static notes, where nothing was dropped, and a static sentence cannot exempt
  // a row this probe raises because the row requires the verdict to have moved.
  //
  // Measured before adding, as the rule at the top requires. `holds whatever`
  // appears in code in TWO library files and `turns out to be` in two, all four
  // genuine disclosures -- and every other use of the bare word `whatever`, in 30
  // files, is static prose and is deliberately not matched.
  //
  //   probe-half-guarded          21 calculators -> 18
  //   probe-omitted-field-decides 33 fields / 14 calculators -> 31 / 12  (section 2)
  //                               55 fields / 37 calculators -> 51 / 35  (section 3)
  //
  // The five rows are `duke-treadmill`, `mascc`, `elapss` and `phases`, all of
  // which name the unstated field AND say it cannot change the verdict -- a
  // stronger disclosure than "not entered", and the reason this list exists.
  // spec-v1195: a fifth hand on the same sentence. `not entered` (63 uses across
  // 46 files) and `not assessed` were on the list; the house also writes the
  // observation was not RECORDED, not GRADED, not RATED and not MEASURED, and
  // none of those four was recognised. Written as one participle family rather
  // than four phrases, because that is what it is -- the same drift as `can only
  // add` in spec-v1094, `is needed` in spec-v1097 and `not stated` in spec-v1164.
  //
  // Measured before adding, as the rule at the top requires: across every tile
  // and every number or graded select, dropping one field moves exactly ONE row
  // from flagged to exempt -- `aims-tardive`, which reads "AIMS movement total
  // 4/28 (global severity not rated)" and is disclosing, not answering anyway.
  // It changes nothing in either empty-form sweep, which read ASKING only.
  '(?:not|never) (?:yet )?(?:been )?(?:recorded|graded|rated|measured)\\b',
  // spec-v1196: the negative-existential form of the same sentence, and the
  // phrase the house uses when it answers on a partial record. `no <thing>
  // is/was entered|recorded` has 13 uses across lib/ and `what was entered` has
  // 19 -- "No first-tier result is entered", "no qualifying urine culture is
  // recorded", "No LCBI is met by what was entered".
  //
  // Measured before adding, as the rule at the top requires: across every tile
  // and every number or graded select they move THREE rows from flagged to
  // exempt. Four of the six rows `probe-static-exemption` still printed are
  // closed by them, and the other two of the three are `sea-guideline`, exempted
  // by "No fever was entered" while the field the sweep dropped was the ESR and
  // then the white cell count.
  //
  // Those two are the reason these phrases arrive WITH `ownsTheGap` below and not
  // before it: "No fever was entered" is in that reading whether or not the ESR
  // is dropped, so it is static prose about this row and the movement rule
  // ignores it. Added alone they would have bought two false exemptions to fix
  // four true ones.
  'no [a-z][a-z -]{0,40} (?:is|was) (?:entered|recorded)',
  'what was entered',
  'does not rule', 'cannot yet rule', 'items assessed',
  // "3 of 6 components", "7 of 8 items", "0 of 1 criteria assessed"
  //
  // spec-v1102: the article was not optional, so "N of THE 20 items" did not
  // match while "N of 20 items" did -- the house writes both, in 7 files. This
  // is a generalisation of the pattern already here rather than a new phrase,
  // and it moves exactly one tile from flagged to exempt: `mchat-rf`, which
  // says "8 of the 20 items are unanswered ... and an unanswered item scores
  // nothing. That total is over the 12 items that were answered."
  //
  // spec-v1114: one optional ADJECTIVE between the number and the noun, because
  // the house writes "8 of the 20 items" and also "7 of the 13 symptom items",
  // and only the first matched. A generalisation of the pattern already here
  // rather than a new phrase.
  //
  // Measured before adding, as the rule above requires: across every tile and
  // every number or graded select, dropping one field moves exactly ONE field
  // from flagged to exempt -- `masld-criteria`, whose refusal says "5 of them
  // have not been assessed" after naming the five, and which was already
  // refusing rather than answering.
  'of (?:the )?\\d+ (?:[a-z-]+ )?(?:items|components|measurements|criteria)',
].join('|'), 'i');

// spec-v1196: WHERE the words come from, which the two rules at the top do not say.
//
// Rule 2 above says a phrase here is matched against the whole reading. A tile
// carries standing explanatory notes, an option label read back, a formula
// written out -- text that is the same whatever was entered -- and any of it can
// contain a phrase from this vocabulary. spec-v1192 walked into one:
// `hiv-pep-occupational` was read as GUARDED for a missing source status on the
// strength of its own option label, "the source cannot be identified".
//
// The discriminator is not the phrase, it is MOVEMENT. Where a sweep starts from
// a complete worked example and clears ONE field, it has a before-reading, and:
//
//   a sentence identical in both cannot be a statement about the field that was
//   dropped, because it was written before anyone left anything out.
//
// So the vocabulary is matched against what the reading ADDED, not against all of
// it. `scripts/probe-static-exemption.mjs` is the finder that measures the gap
// this closes; spec-v1193 through spec-v1195 emptied it from seventeen rows to
// six by fixing tiles and teaching the vocabulary words it did not know.
//
// Nothing added means nothing to check. A reading that only LOSES a sentence has
// fabricated nothing -- every sentence still on screen was true with the field
// present -- so it is not the defect these sweeps hunt. `constrictive-
// pericarditis-echo` is the case: clearing the lateral annular velocity drops one
// educational note about annulus reversus and moves no criterion, because that
// velocity is not one of them.
//
// A string, because the browser sweeps ship this into page.evaluate.
export function addedText(before, after) {
  if (!before) return String(after || '');
  // spec-v1222: a reading assembled from DOM nodes has no sentence punctuation
  // between them. `#q-results` textContent runs the rows together --
  // "Anion gap: 26Albumin-corrected AG: 26delta-AG = 14" -- so a tile that merely
  // DROPPED the albumin row had no boundary to split on, the whole run read as
  // one chunk, and a reading that added nothing was reported as adding ninety-two
  // characters. Splitting where a digit meets a letter recovers the row edge.
  //
  // Finer splitting is the safe direction. Both sides are split the same way, so
  // a chunk unchanged in both is still filtered out, and a chunk the reading
  // genuinely gained is still absent from `before` and still reported. It removes
  // false "added" text; it cannot hide real added text.
  const split = (t) => String(t || '')
    .split(/(?<=[.!?])\s+|(?<=\.)(?=[A-Z])|(?<=[^A-Za-z0-9]\d{1,9})(?=[A-Za-z])/)
    .map((x) => x.trim()).filter(Boolean);
  const seen = new Set(split(before));
  return split(after).filter((x) => !seen.has(x)).join(' ');
}

// Did the reading own up to THIS gap? `before` is the same tile read with nothing
// dropped; without it this falls back to the whole reading, which is the older,
// looser question.
export function ownsTheGap(after, before) {
  const moved = addedText(before, after);
  if (!moved) return true;   // nothing added: no new claim was made
  return ASKING.test(moved) || DISCLOSING.test(moved);
}
