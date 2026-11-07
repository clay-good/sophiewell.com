// spec-v1706 (biosignal-analysis tool 1): R-peaks from a single-lead ECG trace by the Pan-Tompkins algorithm (Pan J,
// Tompkins WJ. A real-time QRS detection algorithm. IEEE Trans Biomed Eng 1985;32:230-236, read for the design on
// November 7, 2026), at 200 samples/s so every published constant applies unchanged:
//   low-pass (eq 3): y(n) = 2y(n-1) - y(n-2) + x(n) - 2x(n-6) + x(n-12);
//   high-pass: the paper's printed eq 4 and 6 are not a high-pass (gain about 16 from DC to 20 Hz, rising without
//     bound toward 100 Hz, and an impulse response that rings forever), so it is built from the sentence on the same
//     page, "subtracting the output of a first-order low-pass filter from an all-pass filter", gain 32, delay 16:
//     y(n) = y(n-1) - x(n) + 32x(n-16) - 32x(n-17) + x(n-32); -3 dB at 4.72 Hz, finite after 32 samples, and with
//     the low-pass a band of 4.91 to 11.78 Hz ("about 5-12 Hz" in the paper);
//   derivative (eq 9), squaring, a 30-sample (150 ms) moving-window integral;
//   thresholds SPK = 0.125 PEAK + 0.875 SPK, NPK likewise, THRESHOLD1 = NPK + 0.25 (SPK - NPK), THRESHOLD2 = half of
//     it, for the integral and the filtered signal; search-back with 0.25 and 0.75 when no beat is found within 166% of
//     RR AVERAGE2 (the last eight intervals within 92% to 116%); thresholds halved for an irregular rhythm; a 200 ms
//     refractory period; within 360 ms, a candidate whose maximal slope is under half a QRS's is a T wave.
// Other sampling rates are resampled to 200 samples/s first (windowed-sinc, 80 Hz) and mapped back.
//
// Project additions, each needed to reach the ship gate on the MIT-BIH Arrhythmia Database and labeled here: the
// starting level is removed and learning waits for the filters to settle (a recording that starts far from zero
// otherwise rings the filters and no beat is ever found); the T-wave test compares with the mean slope of the last
// eight complexes and also applies to search-back; inside the refractory period a much larger peak replaces the one
// just taken; and, since a recording is read whole, of two detections closer than 240 ms one with under half the
// other's integrated peak is dropped as a P or T wave.
//
// Validation (the ship gate, test/unit/qrs-detect-trace-v1706.test.js and docs/spec-v1706.md): on the 44 non-paced
// MIT-BIH records, 150 ms tolerance, aggregate sensitivity 99.79% and positive predictivity 99.08%.
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';

const FS = 200;

// resample(x, fs) -> the signal at 200 samples/s by windowed-sinc interpolation with an 80 Hz low-pass (Hann
// window, 32 input samples each side). Identity at 200 samples/s.
export function resample(x, fs) {
  if (fs === FS) return Float64Array.from(x);
  const fc = Math.min(80, 0.45 * Math.min(fs, FS));
  const K = 32;
  const n = Math.floor(((x.length - 1) * FS) / fs) + 1;
  const out = new Float64Array(n);
  const a = (2 * fc) / fs;
  for (let j = 0; j < n; j += 1) {
    const c = (j * fs) / FS;
    const lo = Math.max(0, Math.ceil(c - K));
    const hi = Math.min(x.length - 1, Math.floor(c + K));
    let s = 0;
    let wsum = 0;
    for (let i = lo; i <= hi; i += 1) {
      const d = i - c;
      const arg = Math.PI * a * d;
      const sinc = d === 0 ? 1 : Math.sin(arg) / arg;
      const w = 0.5 + 0.5 * Math.cos((Math.PI * d) / (K + 1));
      const h = a * sinc * w;
      s += x[i] * h;
      wsum += h;
    }
    out[j] = wsum ? s / wsum : 0;
  }
  return out;
}

