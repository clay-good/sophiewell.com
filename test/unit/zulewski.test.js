// spec-v608: the Zulewski clinical score.
//
// The load-bearing tests are that the age correction exists at all, and that it alone moves the band at BOTH
// published boundaries - which is what makes dropping it a scoring error rather than a rounding detail.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  zulewskiScore, SYMPTOMS, SIGNS, BANDS, AGE_CORRECTION_CUTOFF, AGE_CORRECTION_POINTS, ITEM_MAX, CORRECTED_MAX,
} from '../../lib/zulewski-v608.js';

const ALL = [...SYMPTOMS, ...SIGNS];
function at(age, positives = []) {
  const input = { age: String(age) };
  for (const i of ALL) input[i.key] = positives.includes(i.key) ? 'yes' : 'no';
  return zulewskiScore(input);
}

test('the instrument is 7 symptoms and 5 signs, one point each', () => {
  assert.equal(SYMPTOMS.length, 7);
  assert.equal(SIGNS.length, 5);
  assert.equal(ALL.length, ITEM_MAX);
  assert.equal(new Set(ALL.map((i) => i.key)).size, ITEM_MAX, 'keys are unique');
});

// THE age correction.
test('one point is added under 55 and not at 55 or over', () => {
  assert.equal(at(54).ageCorrection, AGE_CORRECTION_POINTS);
  assert.equal(at(AGE_CORRECTION_CUTOFF).ageCorrection, 0);
  assert.equal(at(56).ageCorrection, 0);
});

test('a patient under 55 with no clinical findings scores 1, not 0', () => {
  const young = at(30);
  const old = at(60);
  assert.equal(young.score, 1);
  assert.equal(old.score, 0);
  assert.equal(young.itemPoints, 0);
  assert.match(young.bandText, /scores 1, not 0/);
});

test('the age point is worth exactly as much as any clinical item', () => {
  assert.equal(at(30).score, at(60, ['ankleReflex']).score);
});

test('the corrected maximum is 13, not 12', () => {
  assert.equal(CORRECTED_MAX, 13);
  assert.equal(ITEM_MAX, 12);
  const worstYoung = at(30, ALL.map((i) => i.key));
  assert.equal(worstYoung.score, CORRECTED_MAX);
  assert.equal(at(60, ALL.map((i) => i.key)).score, ITEM_MAX);
});

// THE consequence: the age point alone moves the band at BOTH boundaries.
test('the age point alone moves the band at both published boundaries', () => {
  const lower = at(40, ['sweating', 'hoarseness']);            // 2 items -> 3
  assert.equal(lower.uncorrectedScore, 2);
  assert.equal(lower.uncorrectedBand, 'Euthyroid');
  assert.equal(lower.score, 3);
  assert.equal(lower.band, 'Intermediate');
  assert.equal(lower.bandChangedByAge, true);

  const upper = at(40, ['sweating', 'hoarseness', 'paresthesia', 'drySkin', 'constipation']); // 5 -> 6
  assert.equal(upper.uncorrectedScore, 5);
  assert.equal(upper.uncorrectedBand, 'Intermediate');
  assert.equal(upper.score, 6);
  assert.equal(upper.band, 'Overt hypothyroid range');
  assert.equal(upper.bandChangedByAge, true);
});

test('the same findings in a patient of 55 or over stay in the lower band', () => {
  assert.equal(at(60, ['sweating', 'hoarseness']).band, 'Euthyroid');
  assert.equal(at(60, ['sweating', 'hoarseness', 'paresthesia', 'drySkin', 'constipation']).band, 'Intermediate');
});

test('the band change is called out in the result text', () => {
  assert.match(at(40, ['sweating', 'hoarseness']).bandText, /the age point alone moves the band/);
  assert.doesNotMatch(at(40, ['sweating']).bandText, /moves the band/);
});

// The published bands.
test('the bands are 2 or below, 3 to 5, and above 5', () => {
  assert.deepEqual(BANDS.map((b) => b.max), [2, 5, CORRECTED_MAX]);
  assert.equal(at(60, ['sweating', 'hoarseness']).band, 'Euthyroid');
  assert.equal(at(60, ['sweating', 'hoarseness', 'paresthesia']).band, 'Intermediate');
  assert.equal(at(60, ['sweating', 'hoarseness', 'paresthesia', 'drySkin', 'constipation', 'hearing']).band, 'Overt hypothyroid range');
});

// THE three skin items.
test('the three skin items are separate and are not the same question', () => {
  const skin = ['drySkin', 'coarseSkin', 'coldSkin'];
  for (const k of skin) assert.ok(ALL.some((i) => i.key === k), k);
  assert.ok(SYMPTOMS.some((i) => i.key === 'drySkin'), 'dry skin is a symptom');
  assert.ok(SIGNS.some((i) => i.key === 'coarseSkin'), 'coarse skin is a sign');
  assert.ok(SIGNS.some((i) => i.key === 'coldSkin'), 'cold skin is a sign');
  assert.equal(at(60, skin).score, 3, 'three points, not one');
  assert.match(at(60).bandText, /QUARTER of the instrument/);
});

// THE scope limit.
test('the result says the score does not correlate with TSH', () => {
  const r = at(60, ALL.map((i) => i.key));
  assert.match(r.bandText, /does NOT correlate with TSH/i);
  assert.match(r.bandText, /reason to MEASURE TSH, never a substitute/);
});

test('the Billewicz lineage is stated', () => {
  assert.match(at(60).bandText, /originally chosen by Billewicz/);
});

test('no predictive values are reported', () => {
  const r = at(60, ALL.map((i) => i.key));
  assert.doesNotMatch(r.bandText, /\d+(\.\d+)?%/);
  assert.match(r.note, /single-sourced and are not reported/);
});

test('the inputs are validated', () => {
  assert.equal(zulewskiScore({}).valid, false);
  assert.match(zulewskiScore({}).message, /answer all 12 items/);
  const partial = { age: '40' };
  for (const i of ALL.slice(0, 5)) partial[i.key] = 'no';
  assert.equal(zulewskiScore(partial).valid, false);
  assert.match(zulewskiScore({ age: '200' }).message, /between 0 and 120/);
});

test('the scope note separates suspicion from diagnosis and dosing', () => {
  const r = at(60);
  assert.match(r.note, /does not diagnose hypothyroidism/);
  assert.match(r.note, /does not start, stop or dose levothyroxine/);
});
