// spec-v614: the Ocular Trauma Score.
//
// The load-bearing tests are that the raw score can fall below the published table's floor of 0 and that no
// category is invented when it does, and that the result is always a distribution rather than a single
// predicted acuity.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ocularTraumaScore, categoryForRaw, ACUITY_BASE, DEDUCTIONS, CATEGORIES, OUTCOMES,
  PUBLISHED_FLOOR, TOTAL_DEDUCTIONS,
} from '../../lib/ocular-trauma-score-v614.js';

const NONE = Object.fromEntries(DEDUCTIONS.map((d) => [d.key, 'no']));
const at = (acuity, present = []) => ocularTraumaScore({
  acuity, ...NONE, ...Object.fromEntries(present.map((k) => [k, 'yes'])),
});

test('the published bases and deductions are carried exactly', () => {
  assert.deepEqual(ACUITY_BASE.map((a) => a.points), [60, 70, 80, 90, 100]);
  assert.deepEqual(DEDUCTIONS.map((d) => d.points), [-23, -17, -14, -11, -10]);
  assert.equal(TOTAL_DEDUCTIONS, -75);
});

test('the category bands are the published ones and are contiguous', () => {
  assert.deepEqual(CATEGORIES.map((c) => [c.min, c.max]),
    [[0, 44], [45, 65], [66, 80], [81, 91], [92, 100]]);
  for (let i = 1; i < CATEGORIES.length; i++) {
    assert.equal(CATEGORIES[i].min, CATEGORIES[i - 1].max + 1, `gap before OTS ${CATEGORIES[i].ots}`);
  }
  assert.equal(PUBLISHED_FLOOR, 0);
});

// THE only-positive-term structure.
test('the acuity is the only term that adds', () => {
  for (const d of DEDUCTIONS) assert.ok(d.points < 0, d.text);
  for (const a of ACUITY_BASE) assert.ok(a.points > 0, a.text);
  assert.ok(Math.abs(TOTAL_DEDUCTIONS) < ACUITY_BASE[ACUITY_BASE.length - 1].points,
    'the deductions cannot exceed the best base');
  assert.match(at('20-40').bandText, /ONLY TERM THAT ADDS/);
});

test('a pristine eye at the best acuity scores the maximum', () => {
  const r = at('20-40');
  assert.equal(r.raw, 100);
  assert.equal(r.ots, 5);
  assert.equal(r.deducted, 0);
});

// THE hole below the published floor.
test('the raw score falls below the published floor and no category is invented', () => {
  const allFive = at('nlp', DEDUCTIONS.map((d) => d.key));
  assert.equal(allFive.raw, -15);
  assert.equal(allFive.ots, null);
  assert.equal(allFive.probabilities, null);
  assert.equal(allFive.belowPublishedRange, true);
  assert.match(allFive.bandText, /NO CATEGORY IS RETURNED/);
});

test('the floor is breached even without both open-globe types', () => {
  // Rupture and perforating injury are different open-globe types; even excluding one, the score goes below 0.
  const r = at('nlp', ['rupture', 'endophthalmitis', 'retinalDetachment', 'apd']);
  assert.equal(r.raw, -1);
  assert.equal(r.ots, null);
  assert.equal(r.belowPublishedRange, true);
});

test('a raw score of exactly the floor is category 1, not outside', () => {
  assert.equal(categoryForRaw(0).ots, 1);
  assert.equal(categoryForRaw(-1), null);
  assert.equal(categoryForRaw(100).ots, 5);
  assert.equal(categoryForRaw(101), null);
});

test('the floor warning fires only below the floor', () => {
  assert.match(at('nlp', ['rupture', 'endophthalmitis', 'retinalDetachment', 'apd']).bandText, /THE PUBLISHED TABLE STARTS AT 0/);
  assert.doesNotMatch(at('20-40').bandText, /THE PUBLISHED TABLE STARTS AT 0/);
});

// THE distribution.
test('every category returns a full distribution that sums to 100', () => {
  for (const c of CATEGORIES) {
    assert.equal(c.probabilities.length, OUTCOMES.length);
    assert.equal(c.probabilities.reduce((a, b) => a + b, 0), 100, `OTS ${c.ots}`);
  }
});

test('a valid result carries the probabilities and the outcome labels together', () => {
  const r = at('20-200', ['apd']);
  assert.equal(r.ots, 3);
  assert.deepEqual(r.probabilities, [2, 11, 15, 28, 44]);
  assert.deepEqual(r.outcomes, OUTCOMES);
  assert.match(r.bandText, /20\/40 or better 44%/);
});

test('neither extreme is certain', () => {
  const worst = CATEGORIES.find((c) => c.ots === 1);
  const best = CATEGORIES.find((c) => c.ots === 5);
  assert.equal(worst.probabilities[4], 1, 'OTS 1 still reaches 20/40 or better in 1%');
  assert.equal(best.probabilities[0], 0);
  assert.equal(best.probabilities[1], 1, 'OTS 5 still lands at light perception or hand movements in 1%');
  assert.match(at('20-40').bandText, /NEITHER EXTREME IS CERTAIN/);
});

// THE narrowing bands.
test('the bands narrow as the prognosis improves', () => {
  const widths = CATEGORIES.map((c) => c.max - c.min + 1);
  assert.deepEqual(widths, [45, 21, 15, 11, 9]);
  for (let i = 1; i < widths.length; i++) assert.ok(widths[i] < widths[i - 1], `band ${i} is not narrower`);
});

// Input handling and scope.
test('the inputs are validated', () => {
  assert.equal(ocularTraumaScore({}).valid, false);
  assert.match(ocularTraumaScore({}).message, /Choose the initial visual acuity/);
  assert.match(ocularTraumaScore({ acuity: 'nlp', ...NONE, rupture: 'perhaps' }).message, /must be yes or no/);
  assert.equal(ocularTraumaScore({ acuity: 'counting-fingers', ...NONE }).valid, false);
});

test('the scope note keeps the score off diagnosis and off enucleation', () => {
  const r = at('nlp', ['rupture']);
  assert.match(r.note, /does not diagnose the injury/);
  assert.match(r.note, /does not decide whether to operate/);
  assert.match(r.note, /enucleate or to withhold repair/);
  assert.match(r.note, /does not predict what will happen to one patient/);
});
