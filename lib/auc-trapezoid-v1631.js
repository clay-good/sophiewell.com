// spec-v1631 tool 16: area under the curve from measured levels (trapezoidal rule).
//
// Arithmetic on the reader's own time and concentration pairs; no empirical constant.
//   linear segment               = (C1 + C2) / 2 x (t2 - t1)
//   log-down segment (falling)   = (C1 - C2) x (t2 - t1) / ln(C1 / C2)
//   terminal rate constant       = minus the slope of ln(concentration) against time over the last
//                                  points the reader chooses (two points: ln(C1 / C2) / (t2 - t1))
//   area extrapolated to infinity = last concentration / terminal rate constant
//   clearance                    = dose / AUC to infinity
// "Linear up, log down" uses the log form on a falling segment and the linear form otherwise; two
// equal levels, or a zero, fall back to the linear form, so nothing divides by zero. The share of
// the total that is extrapolated is shown, because a large share means the sampling stopped early.
// This is the method the busulfan label prescribes (linear trapezoids plus the last level over the
// terminal rate constant).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const METHODS = [
  { value: 'linear', text: 'Linear trapezoids' },
  { value: 'linear-up-log-down', text: 'Linear up, log down' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const NOTE = 'Arithmetic on the levels you entered. The area between samples is an estimate, and so is everything past the last one. The tool does not choose a dose.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function trapezoid(points, method) {
  let area = 0;
  for (let i = 1; i < points.length; i += 1) {
    const [t1, c1] = points[i - 1]; const [t2, c2] = points[i]; const dt = t2 - t1;
    area += method === 'linear-up-log-down' && c2 < c1 && c2 > 0 ? ((c1 - c2) * dt) / Math.log(c1 / c2) : ((c1 + c2) / 2) * dt;
  }
  return area;
}

export function aucTrapezoid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const method = String(o.method ?? '').trim();
  if (!METHODS.some((m) => m.value === method)) return { valid: false, message: 'Choose the method: linear trapezoids, or linear up and log down.' };
  const extrapolate = String(o.extrapolate ?? '').trim();
  if (extrapolate !== 'yes' && extrapolate !== 'no') return { valid: false, message: 'Choose whether to extrapolate the area to infinity.' };
  const lines = String(o.points ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return { valid: false, message: 'Enter at least two samples, one per line: the time in hours, a comma, then the concentration.' };
  if (lines.length > 500) return { valid: false, message: `${lines.length} lines is more than the 500 this tool reads.` };
  const points = [];
  for (const [i, line] of lines.entries()) {
    const p = line.split(/\s*,\s*/);
    if (p.length !== 2) return { valid: false, message: `Sample line ${i + 1}: enter the time in hours, a comma, then the concentration.` };
    const f = inputFault([[`the time on sample line ${i + 1}`, p[0], 0, 1e5, 'hours'], [`the concentration on sample line ${i + 1}`, p[1], 0, 1e9, '']]);
    if (f) return { valid: false, message: f };
    if (points.length && Number(p[0]) <= points[points.length - 1][0]) return { valid: false, message: `Sample line ${i + 1}: its time is not after the line before it. Put the samples in time order.` };
    points.push([Number(p[0]), Number(p[1])]);
  }
  const area = trapezoid(points, method);
  const first = points[0][0]; const [lastT, lastC] = points[points.length - 1];
  const notes = [`${points.length} samples from ${show(first)} to ${show(lastT)} hours by ${method === 'linear' ? 'linear trapezoids' : 'linear up, log down'}: AUC ${show(area)}.`];
  const out = { valid: true, auc: sig(area), samples: points.length };
  if (extrapolate === 'no') {
    if (!blank(o.terminalPoints)) return { valid: false, message: 'The number of terminal points is used only when extrapolating. Clear it, or choose to extrapolate.' };
    notes.push('Not extrapolated: the area is over the sampled span only, so no clearance is given.');
    return { ...out, band: `AUC ${show(area)} (concentration × hours) from ${show(first)} to ${show(lastT)} hours.`, bandLabel: `AUC ${show(area)}`, notes, note: NOTE };
  }
  const nf = inputFault([['the number of terminal points', o.terminalPoints, 2, points.length, '']]);
  if (nf) return { valid: false, message: `${nf} These are the last samples the terminal slope is fitted through.` };
  const n = Number(o.terminalPoints);
  if (!Number.isInteger(n)) return { valid: false, message: 'The number of terminal points must be a whole number.' };
  const tail = points.slice(-n);
  if (tail.some(([, c]) => !(c > 0))) return { valid: false, message: 'A terminal sample is zero, and its logarithm cannot be taken. Leave it out or use fewer terminal points.' };
  const mt = tail.reduce((s, [t]) => s + t, 0) / n; const ml = tail.reduce((s, [, c]) => s + Math.log(c), 0) / n;
  const slope = tail.reduce((s, [t, c]) => s + (t - mt) * (Math.log(c) - ml), 0) / tail.reduce((s, [t]) => s + (t - mt) ** 2, 0);
  const kz = -slope;
  if (!(kz > 0)) return { valid: false, message: 'The last samples are not falling, so there is no terminal slope to extrapolate along.' };
  const extra = lastC / kz; const total = area + extra; const share = (extra / total) * 100;
  Object.assign(out, { terminalRateConstant: sig(kz), terminalHalfLife: sig(Math.LN2 / kz), aucExtrapolated: sig(extra), aucInfinity: sig(total), percentExtrapolated: sig(share) });
  notes.push(`Terminal rate constant through the last ${n} samples: ${show(kz)} per hour (half-life ${show(Math.LN2 / kz)} hours).`);
  notes.push(`Extrapolated area: ${show(lastC)} ÷ ${show(kz)} = ${show(extra)}. AUC to infinity ${show(total)}, of which ${show(share)}% is extrapolated.`);
  if (!blank(o.dose)) {
    const df = inputFault([['the dose', o.dose, null, 1e9, '']]);
    if (df) return { valid: false, message: df };
    out.clearance = sig(Number(o.dose) / total);
    notes.push(`Clearance: ${show(Number(o.dose))} ÷ ${show(total)} = ${show(out.clearance)} (dose units per concentration unit per hour: mg and mg/L give L/hour).`);
  } else notes.push('No dose was entered, so no clearance is given.');
  return { ...out, band: `AUC to infinity ${show(total)} (${show(share)}% extrapolated); ${show(area)} over the sampled span; terminal half-life ${show(Math.LN2 / kz)} hours.`, bandLabel: `AUC ${show(total)}`, notes, note: NOTE };
}