// The band-pass: the paper's low-pass (eq 3) and the high-pass built from its sentence (see the header).
export function lowPass(x) {
  const y = new Float64Array(x.length);
  for (let n = 0; n < x.length; n += 1) {
    y[n] = (n >= 1 ? 2 * y[n - 1] : 0) - (n >= 2 ? y[n - 2] : 0) + x[n] - (n >= 6 ? 2 * x[n - 6] : 0) + (n >= 12 ? x[n - 12] : 0);
  }
  return y;
}
export function highPass(x) {
  const y = new Float64Array(x.length);
  for (let n = 0; n < x.length; n += 1) {
    y[n] = (n >= 1 ? y[n - 1] : 0) - x[n] + (n >= 16 ? 32 * x[n - 16] : 0) - (n >= 17 ? 32 * x[n - 17] : 0) + (n >= 32 ? x[n - 32] : 0);
  }
  return y;
}
export function derivative(x) {
  const y = new Float64Array(x.length);
  for (let n = 2; n < x.length - 2; n += 1) y[n] = (-x[n - 2] - 2 * x[n - 1] + 2 * x[n + 1] + x[n + 2]) / 8;
  return y;
}
export function integrate(x, w = 30) {
  const y = new Float64Array(x.length);
  let s = 0;
  for (let n = 0; n < x.length; n += 1) {
    s += x[n];
    if (n >= w) s -= x[n - w];
    y[n] = s / w;
  }
  return y;
}

const BP_DELAY = 5 + 16; // low-pass 5 samples, high-pass 16
const MWI_LAG = 15; // the moving window's center lags its end by about 15 samples

