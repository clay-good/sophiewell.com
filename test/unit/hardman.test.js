// spec-v536: the Hardman index for ruptured AAA mortality.
// Worked-example tests: the five factors and their thresholds, the 0-5 range, and above all that the
// refuted "3 or more means certain death" reading is CARRIED WITH ITS REFUTATION at every qualifying score,
// and that no score ever reads as an instruction to deny surgery. Criteria and the refutation transcribed
// from Hardman and colleagues 1996 plus later validations (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hardman, HARDMAN_CRITERIA } from '../../lib/hardman-v536.js';

function score(over = {}) {
  const none = { age: 'no', creatinine: 'no', hemoglobin: 'no', unconscious: 'no', ecgIschemia: 'no' };
  return hardman({ ...none, ...over });
}

test('five factors, one point each', () => {
  assert.equal(HARDMAN_CRITERIA.length, 5);
  assert.deepEqual(HARDMAN_CRITERIA.map((c) => c.key),
    ['age', 'creatinine', 'hemoglobin', 'unconscious', 'ecgIschemia']);
});

test('the thresholds are the published ones, with the 190 creatinine value', () => {
  const byKey = Object.fromEntries(HARDMAN_CRITERIA.map((c) => [c.key, c]));
  assert.match(byKey.age.text, /over 76 years/);
  assert.match(byKey.creatinine.text, /over 190 micromol\/L/);
  assert.match(byKey.creatinine.detail, /180 micromol\/L; that is a transcription error/);
  assert.match(byKey.hemoglobin.text, /below 9\.0 g\/dL/);
  assert.match(byKey.ecgIschemia.text, /ST depression over 1 mm/);
});

test('the floor is 0 and the ceiling is 5', () => {
  assert.equal(score().total, 0);
  const all = score({ age: 'yes', creatinine: 'yes', hemoglobin: 'yes', unconscious: 'yes', ecgIschemia: 'yes' });
  assert.equal(all.total, 5);
});

test('EVERY score of 3 or more carries the refutation in the result itself', () => {
  for (const n of [3, 4, 5]) {
    const keys = HARDMAN_CRITERIA.slice(0, n).map((c) => c.key);
    const r = hardman(Object.fromEntries(HARDMAN_CRITERIA.map((c) => [c.key, keys.includes(c.key) ? 'yes' : 'no'])));
    assert.equal(r.total, n);
    assert.equal(r.atOrAboveThree, true);
    assert.match(r.band, /cannot be used as an absolute limit for denial of surgery/);
    assert.match(r.band, /77 percent/);
  }
});

test('the original 100 percent is always paired with its tiny denominator', () => {
  const three = score({ age: 'yes', creatinine: 'yes', hemoglobin: 'yes' });
  assert.match(three.band, /that group held only 8 patients/);
  assert.match(three.originalSeriesMortality, /only 8 patients/);
});

test('scores below 3 report the original series figures without claiming validation', () => {
  assert.match(score().band, /16 percent in the original series/);
  assert.match(score({ age: 'yes' }).band, /37 percent in the original series/);
  assert.match(score({ age: 'yes', creatinine: 'yes' }).band, /72 percent in the original series/);
  assert.equal(score({ age: 'yes' }).atOrAboveThree, false);
});

test('NO score reads as an instruction to deny surgery (the META example is a 3)', () => {
  for (let n = 0; n <= 5; n += 1) {
    const keys = HARDMAN_CRITERIA.slice(0, n).map((c) => c.key);
    const r = hardman(Object.fromEntries(HARDMAN_CRITERIA.map((c) => [c.key, keys.includes(c.key) ? 'yes' : 'no'])));
    assert.match(r.band, /does not identify patients who should be denied an operation/);
    assert.doesNotMatch(r.band, /withhold surgery|do not operate|not a surgical candidate/i);
  }
});

test('the copy names the individually non-significant predictors and the goals-of-care misuse', () => {
  const n = score().note;
  assert.match(n, /not individually significant predictors/);
  assert.match(n, /fatal without repair/);
  assert.match(n, /goals of care/);
  assert.match(n, /does not choose between open and endovascular repair/);
});

test('yes/no parsing and the guards', () => {
  assert.equal(hardman({}).valid, false);
  const partial = hardman({ age: 'yes', creatinine: 'no' });
  assert.equal(partial.valid, false);
  assert.match(partial.message, /hemoglobin/);
  assert.equal(score({ age: 'maybe' }).valid, false);
  assert.equal(hardman({ age: true, creatinine: 1, hemoglobin: false, unconscious: 0, ecgIschemia: 'no' }).total, 2);
});
