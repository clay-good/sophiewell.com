// spec-v910: the non-acetaminophen arm of the King's College criteria. Two limbs, and a negative
// that is not reassurance.

import test from 'node:test';
import assert from 'node:assert/strict';
import { kingsCollegeNonApap, KINGS_NONAPAP_NOTE, ETIOLOGY_OPTIONS } from '../../lib/kings-college-nonapap-v910.js';

test('kings-college-nonapap: the clotting is required, because both limbs are written on it', () => {
  assert.equal(kingsCollegeNonApap({}).valid, false);
  assert.match(kingsCollegeNonApap({ age: 55 }).message, /INR or a prothrombin time/);
  assert.equal(kingsCollegeNonApap({ pt: 40 }).valid, true);
});

test('kings-college-nonapap: the first limb is met on the clotting alone', () => {
  const r = kingsCollegeNonApap({ inr: 7 });
  assert.equal(r.met, true);
  assert.equal(r.firstLimbMet, true);
  assert.equal(r.secondLimbMet, false);
  assert.match(r.band, /whatever the grade of encephalopathy/);
});

test('kings-college-nonapap: a prothrombin time above 100 seconds does the same', () => {
  assert.equal(kingsCollegeNonApap({ pt: 101 }).firstLimbMet, true);
  assert.equal(kingsCollegeNonApap({ pt: 100 }).firstLimbMet, false);
  assert.equal(kingsCollegeNonApap({ inr: 6.5 }).firstLimbMet, false);
  assert.equal(kingsCollegeNonApap({ inr: 6.6 }).firstLimbMet, true);
});

test('kings-college-nonapap: three of the five factors meet the second limb', () => {
  const r = kingsCollegeNonApap({ inr: 4, age: 52, etiology: 'seronegative', jaundiceToEncephalopathyDays: 10, bilirubin: 12 });
  assert.equal(r.secondLimbMet, true);
  assert.equal(r.metCount, 4);
  assert.equal(r.firstLimbMet, false);
  assert.match(r.band, /three are needed/);
});

test('kings-college-nonapap: two of five is not enough', () => {
  const r = kingsCollegeNonApap({ inr: 4, age: 52, etiology: 'other', jaundiceToEncephalopathyDays: 2, bilirubin: 5 });
  assert.equal(r.met, false);
  assert.equal(r.metCount, 2);
});

test('kings-college-nonapap: the age band excludes its own boundaries', () => {
  const at = (age) => kingsCollegeNonApap({ inr: 2, age }).factors.find((f) => f.key === 'age').met;
  assert.equal(at(9), true);
  assert.equal(at(10), false);
  assert.equal(at(40), false);
  assert.equal(at(41), true);
});

test('kings-college-nonapap: only three of the four causes count', () => {
  const which = (etiology) => kingsCollegeNonApap({ inr: 2, etiology }).factors.find((f) => f.key === 'etiology').met;
  assert.equal(which('seronegative'), true);
  assert.equal(which('halothane'), true);
  assert.equal(which('idiosyncratic-drug'), true);
  assert.equal(which('other'), false);
  assert.equal(which(undefined), false);
});

test('kings-college-nonapap: the jaundice interval is strictly more than 7 days', () => {
  const at = (d) => kingsCollegeNonApap({ inr: 2, jaundiceToEncephalopathyDays: d }).factors.find((f) => f.key === 'jaundice-interval').met;
  assert.equal(at(7), false);
  assert.equal(at(8), true);
});

test('kings-college-nonapap: 300 micromol/L and 17.5 mg/dL are the same threshold', () => {
  const bili = (v, u) => kingsCollegeNonApap({ inr: 2, bilirubin: v, bilirubinUnit: u }).factors.find((f) => f.key === 'bilirubin').met;
  assert.equal(bili(17.6, 'mg/dl'), true);
  assert.equal(bili(17.4, 'mg/dl'), false);
  assert.equal(bili(310, 'umol/l'), true);
  assert.equal(bili(290, 'umol/l'), false);
});

test('kings-college-nonapap: a factor with nothing entered is unknown, not absent', () => {
  const r = kingsCollegeNonApap({ inr: 2 });
  assert.equal(r.unknownCount, 3);
  assert.equal(r.factors.find((f) => f.key === 'age').met, null);
  assert.match(r.band, /not entered/);
});

test('kings-college-nonapap: the not-sensitive line and the referral line print on every result', () => {
  for (const args of [{ inr: 7 }, { inr: 1.1 }]) {
    const r = kingsCollegeNonApap(args);
    assert.match(r.sensitivityNote, /not meeting them is not reassurance/);
    assert.match(r.referralNote, /reason to refer to a transplant center, not a decision/);
    assert.match(r.armNote, /different set of variables entirely/);
    assert.match(r.wordingNote, /indeterminate or seronegative hepatitis/);
    assert.match(r.scopeNote, /does not decide on transplantation/);
  }
  assert.match(KINGS_NONAPAP_NOTE, /never meet them/);
  assert.equal(ETIOLOGY_OPTIONS.length, 4);
});
