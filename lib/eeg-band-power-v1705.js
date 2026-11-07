// spec-v1705 (biosignal-analysis tool 4): EEG band power from one channel. Band names and edges from Kane N, et al.
// Clin Neurophysiol Pract 2017;2:170-185 (the IFCN glossary, read November 7, 2026) as its 2019 corrigendum corrects
// beta: delta 0.1 to below 4 Hz (0.5 Hz offered "for practical purposes"), theta 4 to below 8, alpha 8 to 13
// inclusive, beta above 13 to 30 inclusive, gamma above 30 to 80 Hz. A bin at exactly 13 Hz is alpha; at 30 Hz, beta.
// Method, not from the glossary: the mean is removed, then Welch's periodogram with a periodic Hann window and 50%
// overlap; band power sums bins. Bands above the Nyquist frequency are "not measurable at this sampling rate".
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';
import { welch, mean, bandPower } from './dsp.js';
import { parseSeries } from './hrv-time-domain-v1704.js';

const sig = (x) => Number(x.toPrecision(4));
// A band share below a millionth of a percent is rounding noise from the transform, printed as 0.
const share = (x, sum) => { const v = (100 * x) / sum; return v < 1e-6 ? 0 : sig(v); };

export function eegBandPower(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fs = measured(o.samplingRate);
  if (fs === null || !(fs >= 16 && fs <= 20000)) return { valid: false, message: 'Enter the sampling rate in samples per second (Hz), from 16 to 20,000. It is never guessed from the data.' };
  const segSec = measured(o.segmentSeconds) ?? 2;
  if (!(segSec > 0)) return { valid: false, message: 'The analysis window must be above 0 seconds.' };
  const p = parseSeries(o.samples, 'sample');
  if (p.message) return { valid: false, message: p.message };
  let seg = 1;
  while (seg < segSec * fs) seg *= 2;
  const x0 = p.values;
  if (x0.length < seg) return { valid: false, message: `The recording has ${x0.length} samples; one ${sig(seg / fs)}-second window needs ${seg}. Enter more samples or a shorter window.` };
  const m = mean(x0);
  const spec = welch(x0.map((v) => v - m), fs, seg);
  if (spec.error) return { valid: false, message: spec.error };
  const deltaRaw = String(o.deltaFrom ?? '').trim();
  const lowDelta = deltaRaw === '0.1' ? 0.1 : 0.5;
  const nyq = fs / 2;
  const bands = [['delta', lowDelta, 4, true, false], ['theta', 4, 8, true, false], ['alpha', 8, 13, true, true], ['beta', 13, 30, false, true], ['gamma', 30, 80, false, true]];
  const rows = bands.map(([name, lo, hi, loInc, hiInc]) => {
    if (lo >= nyq) return { name, lo, hi, power: null };
    return { name, lo, hi, power: bandPower(spec, lo, Math.min(hi, nyq), { loInclusive: loInc, hiInclusive: hiInc }), capped: hi > nyq };
  });
  const sum = rows.reduce((s, r) => s + (r.power || 0), 0);
  if (!(sum > 0)) return { valid: false, message: 'The signal has no power in the bands; check the samples and the sampling rate.' };
  let peak = { f: 0, p: -1 };
  spec.freqs.forEach((f, k) => { if (f >= lowDelta && f <= Math.min(80, nyq) && spec.psd[k] > peak.p) peak = { f, p: spec.psd[k] }; });
  const top = rows.filter((r) => r.power !== null).reduce((a, b) => (b.power > a.power ? b : a));
  const lines = rows.map((r) => (r.power === null
    ? `${r.name} (${r.lo} to ${r.hi} Hz): not measurable at this sampling rate (Nyquist ${sig(nyq)} Hz).`
    : `${r.name} (${r.lo} to ${r.hi} Hz${r.capped ? `; measured to the Nyquist frequency, ${sig(nyq)} Hz, and not measurable above it at this sampling rate` : ''}): ${share(r.power, sum) === 0 ? 0 : sig(r.power)} (${share(r.power, sum)}% of the bands).`));
  lines.push(`Peak frequency ${sig(peak.f)} Hz. Method: mean removed, Welch periodogram with a ${sig(seg / fs)}-second periodic Hann window (${seg} samples) and 50% overlap, ${spec.segments} windows, resolution ${sig(spec.df)} Hz. The Hann window spreads a pure tone over its bin and the two beside it (1 : 4 : 1 in power), so a tone at a band edge shows partly in the neighboring band.`);
  return {
    valid: true, peak: sig(peak.f), relative: Object.fromEntries(rows.map((r) => [r.name, r.power === null ? null : share(r.power, sum)])), abnormal: false,
    curve: spec.freqs.map((f, k) => ({ f: sig(f), p: sig(spec.psd[k]) })).filter((c) => c.f <= Math.min(80, nyq)),
    band: `Largest band: ${top.name}, ${share(top.power, sum)}% of the band power; peak ${sig(peak.f)} Hz.`,
    bandLabel: `${top.name} ${share(top.power, sum)}%`,
    notes: [...lines, ...(deltaRaw ? [] : ['Lower edge of delta not chosen: 0.5 Hz, the glossary\'s edge "for practical purposes" (0.1 Hz is its formal edge).']), 'Band names and edges from the IFCN glossary (Kane 2017, beta as corrected in 2019); the glossary sets no normal values and none are printed.'],
    note: 'A measurement from the samples entered, not an interpretation of the EEG. Artifact, the reference montage and the window change band power.',
  };
}
