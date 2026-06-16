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
