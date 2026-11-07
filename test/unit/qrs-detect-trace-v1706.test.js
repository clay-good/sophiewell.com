// spec-v1706: the Pan-Tompkins detector. Filter checks and the synthetic vector from design.md; the first 20 seconds
// of MIT-BIH record 100 (ODC-By 1.0) as a real-trace fixture. The full ship gate runs by hand with
// scripts/validate-qrs-mitdb.mjs on a local copy of the database (docs/spec-v1706.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { highPass, lowPass, detect, qrsDetectTrace } from '../../lib/qrs-detect-trace-v1706.js';
import { score } from '../../scripts/validate-qrs-mitdb.mjs';

const gain = (h, f, fs = 200) => { let re = 0; let im = 0; h.forEach((v, n) => { re += v * Math.cos((2 * Math.PI * f * n) / fs); im -= v * Math.sin((2 * Math.PI * f * n) / fs); }); return Math.hypot(re, im); };

test('the high-pass built from the paper\'s sentence: finite, gain 32 at 50 Hz, -3 dB at 4.72 Hz', () => {
  const imp = new Array(200).fill(0); imp[0] = 1;
  const h = highPass(imp);
  assert.ok(Array.from(h.slice(32)).every((v) => Math.abs(v) < 1e-12), 'nothing after 32 samples');
  assert.ok(Math.abs(gain(h, 50) - 32) / 32 < 0.001);
  let f3 = 0;
  for (let f = 0.01; f < 20; f += 0.001) if (gain(h, f) >= 32 / Math.SQRT2) { f3 = f; break; }
  assert.ok(Math.abs(f3 - 4.72) <= 0.05, String(f3));
});

test('the cascade\'s -3 dB band is 4.91 to 11.78 Hz', () => {
  const imp = new Array(400).fill(0); imp[0] = 1;
  const bp = highPass(lowPass(imp));
  let pk = 0; let pf = 0;
  for (let f = 0.1; f < 40; f += 0.01) { const g = gain(bp, f); if (g > pk) { pk = g; pf = f; } }
  let lo = 0; let hi = 0;
  for (let f = 0.1; f < pf; f += 0.001) if (gain(bp, f) >= pk / Math.SQRT2) { lo = f; break; }
  for (let f = pf; f < 60; f += 0.001) if (gain(bp, f) < pk / Math.SQRT2) { hi = f; break; }
  assert.deepEqual([Number(lo.toFixed(2)), Number(hi.toFixed(2))], [4.91, 11.78]);
});

test('a synthetic 360 Hz trace with a complex every second: 10 peaks, nine 1,000 ms intervals, 60 per minute', () => {
  const fs = 360; const x = new Array(fs * 10 + fs / 2).fill(0);
  for (let k = 0; k < 10; k += 1) { const c = Math.round(fs * (0.25 + k)); for (let i = -30; i <= 30; i += 1) x[c + i] += 1000 * Math.exp(-(i * i) / 50); }
  const r = qrsDetectTrace({ samplingRate: '360', samples: x.join(',') });
  assert.equal(r.beats, 10);
  assert.ok(r.rr.every((v) => Math.abs(v - 1000) <= 1000 / 360));
  assert.equal(r.heartRate, 60);
});

test('MIT-BIH record 100, first 20 seconds: every reference beat found within 150 ms', () => {
  const fx = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'mitdb', '100-first-20s.json'), 'utf8'));
  const { peaks } = detect(fx.samples, fx.samplingRate);
  const s = score(peaks, fx.beats, Math.round(0.15 * 360));
  assert.equal(s.fn, 0);
  assert.ok(s.fp <= 1, `false positives ${s.fp}`);
});

test('a trace that starts far from zero is still read (record 232 begins at 975 units)', () => {
  const fs = 360; const x = new Array(fs * 8).fill(975);
  for (let k = 0; k < 8; k += 1) { const c = Math.round(fs * (0.4 + k)); for (let i = -30; i <= 30; i += 1) x[c + i] += 800 * Math.exp(-(i * i) / 50); }
  assert.equal(qrsDetectTrace({ samplingRate: '360', samples: x.join(',') }).beats, 8);
});

test('refusals: no rate, too short, no beats', () => {
  assert.match(qrsDetectTrace({ samples: '1,2,3' }).message, /sampling rate/);
  assert.match(qrsDetectTrace({ samplingRate: '360', samples: '1,2,3' }).message, /at least 5/);
  assert.match(qrsDetectTrace({ samplingRate: '360', samples: new Array(3600).fill(0).join(',') }).message, /Fewer than two beats/);
});

test('spec-v1715: one overflowing sample is refused, not allowed to end detection silently', () => {
  const tr = Array.from({ length: 3600 }, (_, i) => (i % 360 < 8 ? 1 : 0));
  tr[1000] = 1e308;
  const r = qrsDetectTrace({ samplingRate: 360, samples: tr.join('\n') });
  assert.equal(r.valid, false);
  assert.match(r.message, /Sample 1001/);
});
