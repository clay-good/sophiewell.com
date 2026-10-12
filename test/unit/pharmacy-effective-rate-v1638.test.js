// spec-v1638 tool 24: effective rate against a guarantee.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pharmacyEffectiveRate } from '../../lib/pharmacy-effective-rate-v1638.js';

test('achieved rate is one minus ingredient cost paid over AWP', () => {
  const r = pharmacyEffectiveRate({ awp: 1000000, ingredientPaid: 180000 });
  assert.deepEqual([r.achievedDiscountPercent, r.flag], [82, 'achieved-rate']);
});

test('a shallower discount than the guarantee is a true-up the pharmacy would owe', () => {
  // Guarantee AWP - 85%, achieved AWP - 82%: 3 points of $1,000,000 is $30,000.
  const r = pharmacyEffectiveRate({ awp: 1000000, ingredientPaid: 180000, guaranteedDiscountPercent: 85 });
  assert.deepEqual([r.trueUpExposure, r.flag], [30000, 'true-up-would-take-back']);
  const under = pharmacyEffectiveRate({ awp: 1000000, ingredientPaid: 140000, guaranteedDiscountPercent: 85 });
  assert.deepEqual([under.trueUpExposure, under.flag], [-10000, 'true-up-would-pay-pharmacy']);
  assert.equal(pharmacyEffectiveRate({ awp: 1000000, ingredientPaid: 150000, guaranteedDiscountPercent: 85 }).flag, 'at-the-guarantee');
});

test('net reimbursement and margin per prescription, before and after the true-up', () => {
  const r = pharmacyEffectiveRate({ awp: 1000000, ingredientPaid: 180000, guaranteedDiscountPercent: 85, prescriptions: 10000, dispensingFees: 5000, concessions: 9000, acquisitionCost: 120000 });
  // (180,000 + 5,000 - 9,000) / 10,000 = 17.60; less 12.00 acquisition = 5.60; less 3.00 true-up = 2.60.
  assert.deepEqual([r.netReimbursementPerRx, r.netMarginPerRx, r.netMarginPerRxAfterTrueUp, r.concessionPercentOfIngredient], [17.6, 5.6, 2.6, 5]);
});

test('nothing is defaulted', () => {
  assert.match(pharmacyEffectiveRate({}).message, /^Enter the sum of AWP/);
  assert.match(pharmacyEffectiveRate({ awp: 100, ingredientPaid: 20, prescriptions: 5 }).message, /^Enter the dispensing fees paid/);
  assert.equal(pharmacyEffectiveRate({ awp: 0, ingredientPaid: 20 }).valid, false);
  assert.match(pharmacyEffectiveRate({ awp: 100, ingredientPaid: 20 }).note, /No guaranteed rate was entered/);
});
