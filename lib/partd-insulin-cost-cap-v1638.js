// spec-v1638 tool 6: the Part D cost-sharing cap on a covered insulin product.
//
// Source: 42 CFR 423.120(h) and 423.100, read on eCFR as current October 8, 2026 (re-read
// October 12, 2026).
//   423.100  "Covered insulin product applicable cost-sharing amount means, ... prior to an
//     enrollee reaching the annual out-of-pocket threshold during plan year 2026 and each
//     subsequent plan year, the lesser of the following: (1) $35. (2) An amount equal to 25
//     percent of the maximum fair price established for the covered insulin product ... (3) An
//     amount equal to 25 percent of the negotiated price".
//   423.120(h)  "(1) Not apply a deductible. (2) ... cost sharing for each prescription fill up
//     to a one-month supply does not exceed the ... amount ... (3) ... each prescription fill
//     greater than a 1-month supply does not exceed the cumulative ... amount ... that would
//     apply if the same days' supply was dispensed in the fewest number of 1-month supply
//     increments necessary. (4) ... in-network or out-of-network".
// The rule words (2) and (3) per one-month supply. The negotiated price and the maximum fair
// price entered are therefore the prices of a one-month supply; the tool says so. A compounded
// product containing insulin is outside the definition.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const cents = (n) => Math.round(n * 100 + 1e-9) / 100;

export function partdInsulinCostCap(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the plan year', o.planYear, 2000, 2100, ''], ['the days supply of the fill', o.daysSupply, 1, 366, 'days'], ['the days in the plan\'s one-month supply', o.monthDays, 1, 100, 'days'], ['the plan\'s negotiated price for a one-month supply', o.negotiatedPrice, 0, 1e6, 'dollars']]);
  if (f) return { valid: false, message: f };
  const year = Number(o.planYear);
  if (!Number.isInteger(year)) return { valid: false, message: 'Enter the plan year as a whole year.' };
  if (year < 2026) return { valid: false, message: 'Enter plan year 2026 or later: the definition this tool reads applies "during plan year 2026 and each subsequent plan year". Earlier years had a flat $35 a month under a different text, which this does not compute.' };
  const days = Number(o.daysSupply); const month = Number(o.monthDays); const negotiated = Number(o.negotiatedPrice);
  let mfp = null;
  if (!blank(o.maxFairPrice)) { const g = inputFault([['the maximum fair price for a one-month supply', o.maxFairPrice, 0, 1e6, 'dollars']]); if (g) return { valid: false, message: g }; mfp = Number(o.maxFairPrice); }
  const parts = [{ name: '$35', value: 35 }, { name: '25% of the negotiated price', value: cents(negotiated * 0.25) }];
  if (mfp !== null) parts.push({ name: '25% of the maximum fair price', value: cents(mfp * 0.25) });
  const least = parts.reduce((a, b) => (b.value < a.value ? b : a));
  const increments = Math.ceil(days / month - 1e-9);
  const cap = cents(least.value * increments);
  const notes = [`Per one-month supply, the cap is the lesser of ${parts.map((p) => `${p.name}${p.name === '$35' ? '' : ` (${money(p.value)})`}`).join(', ')}: ${money(least.value)}, set by ${least.name} (42 CFR 423.100).`];
  if (mfp === null) notes.push('No maximum fair price was entered. If the insulin has one, 25% of it is a third amount that can lower the cap.');
  notes.push(increments > 1 ? `A ${days}-day fill is more than one month's supply of ${month} days: the fewest one-month increments that cover it is ${increments}, so the cap is ${increments} x ${money(least.value)} = ${money(cap)} (423.120(h)(3)).` : `A ${days}-day fill is within a one-month supply of ${month} days, so the cap is ${money(cap)} (423.120(h)(2)).`);
  const out = { valid: true, perMonthCap: least.value, setBy: least.name, increments, cap };
  let over = false;
  if (!blank(o.charged)) {
    const g = inputFault([['the cost sharing the claim charged', o.charged, 0, 1e6, 'dollars']]);
    if (g) return { valid: false, message: g };
    const charged = Number(o.charged);
    over = charged > cap + 1e-9;
    out.overcharge = over ? cents(charged - cap) : 0;
    notes.push(over ? `The claim charged ${money(charged)}, ${money(out.overcharge)} over the cap.` : `The claim charged ${money(charged)}, which is not over the cap.`);
  } else notes.push('No charged amount was entered, so no claim was checked.');
  notes.push('No deductible applies to a covered insulin product, and the cap applies before the enrollee reaches the out-of-pocket threshold, in and out of network (423.120(h)(1), (4)). The prices entered are taken as the price of a one-month supply, which is how the rule states the amounts.');
  notes.push('Covered insulin products only; a compounded product containing insulin is outside the definition. A separate rule makes ACIP-recommended adult vaccines $0 with no deductible (423.120(g)).');
  return { ...out, flag: over ? 'charged-over-the-cap' : 'cap', abnormal: over, band: `Cost-sharing cap for this fill: ${money(cap)}.`, bandLabel: over ? `Overcharged by ${money(out.overcharge)}` : `Set by ${least.name}`, notes, note: notes.join(' ') };
}
