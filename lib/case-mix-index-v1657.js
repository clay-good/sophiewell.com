// spec-v1657 tool 10: case mix index from the MS-DRG relative weights of a list of discharges.
//
// Arithmetic identity: CMI = sum of the discharges' relative weights ÷ the number of discharges. The
// weights come from CMS IPPS Table 5 for the fiscal year of discharge, which CMS reissues each year; no
// weight file is bundled, so the reader pastes the weights. With a payment rate, CMI × rate × discharges
// is shown as the DRG-weighted operating amount, leaving out every adjustment (wage index, outliers,
// IME, DSH, and the rest).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const r4 = (n) => Math.round(n * 10000) / 10000;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

// One weight per line, or "weight, count" for several discharges with the same weight.
export function parseWeights(text) {
  let n = 0;
  let sum = 0;
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const c = line.split(/[,\t]/).map((x) => x.trim());
    if (c.length > 2 || !/^\d*\.?\d+$/.test(c[0])) return { error: `Line ${i + 1} needs a relative weight, or a weight and a count, such as 1.2345, 3.` };
    const w = Number(c[0]);
    if (w <= 0 || w > 50) return { error: `Line ${i + 1}: ${w} is outside the range of MS-DRG relative weights. Check the value entered.` };
    const k = c.length === 2 ? c[1] : '1';
    if (!/^\d+$/.test(k) || Number(k) === 0) return { error: `Line ${i + 1}: the count must be a whole number of discharges.` };
    n += Number(k);
    sum += w * Number(k);
  }
  return { n, sum };
}

export function caseMixIndex(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = parseWeights(o.weights);
  if (p.error) return { valid: false, message: p.error };
  if (!p.n) return { valid: false, message: 'Enter the MS-DRG relative weights, one discharge per line, or a weight and a count.' };
  const cmi = r4(p.sum / p.n);
  const notes = [`${p.n} discharges, weights summing to ${r4(p.sum)}.`];
  if (!blank(o.rate)) {
    const f = inputFault([['the payment rate', o.rate, null, 1e7, 'dollars']]);
    if (f) return { valid: false, message: f };
    const amt = Math.round(p.sum * Number(o.rate) * 100) / 100;
    notes.push(`DRG-weighted amount at $${Number(o.rate).toLocaleString('en-US')}: $${amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}, before the wage index, outlier, teaching, disproportionate share and other adjustments.`);
  }
  return {
    valid: true, cmi, discharges: p.n, abnormal: false,
    band: `Case mix index ${cmi.toFixed(4)} over ${p.n} discharges.`, bandLabel: cmi.toFixed(4), notes,
    note: 'Use the weights from CMS IPPS Table 5 for each discharge\'s fiscal year; they change every October.',
  };
}
