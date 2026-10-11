// spec-v1634 tool 18: number needed to treat from an odds ratio or a relative risk and a baseline risk.
//
// Sources, both re-read on October 11, 2026 on PubMed Central:
//   Mendes D, Alves C, Batel-Marques F. Number needed to treat (NNT) in clinical literature: an
//   appraisal. BMC Med 2017;15:112 (PMC5455127, CC BY), formulas (1) and (2), with p0 the risk in
//   the control (or unexposed) group:
//     (1)  NNT = 1 / [(1 - RR) x p0]  for RR < 1;   NNT = 1 / [(RR - 1) x p0]  for RR > 1
//     (2)  NNT = 1 / [(1 - OR) x p0] + OR / [(1 - OR) x (1 - p0)]  for OR < 1;
//          NNT = 1 / [(OR - 1) x p0] + OR / [(OR - 1) x (1 - p0)]  for OR > 1
//   Altman DG. Confidence intervals for the number needed to treat. BMJ 1998;317:1309-1312
//   (PMC1114210): when the interval for the effect includes no effect, the interval for the NNT
//   runs from a number needed to treat to benefit, through infinity, to a number needed to treat
//   to harm, and is not a pair of numbers.
//
// The tool does not know whether the event is wanted, so it says "one fewer event" and "one
// additional event" and leaves benefit and harm to the reader.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const MEASURES = [
  { value: 'rr', text: 'Relative risk (risk ratio)' },
  { value: 'or', text: 'Odds ratio' },
];
const NOTE = 'The baseline risk is the reader\'s own: the risk of the event without the treatment, over the same time as the study. The result holds only for that risk and that time, and assumes the ratio is the same at every baseline risk. It restates the ratio; it is not evidence that the treatment works.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(x.toPrecision(4)).toLocaleString('en-US', { maximumFractionDigits: 4 });
const raw = (x) => x.toLocaleString('en-US', { maximumFractionDigits: 2 });
const whole = (x) => Math.ceil(x - 1e-9).toLocaleString('en-US');

// The risk with treatment for a ratio and a baseline risk p0 (both as proportions).
function treatedRisk(measure, ratio, p0) {
  if (measure === 'rr') return ratio * p0;
  return (ratio * p0) / (1 - p0 + ratio * p0);
}
// Formulas (1) and (2). Returns { nnt, fewer } or null when the ratio is exactly 1.
function nntFor(measure, ratio, p0) {
  if (ratio === 1) return null;
  const k = Math.abs(1 - ratio);
  const nnt = measure === 'rr' ? 1 / (k * p0) : 1 / (k * p0) + ratio / (k * (1 - p0));
  return { nnt, fewer: ratio < 1 };
}
const phrase = (r) => `${whole(r.nnt)} for one ${r.fewer ? 'fewer event' : 'additional event'}`;

export function orRrToNnt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const measure = String(o.measure ?? '').trim();
  if (measure !== 'rr' && measure !== 'or') return { valid: false, message: 'Choose the effect measure: relative risk or odds ratio. The two use different formulas.' };
  const name = measure === 'rr' ? 'relative risk' : 'odds ratio';
  const f = inputFault([[`the ${name}`, o.ratio, null, 1000, ''], ['the baseline risk', o.baselineRisk, null, 100, '%']]);
  if (f) return { valid: false, message: f };
  const ratio = Number(o.ratio); const p0 = Number(o.baselineRisk) / 100;
  if (p0 >= 1) return { valid: false, message: 'A baseline risk of 100% leaves no one without the event; enter a risk below 100%.' };
  const hasLo = !blank(o.lower); const hasHi = !blank(o.upper);
  if (hasLo !== hasHi) return { valid: false, message: 'Enter both confidence limits or neither.' };
  let lo = null; let hi = null;
  if (hasLo) {
    const cf = inputFault([['the lower confidence limit', o.lower, null, 1000, ''], ['the upper confidence limit', o.upper, null, 1000, '']]);
    if (cf) return { valid: false, message: cf };
    lo = Number(o.lower); hi = Number(o.upper);
    if (!(lo <= ratio && ratio <= hi)) return { valid: false, message: `The ${name} must lie between its confidence limits (lower first).` };
  }
  const top = hi ?? ratio;
  if (measure === 'rr' && top * p0 > 1) return { valid: false, message: `A relative risk of ${sig(top)} at a baseline risk of ${sig(p0 * 100)}% gives a risk above 100%. Check the two values.` };

  const p1 = treatedRisk(measure, ratio, p0);
  const point = nntFor(measure, ratio, p0);
  const notes = [];
  let band; let label;
  if (!point) {
    band = `A ${name} of 1 is no difference: the risk stays ${sig(p0 * 100)}% and the number needed to treat is infinite.`;
    label = 'No difference';
  } else {
    const ard = Math.abs(p1 - p0) * 100;
    band = `Number needed to treat: ${phrase(point)} (${raw(point.nnt)} before rounding up), at a baseline risk of ${sig(p0 * 100)}%.`;
    label = `NNT ${whole(point.nnt)}`;
    notes.push(`Risk with treatment: ${sig(p1 * 100)}%, against ${sig(p0 * 100)}% without. Absolute risk difference: ${sig(ard)} percentage points (${point.fewer ? 'lower' : 'higher'}).`);
    notes.push(measure === 'rr'
      ? `Formula (1): 1 ÷ (|1 − ${sig(ratio)}| × ${sig(p0)}) = ${raw(point.nnt)}.`
      : `Formula (2): 1 ÷ (|1 − ${sig(ratio)}| × ${sig(p0)}) + ${sig(ratio)} ÷ (|1 − ${sig(ratio)}| × ${sig(1 - p0)}) = ${raw(point.nnt)}.`);
  }
  const out = { valid: true, flag: 'nnt', abnormal: false, measure, treatedRiskPercent: Number((p1 * 100).toPrecision(6)), nnt: point ? Number(point.nnt.toPrecision(6)) : null, direction: point ? (point.fewer ? 'fewer' : 'additional') : 'none' };
  if (hasLo) {
    const a = nntFor(measure, lo, p0); const b = nntFor(measure, hi, p0);
    if (lo < 1 && hi > 1) {
      out.intervalCrossesOne = true;
      notes.push(`95% interval: ${phrase(a)}, through infinity, to ${phrase(b)}. The interval for the ${name} includes 1 (no difference), so the two ends are on opposite sides and the interval is not a simple range (Altman 1998).`);
    } else if (!a || !b) {
      out.intervalCrossesOne = true;
      notes.push(`95% interval: from ${phrase(a || b)} to infinity. One confidence limit is exactly 1 (no difference).`);
    } else {
      // Both limits on one side of 1: the limit nearer 1 gives the larger number.
      const [small, large] = a.nnt <= b.nnt ? [a, b] : [b, a];
      out.intervalCrossesOne = false; out.nntLow = Number(small.nnt.toPrecision(6)); out.nntHigh = Number(large.nnt.toPrecision(6));
      notes.push(`95% interval: ${whole(small.nnt)} to ${whole(large.nnt)} for one ${small.fewer ? 'fewer event' : 'additional event'}, from the same formula at each confidence limit.`);
    }
  }
  if (measure === 'or') notes.push('An odds ratio is not a relative risk: at this baseline risk, reading it as one would give a different number.');
  notes.push('Mendes D, et al. BMC Med 2017;15:112, formulas (1) and (2); Altman DG. BMJ 1998;317:1309-1312.');
  return { ...out, band, bandLabel: label, notes, note: NOTE };
}