// detect(x, fs) -> { peaks: [sample indices in x], searchBacks }
export function detect(x, fs) {
  // Start the filters from rest: subtract the first second's median level, so a recording that begins far from
  // zero does not ring the filters (a step at sample 0 would otherwise set the learning thresholds).
  const head = Array.from(x.slice(0, Math.max(1, Math.round(fs)))).sort((p, q) => p - q);
  const level = head[Math.floor(head.length / 2)];
  const r = resample(Array.from(x, (v) => v - level), fs);
  const bp = highPass(lowPass(r));
  const d = derivative(bp);
  const sq = d.map((v) => v * v);
  const mwi = integrate(sq);
  const n = mwi.length;
  const refr = Math.round(0.2 * FS);
  const tWin = Math.round(0.36 * FS);
  const srch = Math.round(0.075 * FS);
  const bpAt = (i) => { let m = 0; for (let k = Math.max(0, i - srch); k <= Math.min(n - 1, i + srch); k += 1) m = Math.max(m, Math.abs(bp[k])); return m; };
  const slopeAt = (i) => { let m = 0; for (let k = Math.max(0, i - srch); k <= Math.min(n - 1, i + srch); k += 1) m = Math.max(m, Math.abs(d[k])); return m; };
  // Learning phase: the first 2 seconds set the initial levels.
  // The learning window starts after the filters settle (their responses are 12, 32 and 30 samples long).
  const L0 = Math.min(n - 1, 80);
  const L = Math.min(n, L0 + 2 * FS);
  let maxI = 0; let sumI = 0; let maxF = 0; let sumF = 0;
  for (let i = L0; i < L; i += 1) { maxI = Math.max(maxI, mwi[i]); sumI += mwi[i]; maxF = Math.max(maxF, Math.abs(bp[i])); sumF += Math.abs(bp[i]); }
  let SPKI = maxI / 3; let NPKI = sumI / (L - L0) / 2;
  let SPKF = maxF / 3; let NPKF = sumF / (L - L0) / 2;
  let thrI = () => NPKI + 0.25 * (SPKI - NPKI);
  let thrF = () => NPKF + 0.25 * (SPKF - NPKF);
  let irregular = false;
  const rr1 = []; const rr2 = [];
  let rrAvg2 = null;
  const qrs = []; // indices in the mwi/bp timeline (bp location of the QRS)
  const slopes = [];
  let pending = []; // noise peaks since the last QRS: { i, pkI, pkF, b }
  let searchBacks = 0;
  let lastPk = null;
  const kept = [];
  const accept = (pk, back) => {
    const last = qrs.length ? qrs[qrs.length - 1] : null;
    if (back) { SPKI = 0.25 * pk.pkI + 0.75 * SPKI; SPKF = 0.25 * pk.pkF + 0.75 * SPKF; searchBacks += 1; }
    else { SPKI = 0.125 * pk.pkI + 0.875 * SPKI; SPKF = 0.125 * pk.pkF + 0.875 * SPKF; }
    if (last !== null) {
      const rr = pk.b - last;
      rr1.push(rr); if (rr1.length > 8) rr1.shift();
      const lo = rrAvg2 === null ? 0 : 0.92 * rrAvg2;
      const hi = rrAvg2 === null ? Infinity : 1.16 * rrAvg2;
      if (rr >= lo && rr <= hi) { rr2.push(rr); if (rr2.length > 8) rr2.shift(); }
      const avg1 = rr1.reduce((s, v) => s + v, 0) / rr1.length;
      rrAvg2 = rr2.length ? rr2.reduce((s, v) => s + v, 0) / rr2.length : avg1;
      // The rhythm is irregular when the recent average leaves the regular beats' limits (92% to 116%).
      irregular = avg1 < 0.92 * rrAvg2 || avg1 > 1.16 * rrAvg2;
    }
    qrs.push(pk.b);
    slopes.push(pk.slope);
    lastPk = pk;
    kept.push(pk);
    pending = [];
  };
  const half = (f) => (irregular ? 0.5 * f() : f());
  // The T-wave test's reference: the mean maximal slope of the last eight QRS complexes (the paper compares with the
  // previous one; after a wide, slow ventricular beat that alone lets its own T wave through).
  const refSlope = () => { const r = slopes.slice(-8); return r.reduce((t, v) => t + v, 0) / r.length; };
  for (let i = 1; i < n - 1; i += 1) {
    if (!(mwi[i] > mwi[i - 1] && mwi[i] >= mwi[i + 1])) continue;
    const b0 = i - 2 - MWI_LAG;
    if (b0 < 0) continue;
    // locate the band-pass peak near the MWI rise
    let b = b0; let bm = 0;
    for (let k = Math.max(0, b0 - srch); k <= Math.min(n - 1, b0 + srch); k += 1) if (Math.abs(bp[k]) > bm) { bm = Math.abs(bp[k]); b = k; }
    const pk = { i, b, pkI: mwi[i], pkF: bm, slope: slopeAt(b) };
    const last = qrs.length ? qrs[qrs.length - 1] : null;
    if (last !== null && b - last < refr) {
      // Inside the refractory period, a much larger peak replaces the one just taken: the first was a P wave or
      // the onset, and this is the complex itself (a project addition; the paper simply ignores it).
      if (pk.pkI > 1.5 * lastPk.pkI && pk.pkF > lastPk.pkF) { qrs[qrs.length - 1] = b; slopes[slopes.length - 1] = pk.slope; lastPk = pk; kept[kept.length - 1] = pk; }
      continue;
    }
    // search back when a beat seems missed
    if (last !== null && rrAvg2 && b - last > 1.66 * rrAvg2 && pending.length) {
      const cands = pending.filter((p) => p.b - last >= refr && p.pkI > 0.5 * thrI() && p.pkF > 0.5 * thrF() && !(p.b - last < tWin && p.slope < 0.5 * refSlope()));
      if (cands.length) {
        const best = cands.reduce((a2, c) => (c.pkI > a2.pkI ? c : a2));
        accept(best, true);
      }
    }
    const lastNow = qrs.length ? qrs[qrs.length - 1] : null;
    if (lastNow !== null && b - lastNow < refr) continue;
    if (pk.pkI > half(thrI) && pk.pkF > half(thrF)) {
      if (lastNow !== null && b - lastNow < tWin && pk.slope < 0.5 * refSlope()) {
        NPKI = 0.125 * pk.pkI + 0.875 * NPKI; NPKF = 0.125 * pk.pkF + 0.875 * NPKF;
        pending.push(pk);
        continue;
      }
      accept(pk, false);
    } else {
      NPKI = 0.125 * pk.pkI + 0.875 * NPKI; NPKF = 0.125 * pk.pkF + 0.875 * NPKF;
      pending.push(pk);
    }
  }
  // Look-ahead (a project addition; the paper's detector runs in real time): of two detections closer than 240 ms,
  // one with less than half the other's integrated peak is a P or T wave, and is dropped.
  const gap = Math.round(0.24 * FS);
  const drop = new Set();
  for (let k = 1; k < kept.length; k += 1) {
    const a = kept[k - 1]; const c = kept[k];
    if (c.b - a.b < gap) {
      if (a.pkI < 0.5 * c.pkI) drop.add(k - 1);
      else if (c.pkI < 0.5 * a.pkI) drop.add(k);
    }
  }
  const finalB = kept.filter((_, k) => !drop.has(k)).map((p) => p.b);
  qrs.length = 0;
  qrs.push(...finalB);
  // map bp-timeline indices back to the reader's samples: subtract the band-pass delay, then rescale.
  const peaks = qrs.map((b) => Math.round(((b - BP_DELAY) * fs) / FS)).filter((s) => s >= 0 && s < x.length);
  return { peaks, searchBacks };
}

