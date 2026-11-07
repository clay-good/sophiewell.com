// spec-v1705: lib/dsp.js. Parseval for the Welch periodogram, the Hann window's 1 : 4 : 1 spread, a sine's power,
// detrending, and the natural cubic spline (exact at its knots and on a straight line; a natural spline does not
// reproduce a general cubic, because its end conditions force a zero second derivative).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fft, hann, detrend, welch, spline, bandPower, mean } from '../../lib/dsp.js';

test('the FFT of a unit impulse is flat, and a cosine lands on its bin', () => {
  const re = [1, 0, 0, 0, 0, 0, 0, 0]; const im = new Array(8).fill(0);
  fft(re, im);
  assert.deepEqual(re.map((x) => Number(x.toFixed(12))), [1, 1, 1, 1, 1, 1, 1, 1]);
  const c = Array.from({ length: 16 }, (_, i) => Math.cos((2 * Math.PI * 3 * i) / 16)); const ci = new Array(16).fill(0);
  fft(c, ci);
  assert.equal(Number(c[3].toFixed(9)), 8);
  assert.throws(() => fft([1, 2, 3], [0, 0, 0]), /power of two/);
});

test('Parseval: the Welch spectrum sums to the variance; a unit sine has power 0.5', () => {
  const x = Array.from({ length: 1024 }, (_, i) => Math.sin((2 * Math.PI * 10 * i) / 256) + 0.3 * Math.sin((2 * Math.PI * 37 * i) / 256));
  const s = welch(x, 256, 512);
  const total = s.psd.reduce((a, p) => a + p * s.df, 0);
  const v = mean(x.map((y) => y * y)) - mean(x) ** 2;
  assert.ok(Math.abs(total - v) / v < 1e-9, `${total} vs ${v}`);
  assert.equal(Number(bandPower(s, 9, 11, { loInclusive: true }).toFixed(6)), 0.5);
  assert.equal(s.segments, 3);
});

test('the periodic Hann window spreads an on-bin tone 1 : 4 : 1', () => {
  const w = hann(8);
  assert.equal(w[0], 0);
  assert.equal(Number(w[4].toFixed(12)), 1);
  const x = Array.from({ length: 512 }, (_, i) => Math.sin((2 * Math.PI * 13.5 * i) / 256));
  const s = welch(x, 256, 512);
  const k = s.freqs.indexOf(13.5);
  assert.equal(Number((s.psd[k] / s.psd[k - 1]).toFixed(9)), 4);
  assert.equal(Number((s.psd[k + 1] / s.psd[k - 1]).toFixed(9)), 1);
});

test('detrend removes a straight line exactly', () => {
  const d = detrend(Array.from({ length: 10 }, (_, i) => 3 + 2 * i));
  assert.ok(d.every((v) => Math.abs(v) < 1e-12));
});

test('the natural spline is exact at its knots and on a straight line', () => {
  const xs = [0, 1, 2.5, 3, 5];
  const f = spline(xs, [2, -1, 4, 0, 3]);
  assert.deepEqual(xs.map((x) => Number(f(x).toFixed(12))), [2, -1, 4, 0, 3]);
  const g = spline(xs, xs.map((x) => 1 + 2 * x));
  for (const t of [0.3, 1.7, 2.9, 4.4]) assert.equal(Number(g(t).toFixed(12)), Number((1 + 2 * t).toFixed(12)));
});
