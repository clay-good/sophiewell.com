// spec-v1704 (biosignal-analysis tool 2): HRV time-domain measures from NN intervals, Task Force of the ESC and
// NASPE, Circulation 1996;93:1043-1065, Table 1 (read November 7, 2026; facts with attribution):
// mean NN; SDNN; RMSSD, the square root of the mean squared successive differences; NN50, adjacent intervals
// differing by more than 50 ms; pNN50, NN50 divided by the total number of NN intervals; the HRV triangular index,
// the number of intervals over the height of their histogram in bins of 7.8125 ms (1/128 s); SDANN and the SDNN
// index over 5-minute segments.
//
// Choices the Task Force does not make, printed on the page: SDNN uses the sample standard deviation (n - 1); NN50
// counts differences in both directions; pNN50 also printed over the number of differences, as many programs do.
// Intervals are never edited silently.
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';

const sig = (x) => Number(x.toPrecision(4));
const BIN = 1000 / 128;

// parseSeries("800, 810\n790") -> { values } or { message }.
export function parseSeries(raw, label = 'interval') {
  const parts = String(raw ?? '').split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
  if (!parts.length) return { message: `Enter the ${label}s, one per line or separated by commas.` };
  if (parts.length > 200000) return { message: `Enter at most 200,000 ${label}s here; a longer recording belongs in a file.` };
  const values = [];
  for (const [i, p] of parts.entries()) {
    const v = measured(p);
    if (v === null) return { message: `Entry ${i + 1} is not a number.` };
    values.push(v);
  }
  return { values };
}

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sd = (a, ddof = 1) => { const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - ddof)); };

export function hrvTimeDomain(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = parseSeries(o.intervals, 'RR interval');
  if (p.message) return { valid: false, message: p.message };
  const rr = p.values;
  if (rr.length < 3) return { valid: false, message: 'Enter at least three RR intervals.' };
  if (rr.some((x) => x < 200 || x > 3000)) return { valid: false, message: 'RR intervals must be from 200 to 3,000 ms. Enter them in milliseconds (1,000 ms is 60 beats per minute).' };
  const notes = [];
  const flagPct = measured(o.flagPercent);
  if (flagPct !== null) {
    if (!(flagPct > 0 && flagPct <= 100)) return { valid: false, message: 'The change that flags an interval must be above 0 and at most 100 percent.' };
    const flagged = [];
    for (let i = 1; i < rr.length; i += 1) if (Math.abs(rr[i] - rr[i - 1]) / rr[i - 1] * 100 > flagPct) flagged.push(i + 1);
    notes.push(flagged.length
      ? `${flagged.length} interval${flagged.length === 1 ? '' : 's'} differ from the one before by more than ${flagPct}% (position${flagged.length === 1 ? '' : 's'} ${flagged.slice(0, 20).join(', ')}${flagged.length > 20 ? ', ...' : ''}). They were kept; edit the series if they are ectopic beats or artifact.`
      : `No interval differs from the one before by more than ${flagPct}%.`);
  } else notes.push('No ectopy screen was set, so every interval was used as entered.');
  const diffs = rr.slice(1).map((x, i) => x - rr[i]);
  const rmssd = Math.sqrt(mean(diffs.map((d) => d * d)));
  const nn50 = diffs.filter((d) => Math.abs(d) > 50).length;
  const counts = new Map();
  for (const x of rr) { const b = Math.floor(x / BIN); counts.set(b, (counts.get(b) || 0) + 1); }
  const tri = rr.length / Math.max(...counts.values());
  const total = rr.reduce((s, x) => s + x, 0);
  const minutes = total / 60000;
  // SDANN and the SDNN index over complete 5-minute segments.
  const segs = [];
  let cur = [];
  let t = 0;
  for (const x of rr) {
    cur.push(x);
    t += x;
    if (t >= 300000) { segs.push(cur); cur = []; t = 0; }
  }
  const sdnn = sd(rr);
  const lines = [
    `Mean NN ${sig(mean(rr))} ms (${sig(60000 / mean(rr))} per minute) over ${rr.length} intervals, ${sig(minutes)} minutes.`,
    `SDNN ${sig(sdnn)} ms (sample standard deviation, n - 1; ${sig(sd(rr, 0))} ms with n).`,
    `RMSSD ${sig(rmssd)} ms.`,
    `NN50 ${nn50} (adjacent intervals differing by more than 50 ms, either direction); pNN50 ${sig((100 * nn50) / rr.length)}% of the ${rr.length} intervals (the Task Force's denominator), ${sig((100 * nn50) / diffs.length)}% of the ${diffs.length} differences (the denominator many programs use).`,
    `HRV triangular index ${sig(tri)} (${rr.length} intervals over the tallest histogram bin, bins of 7.8125 ms from 0 ms).`,
  ];
  if (segs.length >= 2) {
    lines.push(`SDANN ${sig(sd(segs.map(mean)))} ms and SDNN index ${sig(mean(segs.map((s) => sd(s))))} ms over ${segs.length} complete 5-minute segments${cur.length ? `; the last ${sig(t / 60000)} minutes were not a full segment and were left out of these two` : ''}.`);
  } else notes.push('SDANN and the SDNN index need at least two complete 5-minute segments; this recording is shorter.');
  return {
    valid: true, meanNN: sig(mean(rr)), sdnn: sig(sdnn), rmssd: sig(rmssd), nn50, pnn50: sig((100 * nn50) / rr.length), triangularIndex: sig(tri), minutes: sig(minutes), abnormal: false,
    band: `RMSSD ${sig(rmssd)} ms, SDNN ${sig(sdnn)} ms over ${sig(minutes)} minutes.`,
    bandLabel: `RMSSD ${sig(rmssd)} ms`,
    notes: [...lines, ...notes, 'The Task Force: "it is inappropriate to compare SDNN measures obtained from recordings of different durations."'],
    note: 'A measurement from the intervals entered, not a diagnosis. Ectopic beats and artifact change every measure; edit the series before reading them.',
  };
}
