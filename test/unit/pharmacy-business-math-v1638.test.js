// spec-v1638 tools 26 and 27: markup and margin, inventory turns.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rxPricingMath } from '../../lib/rx-pricing-math-v1638.js';
import { inventoryTurns } from '../../lib/inventory-turns-v1638.js';

test('pricing: each pair of inputs gives the same four figures', () => {
  const want = { cost: 60, price: 100, markupPercent: 66.67, marginPercent: 40 };
  const same = (r) => assert.deepEqual([r.cost, r.price, r.markupPercent, r.marginPercent], [want.cost, want.price, want.markupPercent, want.marginPercent]);
  same(rxPricingMath({ cost: 60, price: 100 }));
  same(rxPricingMath({ cost: 60, marginPercent: 40 }));
  same(rxPricingMath({ price: 100, marginPercent: 40 }));
  const fromMarkup = rxPricingMath({ cost: 60, markupPercent: 66.67 });
  assert.deepEqual([fromMarkup.price, fromMarkup.marginPercent], [100, 40]);
});

test('pricing: a 25% markup is a 20% margin, and a 50% margin is a 100% markup', () => {
  assert.equal(rxPricingMath({ cost: 80, markupPercent: 25 }).marginPercent, 20);
  assert.equal(rxPricingMath({ cost: 50, marginPercent: 50 }).markupPercent, 100);
});

test('pricing: the price for a target margin, with the fee added after', () => {
  const r = rxPricingMath({ cost: 60, price: 100, targetMarginPercent: 25, fee: 10.5 });
  assert.equal(r.priceForTarget, 90.5);
  assert.match(rxPricingMath({ cost: 60, price: 100, fee: 10 }).note, /without a target margin/);
});

test('pricing: a price below cost is flagged; impossible and over-determined inputs are refused', () => {
  assert.equal(rxPricingMath({ cost: 100, price: 80 }).flag, 'price-below-cost');
  assert.match(rxPricingMath({ cost: 60, marginPercent: 100 }).message, /below 100%/);
  assert.match(rxPricingMath({ cost: 60 }).message, /^Enter any two of/);
  assert.match(rxPricingMath({ cost: 60, price: 100, markupPercent: 50 }).message, /^Enter exactly two/);
  assert.match(rxPricingMath({ markupPercent: 25, marginPercent: 20 }).message, /^Enter a cost or a price with the percent/);
  assert.match(rxPricingMath({ markupPercent: 25, marginPercent: 30 }).message, /agree/);
  assert.match(rxPricingMath({ cost: 0, price: 100 }).message, /above zero/);
});

test('inventory: turns annualized by the days in the period, and days on hand', () => {
  // $300,000 of goods in 90 days on an average $100,000 inventory: 3 turns in the period, 12.17 a year.
  const r = inventoryTurns({ cogs: 300000, periodDays: 90, beginningInventory: 110000, endingInventory: 90000 });
  assert.deepEqual([r.averageInventory, r.turnsPerYear, r.daysOnHand], [100000, 12.17, 30]);
  // A full year needs no annualizing.
  assert.equal(inventoryTurns({ cogs: 1200000, periodDays: 365, beginningInventory: 100000, endingInventory: 100000 }).turnsPerYear, 12);
});

test('inventory: dollars above a target, and the reorder point', () => {
  const r = inventoryTurns({ cogs: 300000, periodDays: 90, beginningInventory: 110000, endingInventory: 90000, targetDaysOnHand: 21, dailyUse: 12, leadTimeDays: 2, safetyStock: 10 });
  assert.deepEqual([r.dollarsAboveTarget, r.reorderPoint], [30000, 34]);
  assert.equal(inventoryTurns({ dailyUse: 12, leadTimeDays: 2, safetyStock: 0 }).reorderPoint, 24);
});

test('inventory: nothing is defaulted', () => {
  assert.match(inventoryTurns({}).message, /^Enter the period figures/);
  assert.match(inventoryTurns({ cogs: 300000 }).message, /^Enter the days in the period/);
  assert.match(inventoryTurns({ dailyUse: 12, leadTimeDays: 2 }).message, /^Enter the safety stock/);
  assert.match(inventoryTurns({ cogs: 300000, periodDays: 90, beginningInventory: 0, endingInventory: 0 }).message, /nothing to turn/);
  assert.match(inventoryTurns({ cogs: 300000, periodDays: 90, beginningInventory: 1, endingInventory: 1 }).note, /No target days on hand was entered/);
});
