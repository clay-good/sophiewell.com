// spec-v1638 tool 27: inventory turnover, days on hand and a reorder point.
//
// Source: stated arithmetic (no primary source).
//   average inventory = (beginning + ending) / 2
//   turnover = cost of goods sold / average inventory, annualized by 365 / days in the period
//   days on hand = 365 / annual turnover
//   reorder point = daily use x lead time + safety stock
// No "good" turnover band is printed: none has a primary source.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const r1 = (n) => Math.round(n * 10) / 10;
const r2 = (n) => Math.round(n * 100) / 100;
const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function inventoryTurns(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const item = ['dailyUse', 'leadTimeDays', 'safetyStock'];
  const period = ['cogs', 'periodDays', 'beginningInventory', 'endingInventory'];
  const anyItem = item.some((k) => !blank(o[k])); const anyPeriod = period.some((k) => !blank(o[k]));
  if (!anyItem && !anyPeriod) return { valid: false, message: 'Enter the period figures (cost of goods sold, days in the period, beginning and ending inventory), the item figures (daily use, lead time, safety stock), or both.' };
  const notes = []; const out = { valid: true };
  if (anyPeriod) {
    const f = inputFault([['the cost of goods sold for the period', o.cogs, 0, 1e12, 'dollars'], ['the days in the period', o.periodDays, 1, 3660, ''], ['the beginning inventory at cost', o.beginningInventory, 0, 1e12, 'dollars'], ['the ending inventory at cost', o.endingInventory, 0, 1e12, 'dollars']]);
    if (f) return { valid: false, message: f };
    const cogs = Number(o.cogs); const days = Number(o.periodDays); const avg = (Number(o.beginningInventory) + Number(o.endingInventory)) / 2;
    if (avg <= 0) return { valid: false, message: 'Enter a beginning or ending inventory above zero: with no inventory there is nothing to turn.' };
    if (cogs <= 0) return { valid: false, message: 'Enter a cost of goods sold above zero for the period.' };
    const turns = (cogs / avg) * (365 / days);
    const doh = 365 / turns;
    Object.assign(out, { averageInventory: r2(avg), turnsPerYear: r2(turns), daysOnHand: r1(doh) });
    notes.push(`Average inventory ${money(avg)}. Cost of goods sold ${money(cogs)} over ${days} days is ${r2(cogs / avg)} turns in the period, ${r2(turns)} a year. Days on hand: ${r1(doh)}.`);
    if (!blank(o.targetDaysOnHand)) {
      const tf = inputFault([['the target days on hand', o.targetDaysOnHand, 1, 3650, 'days']]);
      if (tf) return { valid: false, message: tf };
      const target = Number(o.targetDaysOnHand);
      const targetInventory = (cogs / days) * target;
      out.dollarsAboveTarget = r2(avg - targetInventory);
      notes.push(avg > targetInventory ? `At a target of ${target} days on hand the inventory would be ${money(targetInventory)}: ${money(avg - targetInventory)} is tied up above it.` : `At a target of ${target} days on hand the inventory would be ${money(targetInventory)}: the average is ${money(targetInventory - avg)} below it.`);
    } else notes.push('No target days on hand was entered, so no dollar figure above a target is shown.');
  }
  if (anyItem) {
    const f = inputFault([['the average daily use of the item', o.dailyUse, 0, 1e7, ''], ['the supplier lead time', o.leadTimeDays, 0, 365, 'days'], ['the safety stock (0 if none)', o.safetyStock, 0, 1e7, '']]);
    if (f) return { valid: false, message: f };
    const rop = Number(o.dailyUse) * Number(o.leadTimeDays) + Number(o.safetyStock);
    out.reorderPoint = r2(rop);
    notes.push(`Reorder point: ${Number(o.dailyUse)} a day x ${Number(o.leadTimeDays)} days of lead time + ${Number(o.safetyStock)} safety stock = ${r2(rop)} units. Reorder when the count on hand reaches it.`);
  }
  notes.push('No "good" turnover figure is given: none has a primary source. The arithmetic is only as good as the counts and costs entered.');
  const band = out.turnsPerYear !== undefined ? `${out.turnsPerYear} turns a year; ${out.daysOnHand} days on hand.` : `Reorder point ${out.reorderPoint} units.`;
  return { ...out, flag: 'figures', abnormal: false, band, bandLabel: out.reorderPoint !== undefined && out.turnsPerYear !== undefined ? `Reorder point ${out.reorderPoint} units` : out.turnsPerYear !== undefined ? 'Inventory turnover' : 'Reorder point', notes, note: notes.join(' ') };
}
