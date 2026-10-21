// spec-v1658: laboratory quality tools, against 42 CFR 493.931, 493.941, 493.841/851 and 493.1255.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mean, sampleSd, nearestRank, median, leastSquares } from '../../lib/lab-stats.js';
import { leveyJenningsLimits as lj } from '../../lib/levey-jennings-limits-v1658.js';
import { cliaPtAcceptance as clia, ANALYTES } from '../../lib/clia-pt-acceptance-v1658.js';
import { ptEventScore as score } from '../../lib/pt-event-score-v1658.js';
import { calibrationVerification as cal } from '../../lib/calibration-verification-v1658.js';
import { turnaroundTimePercentile as tat } from '../../lib/turnaround-time-percentile-v1658.js';

test('lab-stats: mean, sample SD, nearest rank on odd and even counts, least squares', () => {
  assert.equal(mean([2, 4, 6]), 4);
  assert.equal(sampleSd([2, 4, 6]), 2);
  assert.equal(nearestRank([5, 1, 3, 2, 4], 90), 5);
  assert.equal(nearestRank([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90), 9);
  assert.equal(nearestRank([1, 2, 3, 4], 50), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  const l = leastSquares([1, 2, 3], [2, 4, 6]);
  assert.equal(l.slope, 2);
  assert.equal(l.intercept, 0);
  assert.equal(l.r, 1);
});

test('Levey-Jennings: limits from the series; outliers named; minimum count asked for', () => {
  const r = lj({ results: '98\n100\n102\n100\n100' });
  assert.equal(r.mean, 100);
  assert.equal(r.sd, 1.414);
  assert.match(r.band, /±2 SD 97.172 to 102.828/);
  assert.ok(r.notes.some((n) => /^Enter the laboratory's minimum/.test(n)));
  assert.ok(lj({ results: '100\n100\n100\n100\n100\n100\n100\n100\n100\n110' }).notes.some((n) => /beyond ±2 SD/.test(n)));
  assert.ok(lj({ results: '1\n2\n3', minimumCount: '20' }).notes.some((n) => /fewer than the laboratory's minimum of 20/.test(n)));
  assert.equal(lj({ results: '2026-01-01, 98\n2026-01-02, 102' }).mean, 100);
  assert.equal(lj({ results: '5' }).valid, false);
  assert.match(lj({ results: '5\nabc' }).message, /Line 2/);
});

test('CLIA: every row is in the table; the greater-of branches at both sides', () => {
  assert.equal(ANALYTES.length, 47);
  // Creatinine: target 1.0 -> 10% is 0.1, the 0.2 mg/dL floor wins; target 4.0 -> 10% is 0.4 and wins.
  assert.equal(clia({ analyte: 'creatinine', target: '1.0', response: '1.2' }).acceptable, true);
  assert.equal(clia({ analyte: 'creatinine', target: '1.0', response: '1.21' }).acceptable, false);
  assert.equal(clia({ analyte: 'creatinine', target: '4.0', response: '4.4' }).acceptable, true);
  assert.equal(clia({ analyte: 'creatinine', target: '4.0', response: '4.41' }).acceptable, false);
  assert.equal(clia({ analyte: 'ph', target: '7.40', response: '7.44' }).acceptable, true);
  assert.equal(clia({ analyte: 'ph', target: '7.40', response: '7.45' }).acceptable, false);
  assert.equal(clia({ analyte: 'sodium', target: '140', response: '144' }).acceptable, true);
  assert.equal(clia({ analyte: 'plt', target: '200', response: '250' }).acceptable, true);
  assert.equal(clia({ analyte: 'plt', target: '200', response: '251' }).acceptable, false);
  assert.equal(clia({ analyte: 'wbc-diff', target: '60', response: '66', sd: '2' }).acceptable, true);
  assert.equal(clia({ analyte: 'wbc-diff', target: '60', response: '66.1', sd: '2' }).acceptable, false);
  const dl = clia({ analyte: 'glucose', target: '100', response: '104', decisionLevel: '50' });
  assert.ok(dl.notes.some((n) => /±6 mg\/dL, or 12% as an allowable total error/.test(n)));
  assert.equal(clia({ target: '1', response: '1' }).valid, false);
});

test('event score: per analyte and overall at 80%; two consecutive and two of three', () => {
  const r = score({ analytes: 'Glucose, 4, 5\nSodium, 5, 5\nPotassium, 3, 5' });
  assert.equal(r.eventScore, 80);
  assert.equal(r.eventSatisfactory, true);
  assert.deepEqual(r.unsatisfactoryAnalytes, ['Potassium']);
  const bad = 'Glucose, 3, 5\nSodium, 3, 5';
  assert.match(score({ analytes: bad, previousEvent: 'unsatisfactory' }).band, /two consecutive/);
  assert.match(score({ analytes: bad, previousEvent: 'satisfactory', eventBeforeThat: 'unsatisfactory' }).band, /two out of three/);
  assert.match(score({ analytes: 'A, 5, 5', previousEvent: 'satisfactory', eventBeforeThat: 'satisfactory' }).band, /Not unsuccessful/);
  assert.match(score({ analytes: 'A, 6, 5' }).message, /more acceptable/);
  assert.equal(score({}).valid, false);
});

test('calibration verification: three levels, recovery, line, range coverage', () => {
  const r = cal({ levels: '10, 10.2\n100, 98\n500, 512', limitPct: '3', rangeLow: '10', rangeHigh: '500' });
  assert.equal(r.pass, true);
  assert.ok(r.notes.some((n) => /whole range is spanned/.test(n)));
  assert.equal(cal({ levels: '10, 10.5\n100, 98\n500, 512', limitPct: '3' }).pass, false);
  assert.match(cal({ levels: '10, 10\n100, 100', limitPct: '3' }).message, /three levels/);
  assert.match(cal({ levels: '10, 10\n100, 100\n200, 200' }).message, /acceptable limit/);
  assert.ok(cal({ levels: '50, 50\n100, 100\n200, 200', limitPct: '5', rangeLow: '0', rangeHigh: '400' }).notes.some((n) => /37.5% of the range/.test(n)));
});

test('turnaround: median, nearest-rank 90th, share meeting target', () => {
  const r = tat({ minutes: '30\n45\n50\n60\n40\n55\n35\n65\n70\n120', target: '60' });
  assert.equal(r.median, 52.5);
  assert.equal(r.percentile, 70);
  assert.equal(r.share, 70);
  assert.equal(tat({ minutes: '10\n20', percentile: '50' }).percentile, 10);
  assert.equal(tat({ minutes: '' }).valid, false);
  assert.equal(tat({ minutes: '10', percentile: '100' }).valid, false);
});
