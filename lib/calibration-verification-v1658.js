// spec-v1658 tool 6: calibration verification, recovery at each level and reportable range coverage.
//
// Source: 42 CFR 493.1255(b), read on the eCFR (title 42 current to October 16, 2026) on October 19, 2026:
//   calibration verification uses the laboratory's own acceptable limits, "including at least a minimal
//   (or zero) value, a mid-point value, and a maximum value near the upper limit of the range to verify
//   the laboratory's reportable range", "At least once every 6 months" and after a complete reagent
//   change, major maintenance, a control trend or shift, or when the laboratory's schedule requires it.
// Arithmetic: recovery = measured ÷ assigned × 100; a least-squares line of measured on assigned. The
// acceptance limit is the laboratory's, entered by the reader; none ships.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { leastSquares, parseNumberLines } from './lab-stats.js';

const r = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function calibrationVerification(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = parseNumberLines(o.levels, 2, 'an assigned value and a measured value, such as 100, 98.5');
  if (p.error) return { valid: false, message: p.error };
  if (p.rows.length < 3) return { valid: false, message: 'Enter at least three levels: 42 CFR 493.1255(b)(2)(ii) asks for a minimal (or zero), a mid-point and a maximum value.' };
  const f = inputFault([['the acceptable recovery limit', o.limitPct, null, 100, 'percent']]);
  if (f) return { valid: false, message: `${f} It is the laboratory's own acceptable limit for calibration verification.` };
  const lim = Number(o.limitPct);
  const rows = p.rows.map(([a, m]) => ({ a, m }));
  if (new Set(rows.map((x) => x.a)).size < 2) return { valid: false, message: 'Every level has the same assigned value. Enter levels across the reportable range.' };
  const fails = [];
  const notes = rows.map(({ a, m }) => {
    if (a === 0) return `Assigned 0: measured ${m}; recovery is not defined at zero.`;
    const rec = (m / a) * 100;
    const out = Math.abs(rec - 100) > lim + 1e-9;
    if (out) fails.push(a);
    return `Assigned ${a}: measured ${m}, recovery ${r(rec, 1)}%${out ? `, outside ±${lim}%` : ''}.`;
  });
  const line = leastSquares(rows.map((x) => x.a), rows.map((x) => x.m));
  notes.push(`Measured = ${r(line.slope, 4)} × assigned ${line.intercept >= 0 ? '+' : '−'} ${r(Math.abs(line.intercept), 3)}${line.r === null ? '' : `, r = ${r(line.r, 4)}`}.`);
  const lo = Math.min(...rows.map((x) => x.a));
  const hi = Math.max(...rows.map((x) => x.a));
  if (!blank(o.rangeLow) || !blank(o.rangeHigh)) {
    const g = inputFault([['the low end of the reportable range', o.rangeLow, -1e6, 1e9, ''], ['the high end of the reportable range', o.rangeHigh, -1e6, 1e9, '']]);
    if (g) return { valid: false, message: g };
    const rl = Number(o.rangeLow);
    const rh = Number(o.rangeHigh);
    if (rh <= rl) return { valid: false, message: 'The high end of the reportable range must be above the low end. Check the range.' };
    const span = Math.max(0, Math.min(hi, rh) - Math.max(lo, rl));
    notes.push(`Verified from ${lo} to ${hi} against a reportable range of ${rl} to ${rh}: ${lo <= rl && hi >= rh ? 'the whole range is spanned' : span === 0 ? 'none of the range is spanned' : `${r((span / (rh - rl)) * 100, 1)}% of the range is spanned`}. Whether the top level is "near the upper limit" is the laboratory's call.`);
  } else {
    notes.push('Enter the reportable range to see how much of it the levels span.');
  }
  return {
    valid: true, pass: fails.length === 0, slope: r(line.slope, 4), intercept: r(line.intercept, 3), abnormal: fails.length > 0,
    band: fails.length ? `${fails.length} of ${rows.length} levels outside ±${lim}% recovery (assigned ${fails.join(', ')}).` : `All ${rows.length} levels within ±${lim}% recovery.`,
    bandLabel: fails.length ? 'Outside the limit' : 'Within the limit',
    notes,
    note: '42 CFR 493.1255(b) requires calibration verification at least every 6 months, and after a complete reagent change, major maintenance or a control trend or shift. The acceptable limit is the laboratory\'s own.',
  };
}
