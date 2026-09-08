// spec-v121 2.4: MGFA classification (Jaretzki 2000) + MG-ADL (Wolfe 1999). Class
// I (ocular) / II-IV (mild/moderate/severe, a or b subtype) / V (intubation);
// MG-ADL 8 items x 0-3 -> 0-24.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mgfa } from '../../lib/neuro-v121.js';

test('Class I: ocular only, no subtype, not flagged severe', () => {
  const r = mgfa({ severity: 'ocular' });
  assert.equal(r.valid, true);
  assert.equal(r.cls, 'I');
  assert.equal(r.abnormal, false);
  assert.equal(r.adlTotal, 0);
});

test('Class II with subtype a -> IIa, not severe-flagged', () => {
  const r = mgfa({ severity: 'mild', subtype: 'a' });
  assert.equal(r.cls, 'IIa');
  assert.equal(r.abnormal, false);
});

test('class-II vs class-IV band-flip with an MG-ADL total', () => {
  const ii = mgfa({ severity: 'mild', subtype: 'a', talking: '1' });
  const iv = mgfa({ severity: 'severe', subtype: 'b', breathing: '2', swallowing: '2', talking: '1' });
  assert.equal(ii.cls, 'IIa');
  assert.equal(ii.abnormal, false);
  assert.equal(iv.cls, 'IVb');
  assert.equal(iv.abnormal, true);
  assert.equal(iv.adlTotal, 5);
  assert.match(iv.band, /Class IVb/);
});

test('Class V intubation, no subtype, severe-flagged', () => {
  const r = mgfa({ severity: 'intubation' });
  assert.equal(r.cls, 'V');
  assert.equal(r.abnormal, true);
});

test('MG-ADL clamps each item to 0-3; total cannot exceed 24', () => {
  const r = mgfa({
    severity: 'moderate', subtype: 'a',
    talking: '9', chewing: '3', swallowing: '3', breathing: '3',
    hygiene: '3', rising: '3', diplopia: '3', ptosis: '3',
  });
  assert.equal(r.adlTotal, 24);
});

test('scalar / non-object fuzz arg yields a valid Class I, never NaN', () => {
  const r = mgfa(9);
  assert.equal(r.valid, true);
  assert.equal(r.cls, 'I');
  assert.equal(Number.isFinite(r.adlTotal), true);
});

test('spec-v1129: the MGFA subtype is not a default', () => {
  // `=== 'b' ? 'b' : 'a'` made every value that is not 'b' -- an unstated one
  // included -- into 'a', limb/axial-predominant. 'b' is the oropharyngeal and
  // respiratory form, the one that threatens the airway.
  const owed = mgfa({ severity: 'severe' });
  assert.equal(owed.subtypeOwed, true);
  assert.equal(owed.cls, 'IV');
  assert.match(owed.band, /subtype not stated/);
  assert.match(owed.band, /it is not a default/);
  // The explanation names both subtypes; what it must not do is ASSERT one.
  assert.doesNotMatch(owed.band, /weakness, limb\/axial-predominant/);

  // Stated either way, the class is complete.
  assert.equal(mgfa({ severity: 'severe', subtype: 'b' }).cls, 'IVb');
  assert.equal(mgfa({ severity: 'severe', subtype: 'a' }).cls, 'IVa');
  assert.equal(mgfa({ severity: 'severe', subtype: 'a' }).subtypeOwed, false);
});

test('spec-v1129: the two classes with no subtype are unaffected', () => {
  // Rule 25: the guard is scoped to the readings the input can move. Class I
  // (ocular) and Class V (intubation) carry no subtype at all.
  assert.equal(mgfa({ severity: 'ocular' }).subtypeOwed, false);
  assert.equal(mgfa({ severity: 'ocular' }).cls, 'I');
  assert.equal(mgfa({ severity: 'intubation' }).subtypeOwed, false);
  assert.equal(mgfa({ severity: 'intubation' }).cls, 'V');
});
