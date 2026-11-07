// spec-v1705 (biosignal-analysis tool 3): HRV frequency-domain measures, Task Force of the ESC and NASPE, Circulation
// 1996;93:1043-1065, Table 2 (read November 7, 2026; facts with attribution). Short-term bands: VLF up to 0.04 Hz,
// LF 0.04 to 0.15 Hz, HF 0.15 to 0.4 Hz; 24-hour adds ULF up to 0.003 Hz and VLF 0.003 to 0.04 Hz. Normalized units:
// LF / (total power - VLF) x 100, and the same for HF.
//
// Choices the Task Force does not make, printed on the page: the RR series is resampled at 4 Hz by a natural cubic
// spline (linear interpolation lost a third of HF power on a test series), linearly detrended, and analyzed by
// Welch's method with a 256-sample (64 s) periodic Hann window and 50% overlap; each band edge belongs to the lower
// band. The Task Force asks for about 1 minute for HF and about 2 for LF and calls VLF from recordings of 5 minutes
// or less dubious, so a shorter recording prints only the bands it supports. Fewer than two Welch segments refuses.
//
// Pure: no DOM, no clock, no network.

import { welch, detrend, spline, bandPower } from './dsp.js';
import { parseSeries } from './hrv-time-domain-v1704.js';

export const TYPE_OPTIONS = [
  { value: 'short', text: 'Short-term (minutes)' },
  { value: 'long', text: '24-hour' },
];
const sig = (x) => Number(x.toPrecision(4));
const FS = 4;
const SEG = 256;

export function hrvFrequencyDomain(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const type = String(o.recording ?? '').trim();
  if (type !== 'short' && type !== 'long') return { valid: false, message: 'Choose whether this is a short-term or a 24-hour recording.' };
  const p = parseSeries(o.intervals, 'RR interval');
  if (p.message) return { valid: false, message: p.message };
  const rr = p.values;
  if (rr.length < 4) return { valid: false, message: 'Enter at least four RR intervals.' };
  if (rr.some((x) => x < 200 || x > 3000)) return { valid: false, message: 'RR intervals must be from 200 to 3,000 ms. Enter them in milliseconds.' };
  const times = [];
  let t = 0;
  for (const x of rr) { t += x / 1000; times.push(t); }
  const seconds = times[times.length - 1] - times[0];
  const f = spline(times, rr);
  const xs = [];
  for (let u = times[0]; u <= times[times.length - 1] + 1e-9; u += 1 / FS) xs.push(f(u));
  if (xs.length < SEG * 1.5) return { valid: false, message: `This recording is ${sig(seconds)} seconds; the analysis needs two overlapping 64-second windows, at least 96 seconds.` };
  const spec = welch(detrend(xs), FS, SEG);
  if (spec.error || spec.segments < 2) return { valid: false, message: 'The recording gives fewer than two analysis windows; enter a longer series.' };
  const bands = type === 'short'
    ? [['VLF', 0, 0.04, true], ['LF', 0.04, 0.15, false], ['HF', 0.15, 0.4, false]]
    : [['ULF', 0, 0.003, true], ['VLF', 0.003, 0.04, false], ['LF', 0.04, 0.15, false], ['HF', 0.15, 0.4, false]];
  const power = Object.fromEntries(bands.map(([n, lo, hi, loInc]) => [n, bandPower(spec, lo, hi, { loInclusive: loInc })]));
  const total = bandPower(spec, 0, 0.4, { loInclusive: true });
  const minutes = seconds / 60;
  const shown = new Set(['HF']);
  if (seconds >= 120) shown.add('LF');
  if (seconds > 300 || type === 'long') { shown.add('VLF'); if (type === 'long') shown.add('ULF'); }
  const withheld = bands.map((b) => b[0]).filter((b) => !shown.has(b));
  const peak = (lo, hi) => { let best = null; spec.freqs.forEach((fq, k) => { if (fq > lo && fq <= hi && (!best || spec.psd[k] > best.p)) best = { f: fq, p: spec.psd[k] }; }); return best ? best.f : null; };
  const lines = [];
  for (const [n, lo, hi] of bands) if (shown.has(n)) lines.push(`${n} (${lo} to ${hi} Hz) ${sig(power[n])} ms²${n === 'LF' || n === 'HF' ? `, peak ${sig(peak(lo, hi))} Hz` : ''}.`);
  const notVlf = total - (power.VLF || 0) - (power.ULF || 0);
  if (shown.has('LF')) {
    lines.push(`Normalized units: LF ${sig((100 * power.LF) / notVlf)}, HF ${sig((100 * power.HF) / notVlf)} (each over total power less VLF); LF/HF ${sig(power.LF / power.HF)}.`);
  } else lines.push(`Normalized HF ${sig((100 * power.HF) / notVlf)}. LF and LF/HF are not given: the Task Force asks for about 2 minutes of recording for LF, and this is ${sig(minutes)}.`);
  if (withheld.length) lines.push(`Withheld for this length (${sig(minutes)} minutes): ${withheld.join(', ')}.${withheld.includes('VLF') ? ' The Task Force calls VLF from recordings of 5 minutes or less a dubious measure.' : ''}`);
  lines.push(`Method: RR series resampled at 4 Hz by a natural cubic spline, linearly detrended, Welch periodogram with a 64-second Hann window and 50% overlap (${spec.segments} windows, resolution ${sig(spec.df)} Hz); each band edge counted in the lower band.`);
  const head = shown.has('LF') ? `LF ${sig(power.LF)} ms², HF ${sig(power.HF)} ms², LF/HF ${sig(power.LF / power.HF)}` : `HF ${sig(power.HF)} ms²`;
  return {
    valid: true, lf: shown.has('LF') ? sig(power.LF) : null, hf: sig(power.HF), vlf: shown.has('VLF') ? sig(power.VLF) : null,
    lfhf: shown.has('LF') ? sig(power.LF / power.HF) : null, minutes: sig(minutes), abnormal: false,
    curve: spec.freqs.map((fq, k) => ({ f: sig(fq), p: sig(spec.psd[k]) })).filter((c) => c.f <= 0.5),
    band: `${head} over ${sig(minutes)} minutes.`, bandLabel: head,
    notes: lines,
    note: 'A measurement from the intervals entered, not a diagnosis. Ectopic beats and an unsteady recording distort the spectrum; edit and check the series first.',
  };
}
