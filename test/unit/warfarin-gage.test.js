// spec-v133 2.2: Gage pharmacogenomic warfarin dose (Gage BF, et al, Clin
// Pharmacol Ther 2008;84:326-331). dose(mg/day) = exp(0.9751 + 0.4317*BSA
// - 0.00745*age - 0.2066*CYP2C9*2 - 0.4008*CYP2C9*3 - 0.3238*VKORC1(A alleles)
// + 0.2029*targetINR - 0.2538*amiodarone + 0.0922*smoker - 0.0901*AfrAm
// + 0.0664*DVT/PE). BSA = DuBois. Coefficients confirmed verbatim (Shin & Cao
// validation reprint, cross-reconciled to the original Table-3 percentages). No
// CYP4F2 term. The published model gives no numeric worked example -- the
// reference value below is our own arithmetic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { warfarinGage } from '../../lib/warfarin-v133.js';

const base = { age: 60, height: 175, weight: 70, targetInr: 2.5, vkorc1: 'GG', cyp2c9: '*1/*1', amiodarone: 'no', smoker: 'no', africanAmerican: 'no', dvtPe: 'no' };

test('reference case reproduces the exponential model (our arithmetic)', () => {
  // BSA(DuBois, 175cm/70kg) ~ 1.848; lnDose = 0.9751 + 0.4317*1.848 - 0.00745*60
  // + 0.2029*2.5 = ~1.833; exp ~ 6.25-6.3 mg/day.
  const r = warfarinGage(base);
  assert.equal(r.valid, true);
  assert.equal(r.daily, 6.3);
  assert.equal(r.weekly, 43.8);
});

test('per-allele genotype effects lower the dose monotonically', () => {
  const ref = warfarinGage(base).daily;
  const oneStar3 = warfarinGage({ ...base, cyp2c9: '*1/*3' }).daily;
  const twoStar3 = warfarinGage({ ...base, cyp2c9: '*3/*3' }).daily;
  const vkAA = warfarinGage({ ...base, vkorc1: 'AA' }).daily;
  assert.ok(oneStar3 < ref);
  assert.ok(twoStar3 < oneStar3); // *3/*3 lower than *1/*3
  assert.ok(vkAA < ref);
});

test('amiodarone lowers and smoking raises the predicted dose', () => {
  assert.ok(warfarinGage({ ...base, amiodarone: 'yes' }).daily < warfarinGage(base).daily);
  assert.ok(warfarinGage({ ...base, smoker: 'yes' }).daily > warfarinGage(base).daily);
});

test('the BSA term scales with body size', () => {
  const small = warfarinGage({ ...base, height: 155, weight: 50 }).daily;
  const large = warfarinGage({ ...base, height: 190, weight: 100 }).daily;
  assert.ok(large > small);
});

test('blank or unrecognized inputs surface valid:false (no unknown-genotype term)', () => {
  assert.equal(warfarinGage({ age: 60, height: 175 }).valid, false);
  assert.equal(warfarinGage({ ...base, vkorc1: 'unknown' }).valid, false); // Gage has no unknown imputation
  assert.equal(warfarinGage({ ...base, cyp2c9: '' }).valid, false);
  assert.equal(warfarinGage({ ...base, targetInr: 0 }).valid, false);
  assert.equal(warfarinGage(7).valid, false);
});
