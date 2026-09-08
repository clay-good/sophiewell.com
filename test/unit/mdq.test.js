// spec-v96 2.4: Mood Disorder Questionnaire bipolar-spectrum screen (Hirschfeld 2000).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mdq } from '../../lib/psych-v96.js';

const yesN = (n) => new Array(13).fill('no').map((v, i) => (i < n ? 'yes' : v));

test('positive screen requires all three gates', () => {
  const r = mdq({ symptoms: yesN(7), coOccurrence: 'yes', impairment: 'moderate' });
  assert.equal(r.positive, true);
  assert.equal(r.yesCount, 7);
});

test('serious impairment also satisfies the impairment gate', () => {
  const r = mdq({ symptoms: yesN(10), coOccurrence: 'yes', impairment: 'serious' });
  assert.equal(r.positive, true);
});

test('symptom gate miss (6 of 13) is negative and named', () => {
  const r = mdq({ symptoms: yesN(6), coOccurrence: 'yes', impairment: 'moderate' });
  assert.equal(r.positive, false);
  assert.equal(r.yesCount, 6);
  assert.match(r.band, /below the 7-item threshold/);
});

test('co-occurrence gate miss is negative and named', () => {
  const r = mdq({ symptoms: yesN(9), coOccurrence: 'no', impairment: 'serious' });
  assert.equal(r.positive, false);
  assert.match(r.band, /did not co-occur/);
});

test('impairment gate miss (minor) is negative and named', () => {
  const r = mdq({ symptoms: yesN(9), coOccurrence: 'yes', impairment: 'minor' });
  assert.equal(r.positive, false);
  assert.match(r.band, /below moderate/);
});

test('empty input is a safe negative', () => {
  const r = mdq({});
  assert.equal(r.positive, false);
  assert.equal(r.yesCount, 0);
});

// --- spec-v1112: a gate that was not answered has not been failed ---

test('spec-v1112: both gates met and the impairment unrated is not a negative screen', () => {
  const r = mdq({ symptoms: Array(13).fill(true), coOccurrence: true });
  assert.equal(r.valid, true);
  assert.equal(r.positive, false);
  assert.equal(r.blockedOnUnrated, true);
  assert.match(r.band, /Not yet a screen result/);
  assert.match(r.band, /A gate that was not answered has not been failed/);
  assert.doesNotMatch(r.band, /^Negative screen/);
  assert.deepEqual(r.outstanding, ['a functional-impairment rating is needed']);
});

test('spec-v1112: an unadministered MDQ is not a negative screen either', () => {
  // The first draft of this fix guarded only the impairment, on the reasoning
  // that the symptom items are checkboxes. They are yes/no selects that opened
  // on "No", so the tile opened on a negative screen.
  const r = mdq({});
  assert.equal(r.blockedOnUnrated, true);
  assert.equal(r.answeredSymptoms, 0);
  assert.doesNotMatch(r.band, /^Negative screen/);
  assert.match(r.band, /13 of the 13 symptom items are unanswered/);
  assert.match(r.band, /an answer to the co-occurrence question is needed/);
});

test('spec-v1112: the symptom gate settles once 7 YES is out of reach', () => {
  // Monotone: an unanswered item can only add a YES. With seven answered NO,
  // the remaining six cannot reach the 7-item threshold, so the gate is
  // genuinely failed and the negative screen is earned.
  const r = mdq({ symptoms: Array(7).fill('no'), coOccurrence: 'no', impairment: 'none' });
  assert.equal(r.blockedOnUnrated, false);
  assert.match(r.band, /^Negative screen/);

  // One fewer answered and it is still reachable, so the screen waits.
  const open = mdq({ symptoms: Array(6).fill('no') });
  assert.equal(open.blockedOnUnrated, true);
});

test('spec-v1112: a gate that WAS answered and failed still gives a negative screen', () => {
  // The MDQ's other two gates are checkboxes, so none ticked is a real "no"
  // (rule 4) -- six of thirteen symptoms is a negative screen however the
  // impairment is rated, and an unrated impairment does not hold that back.
  const few = mdq({ symptoms: [...Array(6).fill('yes'), ...Array(7).fill('no')], coOccurrence: true });
  assert.equal(few.blockedOnUnrated, false);
  assert.match(few.band, /^Negative screen/);

  const rated = mdq({ symptoms: Array(13).fill('yes'), coOccurrence: 'yes', impairment: 'minor' });
  assert.equal(rated.blockedOnUnrated, false);
  assert.match(rated.band, /impairment rated below moderate/);

  const allNo = mdq({ symptoms: Array(13).fill('no'), coOccurrence: 'no' });
  assert.equal(allNo.blockedOnUnrated, false);
  assert.match(allNo.band, /^Negative screen/);
});

test('spec-v1112: a complete positive screen is unchanged', () => {
  const r = mdq({ symptoms: Array(13).fill('yes'), coOccurrence: 'yes', impairment: 'moderate' });
  assert.equal(r.positive, true);
  assert.equal(r.blockedOnUnrated, false);
  assert.match(r.band, /all three gates met/);
});
