// spec-v1471: GMI (%) = 3.31 + 0.02392 x mean glucose mg/dL; GMI (mmol/mol) = 12.71 + 4.70587 x
// mean glucose mmol/L (Bergenstal 2018, Diabetes Care).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gmi as g } from '../../lib/gmi-v1471.js';

test('Bergenstal 2018 Table 1: mean glucose mg/dL to GMI %', () => {
  const rows = [[100, 5.7], [125, 6.3], [150, 6.9], [175, 7.5], [200, 8.1], [225, 8.7], [250, 9.3]];
  for (const [mean, pct] of rows) assert.equal(g({ mean, unit: 'mg/dL' }).gmiPct, pct, `${mean} mg/dL`);
});

test('the band states both results', () => {
  assert.equal(g({ mean: '150', unit: 'mg/dL' }).band,
    'GMI 6.9% (52 mmol/mol) from a mean CGM glucose of 150 mg/dL.');
});

test('the mmol/L path uses the mmol/mol formula', () => {
  const r = g({ mean: 8.3, unit: 'mmol/L' });
  assert.equal(r.gmiMmolMol, 52);
  assert.equal(r.gmiPct, 6.9);
  assert.match(r.band, /from a mean CGM glucose of 8\.3 mmol\/L\./);
});

test('the two units agree within rounding', () => {
  for (const mgdl of [90, 150, 210, 300]) {
    const a = g({ mean: mgdl, unit: 'mg/dL' });
    const b = g({ mean: mgdl / 18, unit: 'mmol/L' });
    assert.equal(a.gmiPct, b.gmiPct);
    assert.equal(a.gmiMmolMol, b.gmiMmolMol);
  }
});

test('data sufficiency is noted and never refuses', () => {
  const none = g({ mean: 150, unit: 'mg/dL' }).notes[1];
  assert.match(none, /were not entered; the consensus recommends 14 days with at least 70% of data/);
  const short = g({ mean: 150, unit: 'mg/dL', days: 10, active: 60 });
  assert.equal(short.valid, true);
  assert.match(short.notes[1], /below the consensus recommendation: 10 days of wear and 60% of data/);
  assert.match(g({ mean: 150, unit: 'mg/dL', days: 14, active: 85 }).notes[1], /meet the consensus/);
  assert.match(g({ mean: 150, unit: 'mg/dL', days: 14 }).notes[1], /Data sufficiency was not entered/);
});

test('a measure, not a verdict; the 2026 update is named', () => {
  const r = g({ mean: 250, unit: 'mg/dL' });
  assert.equal(r.abnormal, false);
  assert.ok(r.notes.some((n) => n.includes('proposed in 2026')));
  assert.ok(r.notes.some((n) => n.includes('not a laboratory A1C')));
});

test('blank mean or unit asks', () => {
  assert.equal(g({ unit: 'mg/dL' }).message, 'Enter the mean glucose from the CGM report.');
  assert.equal(g({ mean: '  ', unit: 'mg/dL' }).valid, false);
  assert.match(g({ mean: 150 }).message, /Choose the glucose unit/);
});

test('out-of-range values refused', () => {
  assert.equal(g({ mean: 30, unit: 'mg/dL' }).valid, false);
  assert.equal(g({ mean: 700, unit: 'mg/dL' }).valid, false);
  assert.equal(g({ mean: 150, unit: 'mmol/L' }).valid, false);
  assert.equal(g({ mean: 1, unit: 'mmol/L' }).valid, false);
  assert.match(g({ mean: 150, unit: 'mg/dL', days: 120 }).message, /Days of wear must be between 1 and 90/);
  assert.equal(g({ mean: 150, unit: 'mg/dL', active: 0 }).valid, false);
  assert.equal(g({ mean: 150, unit: 'mg/dL', active: 101 }).valid, false);
});
