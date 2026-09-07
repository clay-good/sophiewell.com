// spec-v89 §2.2: King's College Criteria (acetaminophen-induced acute liver
// failure) - transplant-referral rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kingsCollege } from '../../lib/rheum-periop-v89.js';

test('pH limb: arterial pH < 7.30 after resuscitation meets criteria', () => {
  const r = kingsCollege({ ph: 7.20 });
  assert.equal(r.valid, true);
  assert.equal(r.meets, true);
  assert.equal(r.phLimb, true);
  assert.match(r.band, /Meets King’s College Criteria/);
});

test('pH limb negative: pH >= 7.30 does not meet via pH', () => {
  const r = kingsCollege({ ph: 7.35 });
  assert.equal(r.meets, false);
  assert.equal(r.phLimb, false);
});

test('three-part limb: INR + creatinine + grade III/IV encephalopathy', () => {
  const r = kingsCollege({ inr: 7, creatinine: 4.0, creatinineUnit: 'mg/dl', encephalopathy: 'yes' });
  assert.equal(r.meets, true);
  assert.equal(r.threePartComplete, true);
  assert.equal(r.threePartMet, true);
  assert.equal(r.coag, true);
  assert.equal(r.creatHigh, true);
});

test('three-part limb in µmol/L units (creatinine > 300)', () => {
  const r = kingsCollege({ pt: 110, creatinine: 320, creatinineUnit: 'umol/l', encephalopathy: 'yes' });
  assert.equal(r.coag, true); // PT > 100 s
  assert.equal(r.creatHigh, true); // 320 > 300 µmol/L
  assert.equal(r.threePartMet, true);
});

test('incomplete three-part limb is reported incomplete, never a false negative', () => {
  // INR and encephalopathy present, creatinine missing -> limb incomplete.
  const r = kingsCollege({ inr: 7, encephalopathy: 'yes' });
  assert.equal(r.threePartComplete, false);
  assert.equal(r.threePartMet, false);
  assert.equal(r.meets, false);
  assert.match(r.band, /incomplete/i);
});

test('three-part limb not met when one component is below threshold', () => {
  const r = kingsCollege({ inr: 5, creatinine: 4.0, creatinineUnit: 'mg/dl', encephalopathy: 'yes' });
  assert.equal(r.threePartComplete, true);
  assert.equal(r.coag, false); // INR 5 <= 6.5
  assert.equal(r.threePartMet, false);
  assert.equal(r.meets, false);
});

test('modified lactate limb: > 3.0 after resuscitation', () => {
  const r = kingsCollege({ lactate: 3.4, lactateTiming: 'resuscitated' });
  assert.equal(r.lactateLimb, true);
  assert.equal(r.meets, true);
});

test('modified lactate limb early threshold is 3.5', () => {
  assert.equal(kingsCollege({ lactate: 3.4, lactateTiming: 'early' }).lactateLimb, false);
  assert.equal(kingsCollege({ lactate: 3.6, lactateTiming: 'early' }).lactateLimb, true);
});

test('nothing entered -> complete-the-fields fallback', () => {
  const r = kingsCollege({});
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter/);
});

// spec-v1102: the destructured default `encephalopathy = 'no'` fires when the
// argument is ABSENT, so it erased the difference between "nobody said" and
// "observed absent" before any guard could see it -- and 'no' is what makes the
// three-part limb fail. An agent that omitted the key turned "Meets King's
// College Criteria: poor prognosis, refer/list for transplant" into "Does not
// meet".
//
// The same trap as spec-v930 from the other side: that wave found a blank STRING
// walking PAST the default; this one is the default firing when it should not.
//
// The limb already had an INCOMPLETE state for a missing INR or creatinine. The
// encephalopathy was excluded from it by a comment reading "encephalopathy comes
// from a select and is always known" -- true of the browser, false of every API
// caller, which is the surface split spec-v1073 is about.
test('spec-v1102: an unstated encephalopathy grade is not an absent one', () => {
  const full = kingsCollege({ inr: 7, creatinine: 4.0, encephalopathy: 'yes' });
  assert.equal(full.meets, true);
  assert.equal(full.encephProvided, true);

  const omitted = kingsCollege({ inr: 7, creatinine: 4.0 });
  assert.equal(omitted.encephProvided, false);
  assert.equal(omitted.threePartComplete, false, 'the limb is incomplete, not negative');
  assert.doesNotMatch(omitted.band, /Does not meet/, 'never rule out a transplant criterion from a gap');
  assert.match(omitted.band, /three-part limb is incomplete/);
  assert.match(omitted.band, /the encephalopathy grade/);

  // Observed absent is a finding, and still fails the limb.
  const stated = kingsCollege({ inr: 7, creatinine: 4.0, encephalopathy: 'no' });
  assert.equal(stated.encephProvided, true);
  assert.equal(stated.threePartComplete, true);
  assert.match(stated.band, /Does not meet/);

  // Ruling IN through another limb is untouched: the pH limb stands alone.
  assert.equal(kingsCollege({ ph: 7.1 }).meets, true);

  // And an entirely empty call still asks for the fields.
  assert.equal(kingsCollege({}).valid, false);
});
