// spec-v1705: biosignal-analysis tools 3 and 4. Vectors from the change's design.md; where the design's own rules
// disagree with its 90-second vector, the rules are followed and the test says so.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hrvFrequencyDomain as hrv } from '../../lib/hrv-frequency-domain-v1705.js';
import { eegBandPower as eeg } from '../../lib/eeg-band-power-v1705.js';

// A synthetic series: mean RR 1,000 ms with 30 ms at 0.1 Hz (LF, true power 450 ms²) and 50 ms at 0.25 Hz (HF, 1,250).
function series(seconds) {
  const rr = [];
  let t = 0;
  while (t < seconds) { const r = 1000 + 30 * Math.sin(2 * Math.PI * 0.1 * t) + 50 * Math.sin(2 * Math.PI * 0.25 * t); rr.push(r.toFixed(3)); t += r / 1000; }
  return rr.join(',');
}
const near = (x, want) => Math.abs(x - want) / want <= 0.05;

test('5 minutes: LF and HF within 5% of 450 and 1,250 ms², LF/HF within 5% of 0.36', () => {
  const r = hrv({ recording: 'short', intervals: series(300) });
  assert.ok(near(r.lf, 450), String(r.lf));
  assert.ok(near(r.hf, 1250), String(r.hf));
  assert.ok(near(r.lfhf, 0.36), String(r.lfhf));
  assert.equal(r.vlf, null, 'VLF from 5 minutes or less is withheld');
});

test('length rules: 100 s prints HF only; under 96 s refuses (two 64-s windows)', () => {
  // design.md's vector says a 90-second series prints HF and LF; its own rules (about 2 minutes for LF; fewer than
  // two Welch windows refuses) cannot both hold at 90 s, so the rules are followed.
  const short = hrv({ recording: 'short', intervals: series(100) });
  assert.equal(short.lf, null);
  assert.ok(short.hf > 0);
  assert.match(hrv({ recording: 'short', intervals: series(80) }).message, /at least 96 seconds/);
  assert.ok(hrv({ recording: 'short', intervals: series(150) }).lf > 0);
  assert.match(hrv({ intervals: series(300) }).message, /^Choose whether/);
});

const sine = (f, fs = 256, n = 1024) => Array.from({ length: n }, (_, i) => Math.sin((2 * Math.PI * f * i) / fs)).join(',');

test('EEG at 256 Hz, 4 s, 2 s windows: 10 Hz is alpha 100%; 13.5 Hz beta 83.33%; 13 Hz alpha 83.33%', () => {
  assert.equal(eeg({ samplingRate: '256', samples: sine(10) }).relative.alpha, 100);
  const b = eeg({ samplingRate: '256', samples: sine(13.5) });
  assert.deepEqual([b.relative.beta, b.relative.alpha], [83.33, 16.67]);
  const a = eeg({ samplingRate: '256', samples: sine(13) });
  assert.deepEqual([a.relative.alpha, a.relative.beta], [83.33, 16.67]);
  assert.equal(a.peak, 13);
});

test('EEG: gamma above the Nyquist frequency is not measurable; refusals', () => {
  const r = eeg({ samplingRate: '100', samples: sine(10, 100, 400) });
  assert.ok(r.notes.some((n) => n.startsWith('gamma') && n.includes('not measurable above it')));
  assert.match(eeg({ samples: sine(10) }).message, /sampling rate/);
  assert.match(eeg({ samplingRate: '256', samples: '1,2,3' }).message, /window needs 512/);
});

test('spec-v1715 review fixes: no ULF (the window cannot resolve it); VLF needs 5 minutes for either type; EEG window 2 s or more', () => {
  const mk = (sec) => { const a = []; let t = 0; while (t < sec) { const x = 800 + 40 * Math.sin(2 * Math.PI * 0.25 * t) + 30 * Math.sin(2 * Math.PI * 0.1 * t); a.push(x.toFixed(1)); t += x / 1000; } return a.join('\n'); };
  const short24 = hrv({ recording: 'long', intervals: mk(110) });
  assert.equal(short24.vlf, null);
  assert.doesNotMatch(short24.notes.join(' '), /^ULF \(/m);
  assert.match(short24.notes.join(' '), /ULF \(below 0\.003 Hz\) is not computed/);
  assert.notEqual(hrv({ recording: 'long', intervals: mk(400) }).vlf, null);
  const sine = Array.from({ length: 256 * 20 }, (_, i) => Math.sin((2 * Math.PI * 10 * i) / 256).toFixed(4)).join('\n');
  for (const seg of ['0.001', '0.01', '1']) assert.equal(eeg({ samplingRate: 256, samples: sine, segmentSeconds: seg }).valid, false);
  assert.match(eeg({ samplingRate: 256, samples: sine, segmentSeconds: '2' }).band, /alpha/);
});
