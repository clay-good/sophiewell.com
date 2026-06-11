// spec-v56 §2.5: digoxin maintenance guidance + level interpretation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { digoxin } from '../../lib/medication-v5.js';

test('normal clearance -> 0.125-0.25 mg daily', () => {
  const r = digoxin({ crCl: 60, indication: 'hf' });
  assert.match(r.doseGuidance, /0.125-0.25 mg/);
});

test('reduced clearance (CrCl <30) or elderly -> reduced dose', () => {
  assert.match(digoxin({ crCl: 20 }).doseGuidance, /0.0625-0.125/);
  assert.match(digoxin({ crCl: 60, ageYears: 80 }).doseGuidance, /0.0625-0.125/);
});

test('HF level within target 0.5-0.9', () => {
  const r = digoxin({ crCl: 60, indication: 'hf', levelNgMl: 0.7 });
  assert.match(r.levelInterp, /within/);
});

test('toxic level >2.0 flagged', () => {
  const r = digoxin({ crCl: 60, indication: 'hf', levelNgMl: 2.4 });
  assert.match(r.levelInterp, /toxic/);
});

// spec-v69: the "below target" threshold is now indication-aware. The
// rate-control floor is 0.8 ng/mL (the range the function and renderer already
// print), not the HF floor of 0.5. Before v69 a rate-control level of 0.6-0.7
// fell through to "within 0.8-2.0", contradicting its own printed target.
test('spec-v69: AF rate-control level 0.7 (below the 0.8 floor) reads as below, not within', () => {
  const r = digoxin({ crCl: 60, indication: 'af', levelNgMl: 0.7 });
  assert.match(r.levelInterp, /below 0\.8-2\.0 ng\/mL \(rate control\)/);
  assert.doesNotMatch(r.levelInterp, /within/);
});

test('spec-v69: AF rate-control level 0.9 (at/above the 0.8 floor) reads as within range', () => {
  const r = digoxin({ crCl: 60, indication: 'af', levelNgMl: 0.9 });
  assert.match(r.levelInterp, /within 0\.8-2\.0 ng\/mL \(rate control\)/);
});

test('spec-v69: HF level 0.7 still reads as within (0.5 floor unchanged)', () => {
  const r = digoxin({ crCl: 60, indication: 'hf', levelNgMl: 0.7 });
  assert.match(r.levelInterp, /within 0\.5-0\.9 ng\/mL \(HF\)/);
});

test('HF level above 0.9 flagged as above target', () => {
  const r = digoxin({ crCl: 60, indication: 'hf', levelNgMl: 1.2 });
  assert.match(r.levelInterp, /above the HF target/);
});

test('timing warning when level drawn <6 h post-dose', () => {
  const r = digoxin({ crCl: 60, indication: 'hf', levelNgMl: 0.8, hoursPostDose: 4 });
  assert.equal(r.timingWarn, true);
});

test('rejects impossible CrCl / level', () => {
  assert.throws(() => digoxin({ crCl: NaN }), /crCl/);
  assert.throws(() => digoxin({ crCl: 60, levelNgMl: 99 }), /levelNgMl/);
});
