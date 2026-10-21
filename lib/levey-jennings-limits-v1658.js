// spec-v1658 tool 2: Levey-Jennings mean, SD, CV and control limits from a series of control results.
//
// Arithmetic: mean; sample SD (n − 1); CV = SD ÷ mean × 100; limits at the mean ± 1, 2 and 3 SD; each
// result's distance from the mean in SD. The chart is named for Levey S, Jennings ER, Am J Clin Pathol
// 1950;20:1059, which was not opened; it is cited for the name only. No minimum count is sourced: the
// reader sets the laboratory's own.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { mean, sampleSd, parseNumberLines } from './lab-stats.js';

const r = (n, d = 3) => Math.round(n * 10 ** d) / 10 ** d;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function leveyJenningsLimits(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = parseNumberLines(o.results, 1, 'one control result, optionally after a date or run label and a comma');
  if (p.error) return { valid: false, message: p.error };
  const xs = p.rows.map(([x]) => x);
  if (xs.length < 2) return { valid: false, message: 'Enter at least two control results; an SD needs two.' };
  const m = mean(xs);
  const sd = sampleSd(xs);
  const notes = [];
  if (sd === 0) return { valid: false, message: 'Every result is the same, so the SD is zero and there are no limits. Check the results.' };
  const cv = m === 0 ? null : r((sd / Math.abs(m)) * 100, 2);
  const lim = (k) => `${r(m - k * sd)} to ${r(m + k * sd)}`;
  const out = xs.map((x, i) => ({ i: i + 1, x, z: (x - m) / sd })).filter((q) => Math.abs(q.z) > 2);
  for (const q of out) notes.push(`Result ${q.i} (${q.x}) is ${r(q.z, 2)} SD from the mean, beyond ±${Math.abs(q.z) > 3 ? 3 : 2} SD.`);
  if (!blank(o.minimumCount)) {
    const f = inputFault([['the laboratory minimum count', o.minimumCount, 2, 1000, '']]);
    if (f) return { valid: false, message: f };
    if (xs.length < Number(o.minimumCount)) notes.push(`${xs.length} results is fewer than the laboratory's minimum of ${o.minimumCount} for setting limits.`);
  } else {
    notes.push('Enter the laboratory\'s minimum count for setting limits to check the series against it; none is built in.');
  }
  return {
    valid: true, n: xs.length, mean: r(m), sd: r(sd), cv, abnormal: out.length > 0,
    band: `Mean ${r(m)}, SD ${r(sd)}${cv === null ? '' : `, CV ${cv}%`} over ${xs.length} results. Limits: ±1 SD ${lim(1)}; ±2 SD ${lim(2)}; ±3 SD ${lim(3)}.`,
    bandLabel: `Mean ${r(m)}, SD ${r(sd)}`,
    notes,
    note: 'Sample SD, with n − 1. These are limits computed from the series entered; which rules the laboratory runs against them is its own QC plan.',
  };
}
