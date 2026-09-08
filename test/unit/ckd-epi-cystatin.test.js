// spec-v92 §2.5: 2021 race-free CKD-EPI cystatin-C / combined / creatinine eGFR.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ckdEpiCystatin } from '../../lib/nephro-v92.js';

test('worked example: female 70, cystatin 1.5, creatinine 1.1 -> cys/combined/cr', () => {
  const r = ckdEpiCystatin({ cystatinC: 1.5, creatinine: 1.1, age: 70, sex: 'female' });
  assert.equal(r.egfrCys, 40.6);
  assert.equal(r.egfrCrCys, 47.4);
  assert.equal(r.egfrCr, 54.1);
  // The combined estimate sits between the cystatin-only and creatinine-only values.
  assert.ok(r.egfrCys < r.egfrCrCys && r.egfrCrCys < r.egfrCr);
});

test('eGFRcys alone when creatinine is blank (partial input)', () => {
  // spec-v1116: the sex is stated. It used to default to male, and the equation
  // is sex-specific, so this assertion was pinning the default rather than the
  // partial-input behaviour it is named for.
  const r = ckdEpiCystatin({ cystatinC: 1.2, age: 65, sex: 'male' });
  assert.equal(r.egfrCys, 59.8);
  assert.equal(r.egfrCrCys, undefined);
  assert.equal(r.egfrCr, undefined);
  assert.equal(r.valid, true);
});

test('non-positive or blank cystatin C surfaces valid:false', () => {
  assert.equal(ckdEpiCystatin({ cystatinC: -1, age: 65 }).valid, false);
  assert.equal(ckdEpiCystatin({ cystatinC: 0, age: 65 }).valid, false);
  assert.equal(ckdEpiCystatin({ age: 65 }).valid, false);
});

test('sex changes the estimate (female multiplier)', () => {
  const f = ckdEpiCystatin({ cystatinC: 1.0, age: 50, sex: 'female' });
  const m = ckdEpiCystatin({ cystatinC: 1.0, age: 50, sex: 'male' });
  assert.ok(f.egfrCys < m.egfrCys); // 0.932 female factor lowers eGFRcys
});

test('a normal young value lands in a normal eGFR range', () => {
  const r = ckdEpiCystatin({ cystatinC: 0.8, age: 30, sex: 'male' });
  assert.ok(r.egfrCys >= 100 && r.egfrCys <= 140);
});

// --- spec-v1116: a default parameter chose the equation, not just a band ---

test('spec-v1116: an unstated sex refuses, as the guard message already asked', () => {
  const base = { cystatinC: 1.5, creatinine: 1.4, age: 65 };
  const male = ckdEpiCystatin({ ...base, sex: 'male' });
  const female = ckdEpiCystatin({ ...base, sex: 'female' });
  assert.equal(male.egfrCrCys, 50.5);
  assert.equal(female.egfrCrCys, 42.4);
  // Either side of the 45 that divides CKD stage 3a from 3b.
  assert.ok(male.egfrCrCys > 45 && female.egfrCrCys < 45);

  const r = ckdEpiCystatin(base);
  assert.equal(r.valid, false);
  assert.match(r.band, /Enter age \(years\), sex/);
});
