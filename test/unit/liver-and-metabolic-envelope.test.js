// spec-v1229: the clamp is not the guard, on the liver scores -- and a log is
// not a guard either.
//
// `meld30` clamps sodium to 125-137 and albumin to 1.5-3.5 because OPTN says to.
// Those are the allocation score's operational bounds, and clamping a sodium of
// 120 to 125 is what the score IS. It is not a plausibility check, and it was
// standing in for one: a sodium of 2000 mEq/L was clamped to 137 and reported as
// a transplant-priority score.
//
// `childPugh` is the reassuring direction. Its albumin band is `> 3.5 -> 1
// point`, the BEST of the three, so an albumin of 70 g/dL scored the healthiest
// liver there is.
//
// And in lib/endo-v136.js every reading is a log of a value or a comparison
// against a cutoff, so an impossible number never looked impossible from inside
// the formula: a fasting glucose of 20000 mg/dL gave "QUICKI 0.1859" and "TyG
// index 14.22", each printed beside its own reference range as though it were
// one more reading.
//
// Every envelope and every sentence is BOUNDS / boundsAdvisory. No clinical
// number, and no OPTN operational bound, is decided here.
import test from 'node:test';
import assert from 'node:assert/strict';

import { meld30, childPugh, maddreyDf, lille } from '../../lib/scoring-v4.js';
import { quicki, tygIndex, metabolicSyndrome } from '../../lib/endo-v136.js';

const MELD_OK = { bilirubin: 2.0, inr: 1.5, creatinine: 1.3, sodium: 135, albumin: 3.0, sex: 'M', hadDialysisTwiceLastWeek: false };

test('meld30 refuses each impossible lab rather than clamping it into the score', () => {
  assert.throws(() => meld30({ ...MELD_OK, sodium: 2000 }), /plausible range for serum sodium/);
  assert.throws(() => meld30({ ...MELD_OK, albumin: 70 }), /plausible range for serum albumin/);
  assert.throws(() => meld30({ ...MELD_OK, creatinine: 250 }), /plausible range for serum creatinine/);
  assert.throws(() => meld30({ ...MELD_OK, bilirubin: 600 }), /plausible range for total bilirubin/);
  // The OPTN clamps themselves are untouched: 120 still scores as 125.
  assert.equal(meld30(MELD_OK).score, 18);
  assert.equal(meld30({ ...MELD_OK, sodium: 120 }).score, meld30({ ...MELD_OK, sodium: 125 }).score);
});

test('child-pugh refuses the albumin that scored its healthiest band', () => {
  assert.throws(() => childPugh({ bilirubin: 2, albumin: 70, inr: 1.5, ascites: 'none', encephalopathy: 'none' }),
    /plausible range for serum albumin/);
  assert.equal(childPugh({ bilirubin: 2, albumin: 3, inr: 1.5, ascites: 'none', encephalopathy: 'none' }).score, 7);
});

test('maddrey and lille refuse the labs they take a log or a difference of', () => {
  assert.throws(() => maddreyDf({ patientPtSec: 20, controlPtSec: 12, bilirubinMgDl: 600 }), /total bilirubin/);
  assert.equal(maddreyDf({ patientPtSec: 20, controlPtSec: 12, bilirubinMgDl: 10 }).severe, true);
  const L = { ageYears: 50, albuminGDl: 3, creatinineMgDl: 0.9, bilirubinDay0MgDl: 10, bilirubinDay7MgDl: 6, ptSec: 20 };
  assert.throws(() => lille({ ...L, albuminGDl: 70 }), /serum albumin/);
  assert.throws(() => lille({ ...L, creatinineMgDl: 250 }), /serum creatinine/);
  assert.throws(() => lille({ ...L, bilirubinDay0MgDl: 600 }), /total bilirubin/);
  assert.throws(() => lille({ ...L, bilirubinDay7MgDl: 600 }), /total bilirubin/);
  assert.equal(lille(L).nonResponder, false);
});

test('quicki and tyg refuse a glucose no reference range covers', () => {
  assert.equal(quicki({ insulin: 12, glucose: 20000 }).valid, false);
  assert.match(quicki({ insulin: 12, glucose: 20000 }).message, /serum glucose/);
  assert.equal(quicki({ insulin: 12, glucose: 100 }).value, 0.3248);
  assert.equal(tygIndex({ tg: 150, glucose: 20000 }).valid, false);
  assert.equal(tygIndex({ tg: 150, glucose: 100 }).valid, true);
  // A blank field is still asked for, not called out of range.
  assert.match(quicki({ insulin: 12 }).message, /^Enter fasting insulin/);
});

test('metabolic-syndrome refuses the vitals its criteria compare', () => {
  const ms = { definition: 'harmonized', sex: 'male', waistStandard: 'us', waist: 110, tg: 200, hdl: 35, sbp: 128, dbp: 82, glucose: 105 };
  assert.match(metabolicSyndrome({ ...ms, sbp: 3000 }).message, /systolic blood pressure/);
  assert.match(metabolicSyndrome({ ...ms, dbp: 2000 }).message, /diastolic blood pressure/);
  assert.match(metabolicSyndrome({ ...ms, glucose: 20000 }).message, /serum glucose/);
  assert.equal(metabolicSyndrome(ms).valid, true);
  assert.match(metabolicSyndrome({ ...ms, sbp: null }).message, /^Choose the definition/);
});
