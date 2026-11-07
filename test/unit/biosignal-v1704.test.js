// spec-v1704: biosignal-analysis tools 2, 5, 6 and 7. Every vector is from the change's design.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hrvTimeDomain as hrv } from '../../lib/hrv-time-domain-v1704.js';
import { ectopyBurden as burden } from '../../lib/ectopy-burden-v1704.js';
import { spo2ArmsAccuracy as arms, baLimits } from '../../lib/spo2-arms-accuracy-v1704.js';
import { pwvCarotidFemoral as pwv } from '../../lib/pwv-carotid-femoral-v1704.js';

const NOW = new Date('2026-11-07T12:00:00Z');

test('HRV: 800, 810, 790, 820, 800 gives RMSSD 21.21 ms and no NN50', () => {
  const r = hrv({ intervals: '800, 810, 790, 820, 800' });
  assert.deepEqual([r.rmssd, r.nn50, r.pnn50], [21.21, 0, 0]);
});

test('HRV: 800, 860, ... gives RMSSD 60, SDNN 32.86 (29.39 with n), pNN50 80% (100% by differences), triangular index 1.667', () => {
  const r = hrv({ intervals: '800\n860\n800\n860\n800' });
  assert.deepEqual([r.rmssd, r.sdnn, r.nn50, r.pnn50, r.triangularIndex], [60, 32.86, 4, 80, 1.667]);
  assert.ok(r.notes.some((n) => n.includes('29.39 ms with n')));
  assert.ok(r.notes.some((n) => n.includes('100% of the 4 differences')));
  assert.ok(r.notes.some((n) => n.includes('inappropriate to compare SDNN')));
});

test('HRV: flagged intervals are listed and kept; SDANN needs two 5-minute segments; refusals', () => {
  const r = hrv({ intervals: '800 800 1200 800 800', flagPercent: '20' });
  assert.ok(r.notes.some((n) => n.startsWith('2 intervals differ') && n.includes('were kept')));
  const long = hrv({ intervals: Array(700).fill('1000').join(',') });
  assert.ok(long.notes.some((n) => n.startsWith('SDANN 0 ms and SDNN index 0 ms over 2 complete 5-minute segments')));
  assert.match(hrv({ intervals: '0.8, 0.86, 0.8' }).message, /milliseconds/);
  assert.match(hrv({ intervals: '800' }).message, /at least three/);
});

test('ectopy burden: 12,000 of 100,000 beats over 24 h; 2 h of AF in 48 h', () => {
  const b = burden({ totalBeats: '100000', ventricular: '12000', monitoredHours: '24' });
  assert.ok(b.notes[0].includes('= 12%; 500 per hour'));
  assert.equal(burden({ monitoredHours: '48', arrhythmiaHours: '2' }).band, 'Burden: 4.167% of the time.');
  assert.match(burden({ totalBeats: '10', ventricular: '11' }).message, /more than the total/);
  assert.match(burden({}).message, /^Enter ectopic beat counts/);
});

test('Arms: three subjects with differences (1, 3), (2, 4), (0, 2)', () => {
  const r = arms({ sensor: 'transmittance', pairs: 'a, 91, 90\na, 93, 90\nb, 92, 90\nb, 94, 90\nc, 90, 90\nc, 92, 90' }, NOW);
  assert.deepEqual([r.arms, r.bias, r.lower, r.upper], [2.38, 2, -0.7719, 4.772]);
  assert.ok(r.notes.some((n) => n.includes('within-subject variance 2, between-subject variance 0 (floored at 0)')));
});

test('Bland and Altman 2007 worked example', () => {
  const b = baLimits({ n: 12, sumM: 60, sumM2: 312, msBetween: 4.2090856, msWithin: 0.170714026, bias: 0.6021667 });
  assert.equal(Number(b.divisor.toFixed(4)), 4.9818);
  assert.equal(Number(b.total.toFixed(5)), 0.98134);
  assert.equal(Number(b.lower.toFixed(5)), -1.33946);
  assert.equal(Number(b.upper.toFixed(5)), 2.54379);
});

test('the 2013 pigmentation minimum: 10 -> 2, 13 -> 2, 14 -> 3, 20 -> 3; the draft needs 38 per MST group of 150', () => {
  const need = (n) => {
    const pairs = []; const subs = [];
    for (let i = 0; i < n; i += 1) { pairs.push(`s${i},91,90`, `s${i},92,90`); subs.push(`s${i},no`); }
    const r = arms({ sensor: 'ear', pairs: pairs.join('\n'), subjects: subs.join('\n') }, NOW);
    return Number(/asks for at least (\d+)/.exec(r.notes.find((x) => x.startsWith('Darkly')))[1]);
  };
  assert.deepEqual([need(10), need(13), need(14), need(20)], [2, 2, 3, 3]);
  const pairs = []; const subs = [];
  for (let i = 0; i < 150; i += 1) { pairs.push(`p${i},91,90`, `p${i},92,90`); subs.push(`p${i},no,${1 + (i % 10)},10,${i % 2 ? 'F' : 'M'}`); }
  const r = arms({ sensor: 'ear', pairs: pairs.join('\n'), subjects: subs.join('\n') }, NOW);
  assert.ok(r.notes.some((n) => n.startsWith('MST 1-4: 60 participants (the draft asks for at least 38, 25% of 150)')));
  assert.ok(!r.notes.some((n) => /\bpass/i.test(n)), 'no draft "pass" is printed');
});

test('Arms refusals and the re-read date', () => {
  assert.match(arms({ pairs: 'a,91,90' }, NOW).message, /^Choose the sensor/);
  assert.match(arms({ sensor: 'ear', pairs: 'a,91,90\na,92,90' }, NOW).message, /two subjects/);
  assert.match(arms({ sensor: 'ear', pairs: 'a,91,90\nb,92,90' }, NOW).message, /two or more pairs/);
  assert.match(arms({ sensor: 'ear', pairs: 'a,91,90\na,92,90\nb,93,90' }, new Date('2027-06-01')).message, /due to be read again/);
});

test('PWV: 80% of 600 mm over 60 ms is 8.0 m/s with the 10 m/s reference; subtraction 9.17 m/s without it', () => {
  const a = pwv({ method: 'direct80', directMm: '600', transitMs: '60' });
  assert.equal(a.pwv, 8);
  assert.ok(a.notes.some((n) => n.startsWith('Reference value for the 80% method: 10 m/s')));
  const b = pwv({ method: 'subtraction', notchFemoralMm: '700', notchCarotidMm: '150', transitMs: '60' });
  assert.equal(b.pwv, 9.17);
  assert.ok(!b.notes.some((n) => n.includes('10 m/s (')));
  assert.match(pwv({ method: 'subtraction', notchFemoralMm: '100', notchCarotidMm: '150', transitMs: '60' }).message, /longer than/);
});
