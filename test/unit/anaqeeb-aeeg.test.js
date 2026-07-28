// spec-v560: the al Naqeeb aEEG amplitude classification.
//
// The load-bearing tests are the two holes in the classification, which a three-way classifier with two
// thresholds looks like it should not have, and the strict separation of the seizure flag.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  anaqeebAeeg, ANAQEEB_CATEGORIES, UPPER_THRESHOLD, LOWER_THRESHOLD,
} from '../../lib/anaqeeb-aeeg-v560.js';

const at = (upper, lower, extra = {}) => anaqeebAeeg({
  upperMargin: String(upper), lowerMargin: String(lower), ...extra,
});

test('the thresholds are the published ones', () => {
  assert.equal(UPPER_THRESHOLD, 10);
  assert.equal(LOWER_THRESHOLD, 5);
});

test('there are exactly three categories', () => {
  assert.deepEqual(ANAQEEB_CATEGORIES.map((c) => c.value),
    ['normal', 'moderately-abnormal', 'suppressed']);
});

test('the three categories classify as published', () => {
  assert.equal(at(37.5, 8).category, 'normal');
  assert.equal(at(20, 3).category, 'moderately-abnormal');
  assert.equal(at(7, 3).category, 'suppressed');
});

// THE holes.
test('an upper margin of exactly 10 falls in no category', () => {
  for (const lower of [1, 5, 8]) {
    const r = at(10, lower);
    assert.equal(r.valid, true);
    assert.equal(r.classified, false, `lower ${lower}`);
    assert.equal(r.category, null);
    assert.match(r.bandText, /falls in NO published category/);
  }
});

test('an upper margin below 10 with a lower margin above 5 falls in no category', () => {
  const r = at(9, 6);
  assert.equal(r.valid, true);
  assert.equal(r.classified, false);
  assert.equal(r.category, null);
  assert.match(r.bandText, /matches no published category/);
});

test('the classification is not exhaustive, and the tile never rounds to a nearest category', () => {
  assert.equal(at(10, 8).category, null);
  assert.equal(at(10.1, 8).category, 'normal');
  assert.equal(at(9.9, 4).category, 'suppressed');
});

// Boundaries that ARE defined.
test('the lower-margin boundary of exactly 5 is moderately abnormal, per the original', () => {
  const r = at(20, LOWER_THRESHOLD);
  assert.equal(r.category, 'moderately-abnormal');
  assert.equal(r.onLowerBoundary, true);
  assert.match(r.bandText, /differ by one glyph/);
});

test('the glyph divergence is disclosed only at a lower margin of exactly 5', () => {
  assert.doesNotMatch(at(20, 4).bandText, /differ by one glyph/);
  assert.doesNotMatch(at(20, 8).bandText, /differ by one glyph/);
});

test('a lower margin just above 5 with a high upper margin is normal', () => {
  assert.equal(at(20, 5.1).category, 'normal');
});

// The seizure flag stays separate.
test('seizures never change the amplitude category', () => {
  assert.equal(at(37.5, 8, { seizures: 'yes' }).category, 'normal');
  assert.equal(at(37.5, 8, { seizures: 'no' }).category, 'normal');
});

test('a normal amplitude with seizures is reported as both, not merged', () => {
  const r = at(37.5, 8, { seizures: 'yes' });
  assert.equal(r.categoryLabel, 'Normal amplitude');
  assert.equal(r.seizures, true);
  assert.match(r.bandText, /never folded into the amplitude category/);
});

test('the seizure flag is optional and reported as null when absent', () => {
  assert.equal(at(37.5, 8).seizures, null);
});

test('the seizure flag is reported even when no category applies', () => {
  const r = at(10, 8, { seizures: 'yes' });
  assert.equal(r.classified, false);
  assert.equal(r.seizures, true);
});

// Input handling.
test('missing margins are refused', () => {
  assert.equal(anaqeebAeeg({}).valid, false);
  assert.equal(anaqeebAeeg({ upperMargin: '20' }).valid, false);
});

test('a lower margin above the upper margin is refused', () => {
  const r = at(5, 20);
  assert.equal(r.valid, false);
  assert.match(r.message, /cannot exceed the upper margin/);
});

test('out-of-range margins are refused', () => {
  assert.equal(at(-1, 0).valid, false);
  assert.equal(at(500, 8).valid, false);
});

test('the result states what the classification does not assess', () => {
  const r = at(37.5, 8);
  assert.match(r.bandText, /Sleep-wake cycling is not assessed/);
  assert.match(r.bandText, /not a therapeutic hypothermia eligibility criterion/);
});

test('the scope note names the device dependence and the seizure limitation', () => {
  const r = at(20, 3);
  assert.match(r.note, /device and montage dependent/);
  assert.match(r.note, /cannot exclude seizures/);
  assert.match(r.note, /not a therapeutic hypothermia eligibility criterion/);
});
