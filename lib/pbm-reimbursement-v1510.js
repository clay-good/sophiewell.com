// spec-v1510 tool 5: pharmacy benefit manager reimbursement check.
//
// Arithmetic on the reader's own contract: a benchmark price per unit (AWP, WAC, a MAC list price, NADAC,
// or acquisition cost), plus or minus a percentage, times the quantity, plus a dispensing fee. The result is
// compared with what was paid (plan plus patient) and with the pharmacy's acquisition cost. The tool ships
// no AWP, WAC or MAC data: they are licensed or private, so every benchmark is entered by the reader.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const BENCHMARKS = [
  { value: 'awp', text: 'AWP' },
  { value: 'wac', text: 'WAC' },
  { value: 'mac', text: 'MAC list price' },
  { value: 'nadac', text: 'NADAC' },
  { value: 'cost', text: 'Acquisition cost (cost-plus)' },
];
const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function pbmReimbursementCheck(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const bm = BENCHMARKS.find((b) => b.value === o.benchmark);
  if (!bm) return { valid: false, message: 'Choose the benchmark the contract prices from.' };
  const f = inputFault([
    [`the ${bm.text} per unit`, o.benchmarkPrice, 0, 1e6, 'dollars'],
    ['the quantity', o.quantity, 0.001, 1e6, 'units'],
    ['the amount paid (plan plus patient)', o.paid, 0, 1e7, 'dollars'],
  ]);
  if (f) return { valid: false, message: f };
  const notes = [];
  let adj = 0;
  if (String(o.percent ?? '').trim()) {
    const pf = inputFault([['the contract percentage', o.percent, -100, 100, 'percent']]);
    if (pf) return { valid: false, message: pf };
    adj = Number(o.percent);
  } else notes.push('No percentage was entered, so the benchmark is used as is.');
  let fee = 0;
  if (String(o.fee ?? '').trim()) {
    const ff = inputFault([['the dispensing fee', o.fee, 0, 1000, 'dollars']]);
    if (ff) return { valid: false, message: ff };
    fee = Number(o.fee);
  } else notes.push('No dispensing fee was entered, so none is added.');
  const q = Number(o.quantity);
  const expected = Math.round((Number(o.benchmarkPrice) * (1 + adj / 100) * q + fee) * 100) / 100;
  const paid = Number(o.paid);
  const diff = Math.round((paid - expected) * 100) / 100;
  const formula = `${bm.text} ${adj ? `${adj > 0 ? '+' : '-'} ${Math.abs(adj)}%` : ''}${fee ? ` + ${money(fee)} fee` : ''}`.replace(/\s+/g, ' ').trim();
  let band = `Contract (${formula}) pays ${money(expected)} for ${q} units; ${money(paid)} was paid: ${diff < 0 ? `underpaid by ${money(-diff)}` : diff > 0 ? `${money(diff)} over the contract` : 'exactly the contract amount'}.`;
  let abnormal = diff < 0;
  if (String(o.cost ?? '').trim()) {
    const cf = inputFault([['the acquisition cost per unit', o.cost, 0, 1e6, 'dollars']]);
    if (cf) return { valid: false, message: cf };
    const cost = Math.round(Number(o.cost) * q * 100) / 100;
    const margin = Math.round((paid - cost) * 100) / 100;
    band += ` Against an acquisition cost of ${money(cost)}, the claim is ${margin < 0 ? `underwater by ${money(-margin)}` : `ahead by ${money(margin)}`}.`;
    if (margin < 0) abnormal = true;
  } else notes.push('No acquisition cost was entered, so the margin is not shown.');
  return { valid: true, expected, difference: diff, band, bandLabel: diff < 0 ? `Underpaid ${money(-diff)}` : 'Paid at or above contract', abnormal, notes, note: 'The contract terms and prices are the reader\'s; the contract and its appeal process control.' };
}
