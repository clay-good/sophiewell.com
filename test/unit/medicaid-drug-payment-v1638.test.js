// spec-v1638 tools 18 (by hand) and 19: Medicaid upper limit and lowest-of payment.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { medicaidFulCheck } from '../../lib/medicaid-ful-check-v1638.js';
import { medicaidDrugPaymentCheck } from '../../lib/medicaid-drug-payment-check-v1638.js';

test('the upper limit is 175% of the weighted average AMP, raised to the survey cost when it falls below it', () => {
  const plain = medicaidFulCheck({ weightedAmp: 0.1, surveyCost: 0.12 });
  assert.deepEqual([plain.fulPerUnit, plain.setBySurveyCost], [0.175, false]);
  const floored = medicaidFulCheck({ weightedAmp: 0.04, surveyCost: 0.12 });
  assert.deepEqual([floored.fulPerUnit, floored.setBySurveyCost, floored.flag], [0.12, true, 'set-by-survey-cost']);
  assert.match(medicaidFulCheck({ weightedAmp: 0.1 }).notes.join(' '), /was not tested/);
  assert.equal(medicaidFulCheck({ weightedAmp: 0.1, surveyCost: 0.12, quantity: 90, dispensingFee: 10.5 }).limitForQuantity, 26.25);
  assert.match(medicaidFulCheck({}).message, /^Enter the weighted average/);
  assert.match(medicaidFulCheck({ weightedAmp: 0.1, quantity: 90 }).message, /professional dispensing fee/);
});

const pay = (o) => medicaidDrugPaymentCheck({ aacPerUnit: 0.2, quantity: 90, dispensingFee: 10.5, usualAndCustomary: 40, ...o });

test('the lowest of acquisition cost plus fee, usual and customary, and the limits entered', () => {
  // 0.20 x 90 + 10.50 = 28.50; usual and customary 40.
  assert.deepEqual([pay({}).payment, pay({}).setBy], [28.5, 'actual acquisition cost plus the professional dispensing fee']);
  assert.deepEqual([pay({ usualAndCustomary: 15 }).payment, pay({ usualAndCustomary: 15 }).setBy], [15, 'the usual and customary charge']);
  // FUL 0.175 x 90 + 10.50 = 26.25.
  assert.equal(pay({ fulPerUnit: 0.175 }).payment, 26.25);
  assert.equal(pay({ fulPerUnit: 0.175, stateMacPerUnit: 0.1 }).setBy, 'the state maximum allowable cost plus the professional dispensing fee');
  assert.match(pay({}).note, /No federal upper limit was entered/);
});

test('the amount paid is compared and never judged', () => {
  assert.deepEqual([pay({ amountPaid: 28.5 }).flag, pay({ amountPaid: 28.5 }).difference], ['paid-at-lowest-of', 0]);
  assert.deepEqual([pay({ amountPaid: 25 }).flag, pay({ amountPaid: 25 }).difference], ['paid-below-lowest-of', -3.5]);
  assert.match(pay({ amountPaid: 25 }).note, /the state plan governs/);
  assert.match(medicaidDrugPaymentCheck({}).message, /^Enter the state's actual acquisition cost/);
  assert.match(pay({ usualAndCustomary: '' }).message, /usual and customary/);
});
