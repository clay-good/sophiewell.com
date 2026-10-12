// spec-v1638 tool 6: the Part D insulin cost-sharing cap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { partdInsulinCostCap } from '../../lib/partd-insulin-cost-cap-v1638.js';

const cap = (o) => partdInsulinCostCap({ planYear: 2026, daysSupply: 30, monthDays: 30, negotiatedPrice: 200, ...o });

test('the lesser of $35, 25% of the negotiated price and 25% of the maximum fair price', () => {
  assert.deepEqual([cap({}).cap, cap({}).setBy], [35, '$35']);
  assert.deepEqual([cap({ negotiatedPrice: 100 }).cap, cap({ negotiatedPrice: 100 }).setBy], [25, '25% of the negotiated price']);
  assert.deepEqual([cap({ maxFairPrice: 80 }).cap, cap({ maxFairPrice: 80 }).setBy], [20, '25% of the maximum fair price']);
  // 25% of $140 is exactly $35: the $35 is listed first and is not beaten.
  assert.equal(cap({ negotiatedPrice: 140 }).setBy, '$35');
});

test('a longer fill takes the fewest one-month increments', () => {
  assert.deepEqual([cap({ daysSupply: 90 }).increments, cap({ daysSupply: 90 }).cap], [3, 105]);
  assert.deepEqual([cap({ daysSupply: 31 }).increments, cap({ daysSupply: 31 }).cap], [2, 70]);
  assert.equal(cap({ daysSupply: 84, monthDays: 28 }).increments, 3);
});

test('an overcharge is the amount over the cap', () => {
  const r = cap({ charged: 47 });
  assert.deepEqual([r.flag, r.overcharge], ['charged-over-the-cap', 12]);
  assert.equal(cap({ charged: 35 }).flag, 'cap');
  assert.match(cap({}).note, /No charged amount was entered/);
});

test('refusals: a plan year before 2026, missing prices', () => {
  assert.match(cap({ planYear: 2025 }).message, /^Enter plan year 2026 or later/);
  assert.match(partdInsulinCostCap({}).message, /^Enter the plan year/);
  assert.match(cap({ negotiatedPrice: '' }).message, /negotiated price/);
});
