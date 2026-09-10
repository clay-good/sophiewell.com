// spec-v1196: the vocabulary is matched against what a reading ADDED, not
// against all of it.
//
// The bug this closes: `test/lib/asking-language.js` is matched against the whole
// reading, so a tile's standing explanatory prose, an option label read back, or
// a formula written out could contain a phrase from the list and buy the tile an
// exemption it had not earned. spec-v1192 walked into one --
// `hiv-pep-occupational` was read as guarded for a missing source status because
// its own option label says "the source cannot be identified".
import test from 'node:test';
import assert from 'node:assert/strict';
import { addedText, ownsTheGap, ASKING, DISCLOSING } from '../lib/asking-language.js';

const STANDING = 'Every interval in this table presumes a complete examination to the cecum.';

test('addedText keeps only the sentences that were not there before', () => {
  const before = `Next colonoscopy in 3 years. ${STANDING}`;
  assert.equal(addedText(before, `Next colonoscopy in 10 years. ${STANDING}`), 'Next colonoscopy in 10 years.');
  // A reading that only LOSES a sentence added nothing.
  assert.equal(addedText(before, 'Next colonoscopy in 3 years.'), '');
  // With no baseline the whole reading is what moved, which is the older question.
  assert.equal(addedText('', 'Next colonoscopy in 10 years.'), 'Next colonoscopy in 10 years.');
  assert.equal(addedText(undefined, 'anything'), 'anything');
});

test('static prose no longer buys an exemption', () => {
  // "complete " is in ASKING, and it is in the standing sentence, not in the
  // answer -- so the whole-reading question says yes and this one says no.
  const before = `Next colonoscopy in 3 years. ${STANDING}`;
  const after = `Next colonoscopy in 10 years. ${STANDING}`;
  assert.equal(ASKING.test(after), true, 'the whole reading matches, which is the bug');
  assert.equal(ownsTheGap(after, before), false);

  // Said about THIS gap, it counts.
  const owned = `Next colonoscopy in 10 years. The histology was not entered. ${STANDING}`;
  assert.equal(ownsTheGap(owned, before), true);
});

test('a reading that only loses a sentence has fabricated nothing', () => {
  // `constrictive-pericarditis-echo` is the case: clearing the lateral annular
  // velocity drops one educational note and moves no criterion, because that
  // velocity is not one of them.
  const before = 'The criteria are met on the septal shift plus one supporting finding. The medial velocity is higher than the lateral velocity.';
  const after = 'The criteria are met on the septal shift plus one supporting finding.';
  assert.equal(ownsTheGap(after, before), true);
});

test('the participle family and the negative existential are recognised', () => {
  // spec-v1195 and spec-v1196 additions, asserted so a later edit cannot quietly
  // drop one.
  for (const phrase of [
    'global severity not rated', 'the drum was not graded', 'it has not been recorded',
    'the level was never measured', 'No first-tier result is entered',
    'no qualifying urine culture is recorded', 'No LCBI is met by what was entered',
  ]) {
    assert.match(phrase, DISCLOSING, phrase);
  }
  // And they do not swallow ordinary prose.
  for (const phrase of ['a rated item', 'the recorded findings', 'no fever']) {
    assert.doesNotMatch(phrase, DISCLOSING, phrase);
  }
});

// spec-v1222: a reading assembled from DOM nodes has no sentence punctuation
// between them, so there was nothing to split on and a tile that only DROPPED a
// row read as one that added the whole run.
test('addedText finds the row edge in a reading with no sentence punctuation', () => {
  const withAlbumin = 'Anion gap: 26Albumin-corrected AG: 26delta-AG = 14delta-HCO3 = 10Pure AG metabolic acidosis.';
  const without = 'Anion gap: 26delta-AG = 14delta-HCO3 = 10Pure AG metabolic acidosis.';
  // `anion-gap-dd` with its optional albumin cleared: one row fewer, nothing new.
  assert.equal(addedText(withAlbumin, without), '');
  assert.equal(ownsTheGap(without, withAlbumin), true);
});

test('splitting finer cannot hide text a reading genuinely gained', () => {
  const before = 'Anion gap: 26delta-AG = 14';
  // A new clause is still absent from `before`, so it is still reported.
  assert.match(addedText(before, 'Anion gap: 26delta-AG = 14Mixed acidosis.'), /Mixed acidosis/);
  // And a value that MOVED is still reported, which is the defect these sweeps
  // exist for -- a recompute from the blank.
  assert.equal(addedText(before, 'Anion gap: 31delta-AG = 14'), 'Anion gap: 31');
});

// spec-v1223: the row-edge split must not cut inside a unit.
//
// `(?<=\d)(?=[A-Za-z])` alone turns `cmH2O` into `cmH2` + `O`, which splits a
// DISCLOSURE across chunks: `driving-pressure` says "(plateau must exceed PEEP)
// cmH2OStatic compliance", the sentence landed in a chunk that matched the
// baseline, and the required-field gate stopped seeing that the tile had asked.
test('a unit with a subscript is not a row boundary', () => {
  const before = 'Driving pressure (dP): 25 cmH2OStatic compliance: 16 mL/cmH2ODynamic compliance: 20 mL/cmH2O';
  const after = 'Driving pressure (dP): (plateau must exceed PEEP) cmH2OStatic compliance: -- mL/cmH2ODynamic compliance: (enter peak pressure) mL/cmH2O';
  // The tile ASKS -- "enter peak pressure" -- and the sentence carrying that has
  // to survive in one piece for the vocabulary to see it.
  assert.match(addedText(before, after), /enter peak pressure/);
  assert.equal(ownsTheGap(after, before), true, 'the tile asked; the gate must see it');
});

test('the row-edge split still fires on a standalone number', () => {
  // A digit run preceded by a non-alphanumeric is a value, and what follows it is
  // the next row.
  assert.equal(addedText('Anion gap: 26Albumin-corrected AG: 26delta-AG = 14',
    'Anion gap: 26delta-AG = 14'), '');
});
