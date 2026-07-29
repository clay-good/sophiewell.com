// spec-v603: the Bauer and modified Bauer scores.
//
// The load-bearing tests are that a higher score means a BETTER prognosis, and that the two versions
// disagree at exactly one total and nowhere else.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bauerScore, ITEMS, ORIGINAL_BANDS, MODIFIED_BANDS,
  ORIGINAL_MAX, MODIFIED_MAX, DISAGREEMENT_CASES,
} from '../../lib/bauer-score-v603.js';

const NONE = Object.fromEntries(ITEMS.map((i) => [i.key, 'no']));
const at = (over = {}) => bauerScore({ ...NONE, ...over });
const withFavorable = (keys) => at(Object.fromEntries(keys.map((k) => [k, 'yes'])));

test('the two versions have five and four items', () => {
  assert.equal(ITEMS.length, ORIGINAL_MAX);
  assert.equal(ITEMS.filter((i) => i.inModified).length, MODIFIED_MAX);
  assert.equal(ITEMS.filter((i) => !i.inModified)[0].key, 'noPathologicalFracture');
});

// THE direction.
test('a higher score means a better prognosis', () => {
  const worst = at();
  const best = withFavorable(ITEMS.map((i) => i.key));
  assert.equal(worst.original, 0);
  assert.equal(best.original, ORIGINAL_MAX);
  assert.match(worst.originalSurvival, /under 6 months/);
  assert.match(best.originalSurvival, /over 12 months/);
  assert.match(worst.bandText, /HIGHER score means a BETTER prognosis/);
});

test('the band ladders run from worse to better as the score rises', () => {
  for (const bands of [ORIGINAL_BANDS, MODIFIED_BANDS]) {
    assert.match(bands[0].survival, /under 6 months/);
    assert.match(bands[bands.length - 1].survival, /over 12 months/);
  }
});

test('every item is phrased as the favorable state', () => {
  for (const i of ITEMS) {
    assert.ok(/^No |^A solitary|^The primary/.test(i.text), i.text);
  }
});

// THE single disagreement.
test('the fracture-present disagreement runs one way', () => {
  // A fracture with three of the four modified factors: 3 on both scales, different strategies.
  const r = withFavorable(['noVisceralMetastases', 'solitarySkeletalMetastasis', 'notLungCancer']);
  assert.equal(r.original, 3);
  assert.equal(r.modified, 3);
  assert.equal(r.versionsDisagree, true);
  assert.equal(r.originalStrategy, 'palliative surgery');
  assert.equal(r.modifiedStrategy, 'excisional surgery');
  assert.match(r.bandText, /THE TWO VERSIONS DISAGREE FOR THIS PATIENT/);
});

test('the fracture-absent disagreement runs the OTHER way', () => {
  // No fracture plus one other favorable factor: original 2, modified 1.
  const r = withFavorable(['noPathologicalFracture', 'noVisceralMetastases']);
  assert.equal(r.original, 2);
  assert.equal(r.modified, 1);
  assert.equal(r.versionsDisagree, true);
  assert.equal(r.originalStrategy, 'palliative surgery');
  assert.equal(r.modifiedStrategy, 'conservative treatment');
});

test('exhaustively, there are exactly two disagreement shapes and neither version is always more optimistic', () => {
  const keys = ITEMS.map((i) => i.key);
  const seen = new Set();
  for (let mask = 0; mask < (1 << keys.length); mask += 1) {
    const chosen = keys.filter((_, idx) => mask & (1 << idx));
    const r = withFavorable(chosen);
    if (r.versionsDisagree) {
      seen.add(`${r.original}/${r.modified}/${chosen.includes('noPathologicalFracture')}`);
    }
  }
  assert.equal(seen.size, DISAGREEMENT_CASES.length, [...seen].join(' , '));
  for (const c of DISAGREEMENT_CASES) {
    assert.ok(seen.has(`${c.originalTotal}/${c.modifiedTotal}/${c.fractureAbsent}`), JSON.stringify(c));
  }
  // The two cases point in opposite directions.
  assert.deepEqual(DISAGREEMENT_CASES.map((c) => c.moreOptimistic).sort(), ['modification', 'original']);
});

test('dropping the fracture item never lowers the modified score below the original', () => {
  const keys = ITEMS.map((i) => i.key);
  for (let mask = 0; mask < (1 << keys.length); mask += 1) {
    const r = withFavorable(keys.filter((_, idx) => mask & (1 << idx)));
    assert.ok(r.modified <= r.original, 'the modified score drops at most the fracture point');
    assert.ok(r.original - r.modified <= 1);
  }
});

// THE overlapping histology items.
test('two items are both about the primary tumor and can both fire', () => {
  const aboutPrimary = ITEMS.filter((i) => i.aboutPrimary).map((i) => i.key);
  assert.deepEqual(aboutPrimary.sort(), ['favorablePrimary', 'notLungCancer']);

  const breast = withFavorable(['notLungCancer', 'favorablePrimary']);
  assert.equal(breast.histologyPoints, 2, 'a favorable non-lung primary scores both');
  const colon = withFavorable(['notLungCancer']);
  assert.equal(colon.histologyPoints, 1, 'a non-lung, non-favorable primary scores one');
  const lung = at();
  assert.equal(lung.histologyPoints, 0, 'a lung primary scores neither');
});

test('histology carries half of the modified scale', () => {
  const aboutPrimary = ITEMS.filter((i) => i.aboutPrimary).length;
  assert.equal(aboutPrimary * 2, MODIFIED_MAX);
  assert.match(at().bandText, /HALF THE SCALE|half the scale/);
});

// The reason for the modification.
test('the reason the fracture item was dropped is stated', () => {
  assert.match(at().bandText, /EXTREMITY group only/);
  assert.match(at().bandText, /tuned to different anatomy/);
});

// Input handling and scope.
test('every item is required and the direction is named in the message', () => {
  assert.equal(bauerScore({}).valid, false);
  assert.match(bauerScore({}).message, /higher score means a BETTER prognosis/);
});

test('the scope note refuses the operative decision and dates the derivation', () => {
  const r = at();
  assert.match(r.note, /does not decide whether to operate/);
  assert.match(r.note, /what was done in the derivation cohorts rather than what should be done/);
  assert.match(r.note, /does not account for modern systemic therapy/);
  assert.match(r.note, /not a reason to withhold an operation/);
});
