// spec-v90 §2.3: TIMI Risk Score for STEMI (Morrow 2000).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { timiStemi } from '../../lib/cardio-v90.js';

test('worked example: age 70 + anterior STE + time > 4 h = 4 points, 7.3% mortality', () => {
  const r = timiStemi({ age: 70, anteriorSteLbbb: 'yes', timeOver4h: 'yes' });
  assert.equal(r.valid, true);
  assert.equal(r.agePts, 2); // 65-74
  assert.equal(r.total, 4); // 2 + 1 + 1
  assert.equal(r.mortality, 7.3);
});

test('the 0 extreme: no risk factors, blank age -> 0.8% mortality', () => {
  const r = timiStemi({});
  assert.equal(r.total, 0);
  assert.equal(r.mortality, 0.8);
  assert.equal(r.ageProvided, false);
});

test('the 14 extreme: every variable positive at the top age band', () => {
  const r = timiStemi({
    age: 80, diabetesHtnAngina: 'yes', sbpLow: 'yes', hrHigh: 'yes',
    killip24: 'yes', weightLow: 'yes', anteriorSteLbbb: 'yes', timeOver4h: 'yes',
  });
  assert.equal(r.agePts, 3); // >= 75
  assert.equal(r.total, 14);
  assert.equal(r.mortality, 35.9); // > 8 band
});

test('age band points: <65 = 0, 65-74 = 2, >=75 = 3', () => {
  assert.equal(timiStemi({ age: 64 }).agePts, 0);
  assert.equal(timiStemi({ age: 65 }).agePts, 2);
  assert.equal(timiStemi({ age: 74 }).agePts, 2);
  assert.equal(timiStemi({ age: 75 }).agePts, 3);
});

test('a mortality band flip: score 8 -> 26.8%, score 9 -> 35.9%', () => {
  // 8 = age3 + sbp3 + hr2; 9 adds DM/HTN/angina
  const eight = timiStemi({ age: 80, sbpLow: 'yes', hrHigh: 'yes' });
  assert.equal(eight.total, 8);
  assert.equal(eight.mortality, 26.8);
  const nine = timiStemi({ age: 80, sbpLow: 'yes', hrHigh: 'yes', diabetesHtnAngina: 'yes' });
  assert.equal(nine.total, 9);
  assert.equal(nine.mortality, 35.9);
});

test('the weighted variables carry their published point values', () => {
  assert.equal(timiStemi({ sbpLow: 'yes' }).total, 3);
  assert.equal(timiStemi({ hrHigh: 'yes' }).total, 2);
  assert.equal(timiStemi({ killip24: 'yes' }).total, 2);
  assert.equal(timiStemi({ weightLow: 'yes' }).total, 1);
});
