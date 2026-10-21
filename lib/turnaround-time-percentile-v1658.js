// spec-v1658 tool 7: turnaround time, median and a percentile from a list of minutes.
//
// Arithmetic: the median; the nearest-rank percentile (the ceil(p / 100 × n)-th value in ascending
// order), stated on the page so two laboratories compute it the same way; the mean; and the share at or
// under the laboratory's target. No target ships.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';
import { mean, median, nearestRank, parseNumberLines } from './lab-stats.js';

const r1 = (n) => Math.round(n * 10) / 10;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function turnaroundTimePercentile(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = parseNumberLines(o.minutes, 1, 'one turnaround time in minutes');
  if (p.error) return { valid: false, message: p.error };
  const xs = p.rows.map(([x]) => x);
  if (!xs.length) return { valid: false, message: 'Enter the turnaround times in minutes, one per line.' };
  if (xs.some((x) => x < 0)) return { valid: false, message: 'A turnaround time is negative. Check the times entered.' };
  let pct = 90;
  if (!blank(o.percentile)) {
    const f = inputFault([['the percentile', o.percentile, 1, 99, '']]);
    if (f) return { valid: false, message: f };
    pct = Number(o.percentile);
  }
  const pv = nearestRank(xs, pct);
  const notes = [`Mean ${r1(mean(xs))} minutes. The ${pct}th percentile is the ${Math.max(1, Math.ceil((pct / 100) * xs.length))}th of ${xs.length} times in order (nearest rank).`];
  let share = null;
  if (!blank(o.target)) {
    const f = inputFault([['the target', o.target, null, 1e6, 'minutes']]);
    if (f) return { valid: false, message: f };
    const t = Number(o.target);
    const met = xs.filter((x) => x <= t).length;
    share = r1((met / xs.length) * 100);
    notes.push(`${met} of ${xs.length} (${share}%) at or under the ${t}-minute target.`);
  } else {
    notes.push('Enter the laboratory\'s target to see the share of results that met it.');
  }
  return {
    valid: true, n: xs.length, median: median(xs), percentile: pv, share, abnormal: false,
    band: `Median ${r1(median(xs))} minutes; ${pct}th percentile ${pv} minutes, over ${xs.length} results.`,
    bandLabel: `${r1(median(xs))} / ${pv} min`,
    notes,
    note: 'Say which interval was timed (collected to reported, or received to reported); the two are not comparable.',
  };
}
