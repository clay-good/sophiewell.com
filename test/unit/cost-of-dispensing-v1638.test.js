// spec-v1638 tool 25: cost of dispensing and break-even volume.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { costOfDispensing } from '../../lib/cost-of-dispensing-v1638.js';

const base = { prescriptions: 20000, staffCost: 180000, packagingCost: 12000, deliveryCost: 8000, sharedCost: 100000, allocationPercent: 60 };

test('allocated costs over prescriptions, with the shared cost taken at its allocated percent', () => {
  const r = costOfDispensing(base);
  // 180,000 + 12,000 + 8,000 + 60,000 = 260,000 over 20,000.
  assert.deepEqual([r.totalCost, r.costPerPrescription, r.categories.length], [260000, 13, 4]);
  assert.match(r.note, /Not entered, so not in the figure: counseling/);
});

test('the gap against the dispensing fee', () => {
  assert.deepEqual([costOfDispensing({ ...base, dispensingFee: 10.5 }).shortfallPerPrescription, costOfDispensing({ ...base, dispensingFee: 10.5 }).flag], [2.5, 'cost-above-the-fee']);
  assert.equal(costOfDispensing({ ...base, dispensingFee: 14 }).shortfallPerPrescription, -1);
});

test('break-even volume, rounded up; no volume when a prescription contributes nothing', () => {
  const r = costOfDispensing({ ...base, fixedCosts: 200000, averageReimbursement: 62, averageIngredientCost: 50, variableCostPerRx: 1.5 });
  // 200,000 / 10.50 = 19,047.6 -> 19,048.
  assert.deepEqual([r.contributionPerPrescription, r.breakEvenPrescriptions], [10.5, 19048]);
  const none = costOfDispensing({ ...base, fixedCosts: 200000, averageReimbursement: 50, averageIngredientCost: 50, variableCostPerRx: 0 });
  assert.equal(none.breakEvenPrescriptions, undefined);
  assert.match(none.note, /no volume covers the fixed costs/);
});

test('nothing is defaulted', () => {
  assert.match(costOfDispensing({}).message, /^Enter the prescriptions dispensed/);
  assert.match(costOfDispensing({ prescriptions: 100 }).message, /^Enter at least one cost/);
  assert.match(costOfDispensing({ prescriptions: 100, sharedCost: 1000 }).message, /^Enter the percent of that shared cost/);
  assert.match(costOfDispensing({ ...base, fixedCosts: 1000 }).message, /^Enter the average reimbursement/);
  assert.equal(costOfDispensing({ ...base, prescriptions: 0 }).valid, false);
});
