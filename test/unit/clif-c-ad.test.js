// spec-v201 2.2: CLIF-C AD score worked examples and band spread.
// Formula (EF-CLIF, verbatim): 10 * [0.03*age + 0.66*ln(creat) + 1.71*ln(INR)
// + 0.88*ln(WBC) - 0.05*Na + 8]. Five predictors; the spec-v201 draft omitted
// INR, the source governs (spec-v97).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clifcAd } from '../../lib/hepatology-gibleed-v201.js';

test('high CLIF-C AD -> high-risk band (worked example)', () => {
  const r = clifcAd({ age: 65, creatinine: 2.0, inr: 1.6, wbc: 12, sodium: 128 });
  assert.equal(r.valid, true);
  assert.equal(r.score, 70);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high-risk/);
});

test('low CLIF-C AD -> low-risk band', () => {
  const r = clifcAd({ age: 55, creatinine: 1.0, inr: 1.2, wbc: 6, sodium: 138 });
  assert.equal(r.score, 46.4);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /low-risk/);
});

test('mid CLIF-C AD -> intermediate band', () => {
  const r = clifcAd({ age: 60, creatinine: 1.5, inr: 1.4, wbc: 8, sodium: 132 });
  assert.equal(r.score, 58.7);
  assert.match(r.band, /intermediate-risk/);
});

test('formula matches a hand computation', () => {
  const age = 60, creat = 1.5, inr = 1.4, wbc = 8, na = 132;
  const expected = Math.round(10 * (0.03 * age + 0.66 * Math.log(creat) + 1.71 * Math.log(inr) + 0.88 * Math.log(wbc) - 0.05 * na + 8) * 10) / 10;
  assert.equal(clifcAd({ age, creatinine: creat, inr, wbc, sodium: na }).score, expected);
});

// spec-v1201: the message used to be one sentence for every fault -- "…all
// positive" -- because the range check and the missing check were one branch. A
// value the reader HAD entered came back as one of the values still owed.
test('non-positive lab -> the range, named, not "enter it"', () => {
  const r = clifcAd({ age: 60, creatinine: 0, inr: 1.4, wbc: 8, sodium: 132 });
  assert.equal(r.valid, false);
  assert.match(r.message, /creatinine must be greater than 0 and at most 40 mg\/dL/);
  assert.match(r.message, /Check the value entered/);
  assert.doesNotMatch(r.message, /^Enter /);
});

test('an out-of-range lab is not reported as a missing one', () => {
  const entered = clifcAd({ age: 60, creatinine: 250, inr: 1.4, wbc: 8, sodium: 132 });
  assert.match(entered.message, /creatinine must be greater than 0 and at most 40/);

  // A genuinely absent one still gets the other sentence.
  const absent = clifcAd({ age: 60, inr: 1.4, wbc: 8, sodium: 132 });
  assert.match(absent.message, /^Enter the creatinine in mg\/dL\./);

  // And the sodium keeps its own two-sided bound.
  assert.match(clifcAd({ age: 60, creatinine: 1.5, inr: 1.4, wbc: 8, sodium: 2000 }).message,
    /sodium must be between 100 and 180 mmol\/L/);
});

test('missing INR -> complete-the-fields', () => {
  const r = clifcAd({ age: 60, creatinine: 1.5, wbc: 8, sodium: 132 });
  assert.equal(r.valid, false);
});
