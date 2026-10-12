// spec-v1638 tool 5: Part D cost sharing for a fill shorter than the month's supply.
//
// Source: 42 CFR 423.153(b)(4) and 423.100, read on eCFR as current October 8, 2026 (re-read
// October 12, 2026).
//   423.100  "Daily cost-sharing rate means, as applicable, the established (1) Monthly copayment
//     under the enrollee's Part D plan, divided by the number of days in the approved month's
//     supply for the drug dispensed and rounded to the nearest cent; or (2) Coinsurance
//     percentage".
//   423.153(b)(4)(i)  applies to a drug "in the form of a solid oral dose" that "may be dispensed
//     for less than the approved month's supply". (ii) Not "(A) Solid oral doses of antibiotics.
//     (B) Solid oral doses that are dispensed in their original container ... or are customarily
//     dispensed in their original packaging to assist patients with compliance."
//   (iii)(A) copayment: "multiplying the applicable daily cost-sharing rate by the days' supply
//     actually dispensed"; (B) coinsurance: "apply the coinsurance percentage for the drug to the
//     days' supply actually dispensed."
// The rounding is at the daily rate, before multiplying: $47 over 30 days is $1.57 a day and
// $21.98 for 14 days, not $21.93.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const opt = (value, text) => ({ value, text });
export const SHARING = [opt('copayment', 'A copayment (dollars a month)'), opt('percentage-of-price', 'A coinsurance percentage')];
export const YES_NO = [opt('yes', 'Yes'), opt('no', 'No')];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const yn = (v) => (String(v ?? '').trim() === 'yes' ? true : String(v ?? '').trim() === 'no' ? false : null);
const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const cents = (n) => Math.round(n * 100 + 1e-9) / 100;

export function partdDailyCostShare(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const kind = SHARING.find((s) => s.value === String(o.sharing ?? '').trim());
  if (!kind) return { valid: false, message: 'Choose whether the plan charges a copayment or a coinsurance percentage for the drug.' };
  const answers = {};
  for (const [k, ask] of [['solidOral', 'is the drug a solid oral dose (a tablet or capsule)'], ['antibiotic', 'is it an antibiotic'], ['originalContainer', 'is it dispensed in its original container or packaging (for example an oral contraceptive pack)']]) {
    answers[k] = yn(o[k]);
    if (answers[k] === null) return { valid: false, message: `Choose yes or no: ${ask}? The daily rate applies to some solid oral doses only.` };
  }
  const f = inputFault([['the days in the approved month\'s supply', o.monthDays, 1, 100, 'days'], ['the days actually dispensed', o.daysDispensed, 1, 100, 'days']]);
  if (f) return { valid: false, message: f };
  const monthDays = Number(o.monthDays); const days = Number(o.daysDispensed);
  if (!Number.isInteger(monthDays) || !Number.isInteger(days)) return { valid: false, message: 'Enter the days as whole numbers.' };
  const inRule = answers.solidOral && !answers.antibiotic && !answers.originalContainer;
  const short = days < monthDays;
  const notes = [];
  const out = { valid: true, inRule, shortFill: short };
  if (!inRule) notes.push(`Outside the daily cost-sharing rule: ${!answers.solidOral ? 'it applies to solid oral doses only' : answers.antibiotic ? 'solid oral antibiotics are excepted' : 'solid oral doses dispensed in their original container or packaging are excepted'} (42 CFR 423.153(b)(4)). The plan's ordinary cost sharing applies; the figures below are what the rule would give.`);
  if (!short) notes.push(`${days} days is not less than the approved month's supply of ${monthDays} days, so this is not a short fill and the daily rate is not what sets the cost sharing.`);
  if (kind.value === 'copayment') {
    const cf = inputFault([['the monthly copayment', o.monthlyCopay, 0, 100000, 'dollars']]);
    if (cf) return { valid: false, message: cf };
    const copay = Number(o.monthlyCopay);
    const rate = cents(copay / monthDays);
    const owed = cents(rate * days);
    Object.assign(out, { dailyRate: rate, costSharing: owed });
    notes.push(`Daily cost-sharing rate: ${money(copay)} / ${monthDays} days = ${money(rate)}, rounded to the nearest cent (42 CFR 423.100). For ${days} days: ${money(rate)} x ${days} = ${money(owed)} (423.153(b)(4)(iii)(A)).`);
    const unrounded = cents((copay / monthDays) * days);
    if (unrounded !== owed) notes.push(`The rounding is at the daily rate, before multiplying. Prorating the copayment without it would give ${money(unrounded)}, which is not what the rule says.`);
  } else {
    const cf = inputFault([['the coinsurance percentage', o.coinsurancePercent, 0, 100, 'percent'], ['the price of the supply actually dispensed', o.priceDispensed, 0, 1e7, 'dollars']]);
    if (cf) return { valid: false, message: cf };
    const pct = Number(o.coinsurancePercent); const price = Number(o.priceDispensed);
    const owed = cents((pct / 100) * price);
    Object.assign(out, { coinsurancePercent: pct, costSharing: owed });
    notes.push(`Coinsurance: the percentage is applied unchanged to the supply actually dispensed: ${pct}% of ${money(price)} = ${money(owed)} (42 CFR 423.153(b)(4)(iii)(B)).`);
  }
  notes.push('The rule covers a solid oral dose that may be dispensed for less than the month\'s supply under applicable law, at a network pharmacy. It is how a Part D plan must charge; it does not say what a pharmacy collects when the plan\'s system computes it differently.');
  const applies = inRule && short;
  return { ...out, flag: applies ? 'daily-rate-applies' : !inRule ? 'outside-the-rule' : 'not-a-short-fill', abnormal: false, band: `${applies ? 'Cost sharing for the short fill' : 'By the daily-rate arithmetic'}: ${money(out.costSharing)}.`, bandLabel: applies ? 'Daily cost-sharing rate applies' : !inRule ? 'Drug is outside the rule' : 'Not a short fill', notes, note: notes.join(' ') };
}
