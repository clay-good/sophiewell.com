// spec-v123 2.5: CES-D (Radloff 1977, NIMH public domain). 20 items 0-3, total
// 0-60; items 4/8/12/16 reverse-scored; >= 16 flags significant symptoms.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cesD } from '../../lib/psych-v123.js';

// spec-v1108: a completed questionnaire, with the items under test overridden.
//
// Four assertions below used to pass three or four items and read the rest as
// zeros -- which is the defect that wave fixed, not a test of the key. The four
// positively-worded items are REVERSE-scored, so an unanswered one was scoring 3
// and the "all 0" baseline of 12 was being borrowed by calls that answered
// nothing. Each now answers all twenty.
const answerAll = (overrides = {}) => {
  const all = {};
  for (let i = 1; i <= 20; i += 1) all[`q${i}`] = '0';
  return { ...all, ...overrides };
};

test('all items explicitly 0 -> the 4 positive items reverse to 3 each = 12', () => {
  const all = {};
  for (let i = 1; i <= 20; i += 1) all[`q${i}`] = '0';
  const r = cesD(all);
  assert.equal(r.valid, true);
  assert.equal(r.total, 12); // reverse-scored 4/8/12/16 each contribute 3
  assert.equal(r.abnormal, false);
});

test('reverse-scoring key: answering the positive items at "most of the time" -> 0 points', () => {
  const r = cesD(answerAll({ q4: '3', q8: '3', q12: '3', q16: '3' }));
  assert.equal(r.total, 0); // 3 -> 0 for each reverse item; every other item answered 0
});

test('negative items raise the score: band-flip across the >= 16 threshold', () => {
  // baseline (all 0) is 12; add 4 points -> 16
  const r = cesD(answerAll({ q6: '2', q9: '2' })); // 12 + 4 = 16
  assert.equal(r.total, 16);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /clinically significant depressive symptoms/);
});

test('worked depressed profile -> >= 16', () => {
  const r = cesD(answerAll({ q6: '3', q9: '3', q14: '3', q18: '3' }));
  assert.equal(r.total, 24);
  assert.equal(r.abnormal, true);
});

test('maximum: all negative items 3 and positive items 0 -> 60', () => {
  const all = {};
  for (let i = 1; i <= 20; i += 1) all[`q${i}`] = [4, 8, 12, 16].includes(i) ? '0' : '3';
  assert.equal(cesD(all).total, 60);
});

test('scalar / non-object fuzz arg yields a surfaced refusal, never NaN', () => {
  const r = cesD(9);
  assert.equal(r.valid, true);
  // spec-v1108: nothing was answered, so there is no total -- but there is also
  // no NaN, and the bounds are real numbers.
  assert.equal(r.total, null);
  assert.equal(r.answered, 0);
  assert.equal(Number.isFinite(r.low) && Number.isFinite(r.high), true);
  assert.doesNotMatch(JSON.stringify(r), /NaN|Infinity/);
});

// --- spec-v1108: the reverse-scored items made a blank worth three points ---

test('spec-v1108: an unadministered CES-D is not below the screening threshold', () => {
  const r = cesD({});
  assert.equal(r.answered, 0);
  assert.equal(r.unanswered, 20);
  assert.equal(r.total, null, '12 of 60 was four reverse-scored blanks, not a score');
  assert.equal(r.abnormal, false);
  assert.doesNotMatch(r.band, /below the 16-point screening threshold\./);
  assert.match(r.band, /not yet scorable/);
  assert.match(r.band, /0 of the 20 items/);
  assert.deepEqual([r.low, r.high], [0, 60]);
});

test('spec-v1108: a partial CES-D gives a RANGE, because it is not monotone', () => {
  // Rule 10: every other footing in this programme rests on the total being a
  // floor. Reverse scoring means an unanswered item can move it either way, so
  // the honest statement is the interval.
  const r = cesD({ q1: '0', q2: '0', q3: '0' });
  assert.equal(r.answered, 3);
  assert.deepEqual([r.low, r.high], [0, 51]);
  assert.match(r.band, /between 0 and 51 of 60/);
  assert.match(r.band, /reverse-scored, so a blank is not a zero in either direction/);
});

test('spec-v1108: a range already above 16 rules in; one wholly below rules out', () => {
  // Rule 13: the unanswered items cannot bring a floor of 18 back under 16.
  const rulesIn = cesD({ q1: '3', q2: '3', q3: '3', q5: '3', q6: '3', q7: '3' });
  assert.equal(rulesIn.abnormal, true);
  assert.match(rulesIn.band, /at least 18\/60/);
  assert.match(rulesIn.band, /can only raise it/);

  // With nineteen answered at 0 the ceiling is 15, which is under the threshold
  // whatever the twentieth is -- so the reassuring reading IS earned.
  const rulesOut = {};
  for (let i = 1; i <= 19; i += 1) rulesOut[`q${i}`] = i === 16 ? '3' : '0';
  const r = cesD(rulesOut);
  assert.ok(r.high < 16, `ceiling was ${r.high}`);
  assert.match(r.band, /below the 16-point screening threshold whatever the rest are/);
});
