// spec-v1638 tool 25: cost of dispensing and break-even volume.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { costOfDispensing } from '../../lib/cost-of-dispensing-v1638.js';

const base = { prescriptions: 20000, staffCost: 180000, packagingCost: 12000, deliveryCost: 8000, sharedCost: 100000, allocationPercent: 60 };

test('allocated costs over prescriptions, with the shared cost taken at its allocated percent', () => {
  const r = costOfDispensing(base);
  // 180,000 + 12,000 + 8,000 + 60,000 = 260,000 over 20,000.
  assert.deepEqual([r.totalCost, r.costPerPrescription, r.categories.length], [260000, 13, 4]);
  assert.match(r.notes.join(' '), /Not entered, so not in the figure: counseling/);
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
  assert.match(none.notes.join(' '), /no volume covers the fixed costs/);
});

test('nothing is defaulted', () => {
  assert.match(costOfDispensing({}).message, /^Enter the prescriptions dispensed/);
  assert.match(costOfDispensing({ prescriptions: 100 }).message, /^Enter at least one cost/);
  assert.match(costOfDispensing({ prescriptions: 100, sharedCost: 1000 }).message, /^Enter the percent of that shared cost/);
  assert.match(costOfDispensing({ ...base, fixedCosts: 1000 }).message, /^Enter the average reimbursement/);
  assert.equal(costOfDispensing({ ...base, prescriptions: 0 }).valid, false);
});

// spec-v1638 tool 25: the fee gap per payer.
test('fees by payer: each payer against the cost, totals where counts are entered, and a weighted average fee', () => {
  const base = { prescriptions: 1000, staffCost: 9000 }; // $9.00 a prescription
  const r = costOfDispensing({ ...base, payerFees: 'Medicaid, 10.64, 400\nPlan A, 1.50, 600' });
  assert.deepEqual(r.payerGaps.map((p) => [p.payer, p.gapPerPrescription, p.gapTotal]), [['Medicaid', -1.64, -656], ['Plan A', 7.5, 4500]]);
  const t = r.notes.join(' ');
  assert.match(t, /Plan A: fee \$1\.50, \$7\.50 a prescription below the cost, \$4,500\.00 short across 600 prescriptions/);
  assert.match(t, /Weighted by prescriptions, the average fee is \$5\.16/);
  assert.equal(r.abnormal, true);
  assert.match(costOfDispensing({ ...base, payerFees: 'Plan A, 1.5\nPlan B, 2, 10' }).notes.join(' '), /some payers only/);
  assert.match(costOfDispensing({ ...base, payerFees: ', 2' }).message, /payer name on payer line 1/);
  assert.match(costOfDispensing({ ...base, payerFees: 'Plan A, abc' }).message, /dispensing fee on payer line 1/);
});
