// spec-v644: SLUMS (St. Louis University Mental Status) examination.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { slums, SLUMS_ITEMS } from '../../lib/slums-v644.js';

const MAXED = { education: 'hs' };
for (const it of SLUMS_ITEMS) MAXED[it.key] = String(it.max);

test('item maxima sum to 30', () => {
  const r = slums(MAXED);
  assert.equal(r.total, 30);
  assert.equal(r.band, 'normal');
});

test('META example: 22 with high-school education is mild neurocognitive disorder', () => {
  const r = slums({ education: 'hs', day: '1', year: '1', state: '1', money: '3', animals: '2', recall: '4', digits: '1', clock: '3', figures: '2', story: '4' });
  assert.equal(r.total, 22);
  assert.equal(r.band, 'mild neurocognitive disorder');
  assert.match(r.bandLabel, /SLUMS 22 of 30/);
  assert.match(r.bandLabel, /high-school education or above/);
});

// spec-v1016: the unnamed items are scored as an explicit 0 rather than left
// out, because an item nobody scored is no longer read as a zero -- these tests
// are about where the band cut points sit, on a complete exam.
const ZEROED = {};
for (const it of SLUMS_ITEMS) ZEROED[it.key] = '0';

test('education-adjusted bands: a score of 20 is dementia (HS) but MNCD (< HS)', () => {
  // story 8 + recall 5 + clock 4 + money 3 = 20.
  const base = { ...ZEROED, story: '8', recall: '5', clock: '4', money: '3' };
  const hs = slums({ education: 'hs', ...base });
  assert.equal(hs.total, 20);
  assert.equal(hs.band, 'dementia');
  const lessHs = slums({ education: 'less-hs', ...base });
  assert.equal(lessHs.total, 20);
  assert.equal(lessHs.band, 'mild neurocognitive disorder');
});

test('high-school boundary: 27 is normal, 26 is mild neurocognitive disorder', () => {
  // story 8 + recall 5 + clock 4 + figures 2 + digits 2 + money 3 + animals 3 = 27.
  const at27 = slums({ education: 'hs', ...ZEROED, story: '8', recall: '5', clock: '4', figures: '2', digits: '2', money: '3', animals: '3' });
  assert.equal(at27.total, 27);
  assert.equal(at27.band, 'normal');
  // Drop animals from 3 to 2 -> 26 -> mild neurocognitive disorder.
  const at26 = slums({ education: 'hs', ...ZEROED, story: '8', recall: '5', clock: '4', figures: '2', digits: '2', money: '3', animals: '2' });
  assert.equal(at26.total, 26);
  assert.equal(at26.band, 'mild neurocognitive disorder');
});

test('education is required', () => {
  const r = slums({ day: '1' });
  assert.equal(r.valid, false);
  assert.equal(r.code, 'MISSING_INPUT');
  assert.equal(r.field, 'education');
});

test('out-of-range item points are rejected', () => {
  assert.equal(slums({ education: 'hs', story: '9' }).valid, false); // max 8
  assert.equal(slums({ education: 'hs', day: '2' }).valid, false); // max 1
  assert.equal(slums({ education: 'hs', clock: '-1' }).valid, false);
  assert.equal(slums({ education: 'hs', money: '1.5' }).valid, false);
});

// spec-v1016: this asserted the defect -- an exam nobody had performed labelled
// "dementia". On SLUMS a higher score is a better one, so an unscored item can
// only ADD points: a partial total is a floor on the score and a ceiling on the
// severity. An incomplete exam can never be read as impaired, and the refusal
// says how many items are still to score.
test('an unscored exam is not an impaired one', () => {
  const r = slums({ education: 'hs' });
  assert.equal(r.valid, false);
  assert.equal(r.total, 0);
  assert.equal(r.unscored, 10);
  assert.match(r.message, /Score the remaining 10 of 10 items/);
  assert.match(r.message, /can only add to it/);
});
