// spec-v526: the neonatal SOFA (nSOFA).
// Worked-example tests: every respiratory row and the deliberate non-intubated blind spot, the full
// cardiovascular grid over inotropes x steroids, the overlapping platelet rows resolved highest-wins, the
// 0-15 ceiling, and the guards. Subscores and cut points transcribed from Wynn and Polin 2020 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nsofa, INOTROPE_OPTIONS } from '../../lib/nsofa-v526.js';

function score(over = {}) {
  return nsofa({
    intubated: 'no', inotropes: '0', steroids: 'no', platelets: 200, ...over,
  });
}

test('a well infant scores 0 of 15', () => {
  const r = score();
  assert.equal(r.valid, true);
  assert.equal(r.total, 0);
  assert.equal(r.respiratory, 0);
  assert.equal(r.cardiovascular, 0);
  assert.equal(r.hematologic, 0);
});

test('every respiratory row sits where the source puts it', () => {
  const rows = [
    [99, 0.30],  // ratio 330
    [89, 0.30],  // ratio ~297
    [59, 0.30],  // ratio ~197
    [44, 0.30],  // ratio ~147
    [29, 0.30],  // ratio ~97
  ];
  // Expectations come straight from the published "<" thresholds, not from a second hand-written table.
  const expect = (ratio) => (ratio < 100 ? 8 : ratio < 150 ? 6 : ratio < 200 ? 4 : ratio < 300 ? 2 : 0);
  for (const [spo2, fio2] of rows) {
    const r = score({ intubated: 'yes', spo2, fio2 });
    assert.equal(r.respiratory, expect(spo2 / fio2), `SpO2 ${spo2} FiO2 ${fio2}`);
  }
});

test('the respiratory thresholds are strict "below", so a boundary ratio scores the lower row', () => {
  // The published rows are "0 if at or above 300" then "2 if below 300", so exactly 300 scores 0.
  assert.equal(score({ intubated: 'yes', spo2: 90, fio2: 0.3 }).respiratory, 0);   // ratio exactly 300
  assert.equal(score({ intubated: 'yes', spo2: 89.7, fio2: 0.3 }).respiratory, 2); // ratio 299
  // Likewise exactly 100 is not below 100, so it scores the 6 row rather than the 8 row.
  assert.equal(score({ intubated: 'yes', spo2: 100, fio2: 1.0 }).respiratory, 6);  // ratio exactly 100
  assert.equal(score({ intubated: 'yes', spo2: 99, fio2: 1.0 }).respiratory, 8);   // ratio 99
});

test('a non-intubated infant scores 0 respiratory however much oxygen they are on, and the result says so', () => {
  const roomAir = score({ intubated: 'no' });
  const highFlow = score({ intubated: 'no', spo2: 88, fio2: 0.6 });
  assert.equal(roomAir.respiratory, 0);
  assert.equal(highFlow.respiratory, 0);
  assert.equal(highFlow.sfRatio, null);
  assert.match(highFlow.band, /scored only when the infant is intubated/);
  assert.match(highFlow.band, /this domain cannot see/);
});

test('the full cardiovascular grid over inotropes and steroids', () => {
  const grid = [
    ['0', 'no', 0], ['0', 'yes', 1],
    ['1', 'no', 2], ['1', 'yes', 3],
    ['2', 'no', 3], ['2', 'yes', 4],
  ];
  for (const [inotropes, steroids, pts] of grid) {
    assert.equal(score({ inotropes, steroids }).cardiovascular, pts, `${inotropes} inotropes, steroids ${steroids}`);
  }
  assert.equal(INOTROPE_OPTIONS.length, 3);
});

test('two inotropes without steroids and one inotrope with steroids both score 3', () => {
  assert.equal(score({ inotropes: '2', steroids: 'no' }).cardiovascular, 3);
  assert.equal(score({ inotropes: '1', steroids: 'yes' }).cardiovascular, 3);
});

test('the overlapping platelet rows resolve to the highest matching point value', () => {
  assert.equal(score({ platelets: 150 }).hematologic, 0);
  assert.equal(score({ platelets: 149 }).hematologic, 1);
  assert.equal(score({ platelets: 100 }).hematologic, 1);
  assert.equal(score({ platelets: 99 }).hematologic, 2);
  assert.equal(score({ platelets: 50 }).hematologic, 2);
  // 40 satisfies both "below 100" and "below 50"; the higher value wins.
  assert.equal(score({ platelets: 40 }).hematologic, 3);
  assert.equal(score({ platelets: 0 }).hematologic, 3);
});

test('the ceiling is 15, not the adult SOFA 24 (the META example)', () => {
  const r = score({ intubated: 'yes', spo2: 80, fio2: 1.0, inotropes: '2', steroids: 'yes', platelets: 20 });
  assert.equal(r.respiratory, 8);
  assert.equal(r.cardiovascular, 4);
  assert.equal(r.hematologic, 3);
  assert.equal(r.total, 15);
  assert.match(r.bandLabel, /nSOFA 15 of 15/);
});

test('the copy names the validated population and refuses the diagnosis reading', () => {
  const r = score();
  assert.match(r.note, /late-onset sepsis in preterm very-low-birth-weight infants/);
  assert.match(r.note, /does not diagnose sepsis/);
  assert.match(r.band, /not a diagnosis of sepsis/);
});

test('an intubated infant without an SpO2 or FiO2 is invalid, but a non-intubated one does not need them', () => {
  assert.equal(nsofa({ intubated: 'yes', inotropes: '0', steroids: 'no', platelets: 200 }).valid, false);
  assert.equal(nsofa({ intubated: 'no', inotropes: '0', steroids: 'no', platelets: 200 }).valid, true);
});

test('missing or malformed inputs are invalid', () => {
  assert.equal(nsofa({}).valid, false);
  assert.equal(score({ intubated: 'maybe' }).valid, false);
  assert.equal(score({ inotropes: '3' }).valid, false);
  assert.equal(score({ platelets: -5 }).valid, false);
  assert.equal(score({ intubated: 'yes', spo2: 90, fio2: 0 }).valid, false);
});
