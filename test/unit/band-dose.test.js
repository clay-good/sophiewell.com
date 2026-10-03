// spec-v1540 §4.1 acceptance: half-open bands, closed top bands, off-chart refusal, blank refusal, and
// weight over age. Every band edge is a case: just below, at, and just above (spec-v1540 §10).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findBand, bandDose, achievedPerKg } from '../../lib/band-dose.js';

// A made-up chart shaped like WHO's, not a WHO table.
const WT = { unit: 'kg', bands: [{ lo: 5, hi: 15, dose: '1 tablet' }, { lo: 15, hi: 25, dose: '2 tablets' }, { lo: 25, hi: 35, dose: '3 tablets' }, { lo: 35, dose: '4 tablets' }] };
const AGE = { unit: 'months', bands: [{ lo: 6, hi: 36, dose: '1 tablet' }, { lo: 36, hi: 96, dose: '2 tablets' }] };
const SPEC = { weightTable: WT, ageTable: AGE, weightLabel: 'weight in kg', ageLabel: 'age in months' };

test('bands are half-open: each edge belongs to the band above it', () => {
  for (const [w, dose] of [[5, '1 tablet'], [14.99, '1 tablet'], [15, '2 tablets'], [24.999, '2 tablets'], [25, '3 tablets'], [34.9, '3 tablets'], [35, '4 tablets'], [120, '4 tablets']]) {
    assert.equal(findBand(WT, w).band.dose, dose, `${w} kg`);
  }
});

test('a closed top band includes its upper edge, and nothing past it', () => {
  const closed = { unit: 'kg', closedTop: true, bands: [{ lo: 5, hi: 14, dose: 'A' }, { lo: 14, hi: 19, dose: 'B' }] };
  assert.equal(findBand(closed, 13.99).band.dose, 'A');
  assert.equal(findBand(closed, 14).band.dose, 'B');
  assert.equal(findBand(closed, 19).band.dose, 'B');
  assert.equal(findBand(closed, 19.01).off, 'above');
  assert.match(bandDose({ weight: '20' }, { weightTable: closed }).message, /outside this chart, which covers 5 to 19 kg/);
});

test('off the chart is refused with its range, never the nearest band', () => {
  assert.equal(findBand(WT, 4.99).off, 'below');
  const r = bandDose({ weight: '4.9' }, SPEC);
  assert.equal(r.valid, false);
  assert.match(r.message, /4\.9 kg is outside this chart, which covers 5 kg and above\. It gives no dose below/);
});

test('a gap the source leaves is refused by name', () => {
  const gap = { unit: 'kg', bands: [{ lo: 5, hi: 80, dose: 'X' }, { lo: 80, hi: 80.01, dose: null }, { lo: 80.01, dose: 'Y' }] };
  assert.match(bandDose({ weight: '80' }, { weightTable: gap }).message, /falls in a gap of this chart/);
});

test('blank is refused: an empty weight is not zero and does not land in the first band', () => {
  assert.equal(bandDose({}, SPEC).valid, false);
  assert.match(bandDose({ weight: '  ' }, SPEC).message, /Enter the weight in kg or, if it is not known, the age in months/);
  assert.match(bandDose({ weight: '' }, { weightTable: WT }).message, /^Enter the weight\.$/);
  assert.equal(bandDose({ weight: '0' }, SPEC).valid, false);
});

test('weight beats age; age is the fallback and says so; a disagreeing age band is named', () => {
  const both = bandDose({ weight: '16', age: '12' }, SPEC);
  assert.equal(both.by, 'weight');
  assert.equal(both.band.dose, '2 tablets');
  assert.match(both.notes[0], /age in months falls in a different band \(1 tablet\); the weight in kg is used/);
  const agree = bandDose({ weight: '10', age: '12' }, SPEC);
  assert.deepEqual(agree.notes, []);
  const ageOnly = bandDose({ age: '40' }, SPEC);
  assert.equal(ageOnly.by, 'age');
  assert.equal(ageOnly.band.dose, '2 tablets');
  assert.match(ageOnly.notes[0], /No weight in kg was entered, so the age in months band is used/);
  assert.match(bandDose({ age: '3' }, SPEC).message, /3 months is outside this chart/);
  assert.equal(bandDose({ weight: '10', age: '200' }, SPEC).band.dose, '1 tablet', 'an off-chart age never blocks a weight answer');
});

test('the achieved mg/kg is shown, never used to change the dose', () => {
  assert.deepEqual(achievedPerKg(250, 10, [20, 30]), { perKg: 25, outside: false });
  assert.deepEqual(achievedPerKg(250, 14.9, [20, 30]), { perKg: 16.8, outside: true });
});
