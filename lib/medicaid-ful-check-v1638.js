// spec-v1638 tool 18, by hand: the Medicaid federal upper limit for a multiple source drug.
// (The mode that reads CMS's published limits file is not built.)
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
const r5 = (n) => Math.round(n * 100000) / 100000;

// The federal upper limit per unit, by hand: 175% of the weighted average AMP, floored at the survey cost.
export function medicaidFulCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weighted average of the monthly AMPs per unit', o.weightedAmp, 0, 1e6, 'dollars']]);
  if (f) return { valid: false, message: f };
  const amp = Number(o.weightedAmp);
  const byAmp = r5(amp * 1.75);
  let ful = byAmp; let floored = false; const notes = [`175% of the weighted average AMP: 1.75 x ${amp} = ${byAmp} a unit (42 CFR 447.514(b)(1)).`];
  if (!blank(o.surveyCost)) {
    const g = inputFault([['the national survey acquisition cost (NADAC) per unit', o.surveyCost, 0, 1e6, 'dollars']]);
    if (g) return { valid: false, message: g };
    const nadac = Number(o.surveyCost);
    if (byAmp < nadac) { ful = r5(nadac); floored = true; notes.push(`That is lower than the survey acquisition cost of ${nadac} a unit, so the limit is set at the survey cost instead (447.514(b)(2)).`); }
    else notes.push(`That is not lower than the survey acquisition cost of ${nadac} a unit, so the 175% figure stands.`);
  } else notes.push('No survey acquisition cost was entered, so the exception in 447.514(b)(2), which raises a limit that falls below it, was not tested.');
  const out = { valid: true, fulPerUnit: ful, setBySurveyCost: floored };
  if (!blank(o.quantity) || !blank(o.dispensingFee)) {
    const g = inputFault([['the quantity', o.quantity, null, 1e7, 'units'], ['the state\'s professional dispensing fee', o.dispensingFee, 0, 10000, 'dollars']]);
    if (g) return { valid: false, message: g };
    out.limitForQuantity = cents(ful * Number(o.quantity) + Number(o.dispensingFee));
    notes.push(`For ${Number(o.quantity)} units plus a ${money(Number(o.dispensingFee))} professional dispensing fee: ${money(out.limitForQuantity)}.`);
  }
  notes.push('This is an aggregate limit on a state\'s spending for listed multiple source drugs, not a per-claim payment rule. It applies only where FDA rates at least three products as equivalent, and not to a brand a prescriber certifies as medically necessary (447.514(a)(1), 447.512(c)). CMS publishes the limits; this is the same arithmetic on figures the reader enters.');
  return { ...out, flag: floored ? 'set-by-survey-cost' : 'set-by-175-percent', abnormal: false, band: `Federal upper limit ${ful} a unit.`, bandLabel: floored ? 'Set at the survey acquisition cost' : '175% of the weighted average AMP', notes, note: notes.join(' ') };
}
