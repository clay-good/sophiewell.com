// Signal arithmetic for the biosignal tools (spec-v1705): an iterative radix-2 FFT, a periodic Hann window, Welch's
// averaged periodogram as a one-sided power spectral density, a least-squares linear detrend, and a natural cubic
// spline. Pure: no DOM, no clock, no network; every routine is checked in test/unit/dsp.test.js (Parseval, a known
// sine, a cubic reproduced by its spline).

// fft(re, im) in place; the length must be a power of two.
export function fft(re, im) {
  const n = re.length;
  if (n & (n - 1)) throw new RangeError('fft: the length must be a power of two');
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k += 1) {
        const ar = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const ai = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k + len / 2] = re[i + k] - ar;
        im[i + k + len / 2] = im[i + k] - ai;
        re[i + k] += ar;
        im[i + k] += ai;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
}

// The periodic Hann window, w[i] = 0.5 - 0.5 cos(2 pi i / n): its DFT has three nonzero bins, so a sine on a bin
// spreads 1 : 4 : 1 in power over it and its two neighbors.
export const hann = (n) => Array.from({ length: n }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / n));

export const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

// detrend(x) -> x minus its least-squares straight line.
export function detrend(x) {
  const n = x.length;
  const tm = (n - 1) / 2;
  const xm = mean(x);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) { num += (i - tm) * (x[i] - xm); den += (i - tm) ** 2; }
  const b = den ? num / den : 0;
  return x.map((v, i) => v - xm - b * (i - tm));
}

// welch(x, fs, seg) -> { freqs, psd, df, segments } with 50% overlap and a periodic Hann window; psd is one-sided
// (units squared per Hz), so summing psd x df over all bins returns the signal's variance (Parseval).
export function welch(x, fs, seg) {
  const step = seg / 2;
  const count = Math.floor((x.length - seg) / step) + 1;
  if (count < 1) return { error: 'The recording is shorter than one analysis window.' };
  const w = hann(seg);
  const u = w.reduce((s, v) => s + v * v, 0);
  const half = seg / 2;
  const psd = new Array(half + 1).fill(0);
  for (let c = 0; c < count; c += 1) {
    const re = new Array(seg);
    const im = new Array(seg).fill(0);
    for (let i = 0; i < seg; i += 1) re[i] = x[c * step + i] * w[i];
    fft(re, im);
    for (let k = 0; k <= half; k += 1) {
      const p = (re[k] * re[k] + im[k] * im[k]) / (fs * u);
      psd[k] += (k === 0 || k === half ? 1 : 2) * p;
    }
  }
  return { freqs: psd.map((_, k) => (k * fs) / seg), psd: psd.map((p) => p / count), df: fs / seg, segments: count };
}

// spline(xs, ys) -> f(t), the natural cubic spline through the points (second derivative 0 at both ends).
export function spline(xs, ys) {
  const n = xs.length;
  const h = xs.slice(1).map((x, i) => x - xs[i]);
  const alpha = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i += 1) alpha[i] = (3 / h[i]) * (ys[i + 1] - ys[i]) - (3 / h[i - 1]) * (ys[i] - ys[i - 1]);
  const l = new Array(n).fill(1);
  const mu = new Array(n).fill(0);
  const z = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i += 1) {
    l[i] = 2 * (xs[i + 1] - xs[i - 1]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }
  const c = new Array(n).fill(0);
  const b = new Array(n).fill(0);
  const d = new Array(n).fill(0);
  for (let j = n - 2; j >= 0; j -= 1) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (ys[j + 1] - ys[j]) / h[j] - (h[j] * (c[j + 1] + 2 * c[j])) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }
  return (t) => {
    let lo = 0;
    let hi = n - 2;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (xs[m] <= t) lo = m; else hi = m - 1; }
    const dx = t - xs[lo];
    return ys[lo] + b[lo] * dx + c[lo] * dx * dx + d[lo] * dx * dx * dx;
  };
}

// bandPower(spec, lo, hi, { loInclusive, hiInclusive }) -> the sum of psd x df over the bins in the band.
export function bandPower(spec, lo, hi, { loInclusive = false, hiInclusive = true } = {}) {
  let s = 0;
  for (let k = 0; k < spec.freqs.length; k += 1) {
    const f = spec.freqs[k];
    const inLo = loInclusive ? f >= lo - 1e-12 : f > lo + 1e-12;
    const inHi = hiInclusive ? f <= hi + 1e-12 : f < hi - 1e-12;
    if (inLo && inHi) s += spec.psd[k] * spec.df;
  }
  return s;
}
