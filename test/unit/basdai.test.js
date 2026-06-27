// spec-v156 2.1: BASDAI (Garrett 1994). Six 0-10 items; the chief scoring nuance
// is the morning-stiffness pair (Q5, Q6) averaged before being added, then the
// whole divided by 5: BASDAI = [Q1 + Q2 + Q3 + Q4 + (Q5 + Q6)/2] / 5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { basdai } from '../../lib/rheum-ob-v156.js';

test('tile example: the (Q5+Q6)/2 term is exercised', () => {
  // 4 + 6 + 2 + 3 + (5+7)/2=6 => 21 / 5 = 4.2
  const r = basdai({ q1: '4', q2: '6', q3: '2', q4: '3', q5: '5', q6: '7' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 4.2);
  assert.equal(r.abnormal, true);
  assert.ok(r.band.startsWith('BASDAI 4.2 '));
  assert.match(r.band, /active disease/);
});

test('the morning-stiffness pair is averaged, not summed flat', () => {
  // If Q5+Q6 were summed flat the score would differ. With Q5=Q6=10 the pair
  // contributes (10+10)/2 = 10, not 20: [0+0+0+0+10]/5 = 2.0.
  const r = basdai({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 10, q6: 10 });
  assert.equal(r.score, 2);
  // A flat sum would have given (0+0+0+0+20)/5 = 4.0; assert it did NOT.
  assert.notEqual(r.score, 4);
});

test('the >= 4 active-disease threshold', () => {
  // All items 4 => [4+4+4+4+4]/5 = 4.0 (exactly at the threshold => active).
  const at = basdai({ q1: 4, q2: 4, q3: 4, q4: 4, q5: 4, q6: 4 });
  assert.equal(at.score, 4);
  assert.equal(at.abnormal, true);
  // All items below => lower activity.
  const below = basdai({ q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3 });
  assert.equal(below.score, 3);
  assert.equal(below.abnormal, false);
  assert.match(below.band, /lower activity/);
});

test('bounds: 0 floor and 10 ceiling; a missing or out-of-range item is valid:false', () => {
  assert.equal(basdai({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0 }).score, 0);
  assert.equal(basdai({ q1: 10, q2: 10, q3: 10, q4: 10, q5: 10, q6: 10 }).score, 10);
  assert.equal(basdai({ q1: 4, q2: 6, q3: 2, q4: 3, q5: 5 }).valid, false);
  assert.equal(basdai({ q1: 4, q2: 6, q3: 2, q4: 3, q5: 5, q6: 11 }).valid, false);
  assert.equal(basdai({ q1: 4, q2: 6, q3: 2, q4: 3, q5: 5, q6: -1 }).valid, false);
  assert.equal(basdai({}).valid, false);
  assert.match(basdai({}).message, /six/);
});
