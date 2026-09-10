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
