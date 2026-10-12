// spec-v1638 tool 19: Medicaid fee-for-service drug payment, the lowest of the limits.
//
// Source: 42 CFR 447.512, 447.514 and 447.502, read on eCFR as current October 8, 2026 (re-read
// October 12, 2026).
//   447.512(b)  for drugs with no specific limit, and certified brand-name drugs, payments "must
//     not exceed, in the aggregate, payment levels that the agency has determined by applying the
//     lower of the following: (1) AAC plus a professional dispensing fee established by the
//     agency; or (2) Providers' usual and customary charges to the general public."
//   447.512(a), 447.514(b)(1)  for a listed multiple source drug, "a professional dispensing fee
//     established by the state agency plus an amount established by CMS that is equal to 175
//     percent of the weighted average of the most recently reported monthly AMPs".
//   447.514(b)(2)  where that amount "is lower than the average retail community pharmacies'
//     acquisition cost for such drug product, as determined by the most current national survey",
//     CMS uses the survey acquisition cost instead.
//   447.514(a)(1)  the list covers multiple source drugs with at least three pharmaceutically and
//     therapeutically equivalent products.
//   447.512(c)  the limit "does not apply if a physician certifies ... that a specific brand is
//     medically necessary".
// The federal text sets AGGREGATE ceilings on a state's payments. Each state's plan turns them
// into a per-claim "lowest of" formula, so every value here is the reader's and the state plan
// governs. No FUL or NADAC file is read by this tool.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const cents = (n) => Math.round(n * 100 + 1e-9) / 100;

export function medicaidDrugPaymentCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the state\'s actual acquisition cost per unit', o.aacPerUnit, 0, 1e6, 'dollars'], ['the quantity', o.quantity, null, 1e7, 'units'], ['the state\'s professional dispensing fee', o.dispensingFee, 0, 10000, 'dollars'], ['the pharmacy\'s usual and customary charge for the prescription', o.usualAndCustomary, 0, 1e7, 'dollars']]);
  if (f) return { valid: false, message: f };
  const qty = Number(o.quantity); const fee = Number(o.dispensingFee);
  const candidates = [
    { name: 'actual acquisition cost plus the professional dispensing fee', amount: cents(Number(o.aacPerUnit) * qty + fee), rule: '42 CFR 447.512(b)(1)' },
    { name: 'the usual and customary charge', amount: cents(Number(o.usualAndCustomary)), rule: '447.512(b)(2)' },
  ];
  for (const [k, label, name, rule] of [['fulPerUnit', 'the federal upper limit per unit', 'the federal upper limit plus the professional dispensing fee', '447.514(b)'], ['stateMacPerUnit', 'the state maximum allowable cost per unit', 'the state maximum allowable cost plus the professional dispensing fee', 'the state plan']]) {
    if (blank(o[k])) continue;
    const g = inputFault([[label, o[k], 0, 1e6, 'dollars']]);
    if (g) return { valid: false, message: g };
    candidates.push({ name, amount: cents(Number(o[k]) * qty + fee), rule });
  }
  const lowest = candidates.reduce((a, b) => (b.amount < a.amount ? b : a));
  const notes = candidates.map((c) => `${c.name.charAt(0).toUpperCase()}${c.name.slice(1)}: ${money(c.amount)} (${c.rule}).`);
  notes.push(`The lowest is ${money(lowest.amount)}, set by ${lowest.name}.`);
  if (blank(o.fulPerUnit)) notes.push('No federal upper limit was entered. A multiple source drug on the CMS list has one, and it is another amount the payment may not exceed.');
  const out = { valid: true, candidates, payment: lowest.amount, setBy: lowest.name };
  let diff = null;
  if (!blank(o.amountPaid)) {
    const g = inputFault([['the amount paid', o.amountPaid, 0, 1e7, 'dollars']]);
    if (g) return { valid: false, message: g };
    diff = cents(Number(o.amountPaid) - lowest.amount);
    out.difference = diff;
    notes.push(diff === 0 ? `The amount paid, ${money(Number(o.amountPaid))}, equals the lowest-of figure.` : `The amount paid, ${money(Number(o.amountPaid))}, is ${money(Math.abs(diff))} ${diff > 0 ? 'more' : 'less'} than the lowest-of figure.`);
  }
  notes.push('Fee-for-service only: a Medicaid managed care plan pays by contract. The federal rule sets aggregate ceilings; the state plan turns them into its own per-claim formula, with its own acquisition cost figure and sometimes more tiers, so the state plan governs and a difference here is a question for it, not a finding.');
  return { ...out, flag: diff === null ? 'lowest-of' : diff === 0 ? 'paid-at-lowest-of' : diff < 0 ? 'paid-below-lowest-of' : 'paid-above-lowest-of', abnormal: diff !== null && diff !== 0, band: `Lowest-of payment ${money(lowest.amount)}.`, bandLabel: diff === null ? `Set by ${lowest.name}` : diff === 0 ? 'Paid at the lowest-of figure' : `${money(Math.abs(diff))} ${diff > 0 ? 'above' : 'below'} it`, notes, note: notes.join(' ') };
}