const sig = (x) => Number(x.toPrecision(4));
export const MAX_SAMPLES = 1500000;

export function qrsDetectTrace(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fs = measured(o.samplingRate);
  if (fs === null || !(fs >= 100 && fs <= 10000)) return { valid: false, message: 'Enter the sampling rate in samples per second, from 100 to 10,000. It is never guessed from the data.' };
  const parts = String(o.samples ?? '').split(/[\s,;]+/).filter(Boolean);
  if (!parts.length) return { valid: false, message: 'Enter the ECG samples of one lead, one per line or separated by commas.' };
  if (parts.length > MAX_SAMPLES) return { valid: false, message: `This page reads at most ${MAX_SAMPLES.toLocaleString('en-US')} samples (${sig(MAX_SAMPLES / fs / 60)} minutes at this rate); split the recording.` };
  const x = new Array(parts.length);
  for (let i = 0; i < parts.length; i += 1) {
    const v = Number(parts[i]);
    if (!Number.isFinite(v)) return { valid: false, message: `Sample ${i + 1} is not a number.` };
    // The filters feed back on their own output, so one overflowing sample would turn the rest of the trace to NaN
    // and end detection silently (spec-v1715); no ECG in millivolts or ADC counts comes near this bound.
    if (Math.abs(v) > 1e6) return { valid: false, message: `Sample ${i + 1} (${v}) is beyond ±1,000,000; enter the trace in its recorded units (millivolts or ADC counts).` };
    x[i] = v;
  }
  const seconds = x.length / fs;
  if (seconds < 5) return { valid: false, message: `This trace is ${sig(seconds)} seconds; the detector learns its levels over the first 2 seconds and needs at least 5.` };
  const { peaks, searchBacks } = detect(x, fs);
  if (peaks.length < 2) return { valid: false, message: 'Fewer than two beats were found. Check the sampling rate, the lead and that the samples are an ECG.' };
  const rr = peaks.slice(1).map((p, i) => ((p - peaks[i]) * 1000) / fs);
  const meanRr = rr.reduce((s, v) => s + v, 0) / rr.length;
  const times = peaks.map((p) => sig(p / fs));
  return {
    valid: true, beats: peaks.length, peaks, times, rr: rr.map((v) => Math.round(v * 10) / 10), heartRate: sig(60000 / meanRr), searchBacks, abnormal: false,
    band: `${peaks.length} beats detected in ${sig(seconds)} seconds; mean rate ${sig(60000 / meanRr)} per minute.`,
    bandLabel: `${peaks.length} beats`,
    notes: [
      `R-peak times (s): ${times.slice(0, 60).join(', ')}${times.length > 60 ? `, and ${times.length - 60} more` : ''}.`,
      `RR intervals (ms): ${rr.slice(0, 60).map((v) => Math.round(v)).join(', ')}${rr.length > 60 ? `, and ${rr.length - 60} more` : ''}; mean ${sig(meanRr)} ms.`,
      `${searchBacks} beat${searchBacks === 1 ? ' was' : 's were'} found by searching back after a long gap.`,
      'Validated on the 44 non-paced records of the MIT-BIH Arrhythmia Database (PhysioNet, ODC-By 1.0) with a 150 ms window: sensitivity 99.79%, positive predictivity 99.08%. Paced rhythms were not part of the gate.',
    ],
    note: 'Beats detected, not a rhythm interpretation: no beat is labeled normal or ectopic. Check the detections against the trace before using the intervals.',
  };
}
