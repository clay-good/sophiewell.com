// spec-v678: MELD 3.0 (Model for End-Stage Liver Disease, updated form).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { meld3 } from '../../lib/meld3-v678.js';

// Worked example (female, bili 4.0, Na 130, INR 2.0, creat 2.0, albumin 2.5):
//   1.33*1 + 4.56*ln4 + 0.82*7 - 0.24*7*ln4 + 9.09*ln2 + 11.14*ln2
//   + 1.85*1 - 1.83*1*ln2 + 6 = 31.666... -> rounds to 32.
test('worked example rounds to 32', () => {
  const r = meld3({ sex: 'female', bilirubin: '4.0', inr: '2.0', creatinine: '2.0', sodium: '130', albumin: '2.5' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 32);
  assert.equal(r.tier, 'very-high');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /MELD 3.0 32\/40/);
});

// The same case as male drops the 1.33 sex term: raw 30.336 -> 30.
test('male drops the 1.33 female term (32 -> 30)', () => {
  const r = meld3({ sex: 'male', bilirubin: '4.0', inr: '2.0', creatinine: '2.0', sodium: '130', albumin: '2.5' });
  assert.equal(r.score, 30);
});

// All-normal labs floor to the minimum: bili/INR/creat = 1 -> their ln terms vanish,
// Na 137 and albumin 3.5 zero their terms, so raw = 6 -> score 6 (the floor).
test('all-minimal inputs give the score floor of 6', () => {
  const r = meld3({ sex: 'male', bilirubin: '0.5', inr: '0.9', creatinine: '0.8', sodium: '140', albumin: '4.0' });
  assert.equal(r.score, 6);
  assert.equal(r.tier, 'lower');
  assert.equal(r.abnormal, false);
});

test('score is bounded to a maximum of 40', () => {
  const r = meld3({ sex: 'female', bilirubin: '50', inr: '10', creatinine: '8', sodium: '120', albumin: '1.0' });
  assert.equal(r.score, 40);
});

test('bounds are applied: creatinine capped at 3.0, sodium at 125-137, albumin 1.5-3.5', () => {
  // creatinine 8 is capped to 3.0; a second run at exactly 3.0 must match.
  const capped = meld3({ sex: 'male', bilirubin: '2', inr: '1.5', creatinine: '8', sodium: '130', albumin: '2.5' });
  const atCap = meld3({ sex: 'male', bilirubin: '2', inr: '1.5', creatinine: '3.0', sodium: '130', albumin: '2.5' });
  assert.equal(capped.score, atCap.score);
  // sodium 120 clamps to 125; albumin 1.0 clamps to 1.5.
  const naLow = meld3({ sex: 'male', bilirubin: '2', inr: '1.5', creatinine: '2', sodium: '120', albumin: '2.5' });
  const naAt = meld3({ sex: 'male', bilirubin: '2', inr: '1.5', creatinine: '2', sodium: '125', albumin: '2.5' });
  assert.equal(naLow.score, naAt.score);
});

test('dialysis sets creatinine to 3.0 regardless of the entered value', () => {
  const dial = meld3({ sex: 'male', bilirubin: '2', inr: '1.5', creatinine: '1.0', sodium: '130', albumin: '2.5', dialysis: true });
  const cr3 = meld3({ sex: 'male', bilirubin: '2', inr: '1.5', creatinine: '3.0', sodium: '130', albumin: '2.5' });
  assert.equal(dial.score, cr3.score);
});

test('inputs are validated', () => {
  assert.equal(meld3({}).valid, false);
  assert.equal(meld3({}).code, 'MISSING_INPUT');
  assert.equal(meld3({ sex: 'female', bilirubin: '2', inr: '1.5', creatinine: '2', sodium: '130' }).field, 'albumin');
  assert.equal(meld3({ sex: 'x', bilirubin: '2', inr: '1.5', creatinine: '2', sodium: '130', albumin: '2.5' }).field, 'sex');
});
