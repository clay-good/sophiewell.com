// spec-v1635 tool 27: patient release (10 CFR 35.75; NRC Regulatory Guide 8.39 Rev. 1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { patientReleaseRg839 as d, NUCLIDES } from '../../lib/patient-release-rg839-v1635.js';

const row = (v) => { const n = NUCLIDES.find((x) => x.value === v); return [n.release.mci, n.release.mremH, n.instructions.mci, n.instructions.mremH]; };

test('table rows as printed', () => {
  assert.deepEqual(row('i-131'), [33, 7, 7, 2]);
  assert.deepEqual(row('tc-99m'), [760, 58, 150, 12]);
  assert.deepEqual(row('i-123'), [160, 26, 33, 5]);
  assert.deepEqual(row('tl-201'), [430, 19, 85, 4]);
  assert.deepEqual(row('ir-192-implant'), [2, 0.8, 0.3, 0.2]);
  assert.equal(NUCLIDES.filter((n) => n.release).length, 22);
});

test('the default tables: "at or below" releases, "above" needs instructions', () => {
  const at = d({ nuclide: 'i-131', activity: 33, unit: 'mci' });
  assert.deepEqual([at.releasable, at.instructionsRequired], [true, true]);
  assert.equal(d({ nuclide: 'i-131', activity: 33.1, unit: 'mci' }).releasable, false);
  assert.deepEqual([d({ nuclide: 'i-131', activity: 7, unit: 'mci' }).instructionsRequired, d({ nuclide: 'i-131', activity: 7.1, unit: 'mci' }).instructionsRequired], [false, true]);
  // The GBq column is compared as printed.
  assert.equal(d({ nuclide: 'tc-99m', activity: 28, unit: 'gbq' }).releasable, true);
  assert.equal(d({ nuclide: 'tc-99m', activity: 30, unit: 'gbq' }).releasable, false);
  // A dose rate at or below Column 2 releases even when the activity is above Column 1.
  const byRate = d({ nuclide: 'i-131', activity: 200, unit: 'mci', doseRateMremH: 6 });
  assert.deepEqual([byRate.byActivity, byRate.byDoseRate, byRate.releasable], [false, true, true]);
  assert.match(byRate.notes.join(' '), /needs a record/);
});

test('Equations 2 and 3 reproduce the table for a typed radionuclide', () => {
  const tc = d({ nuclide: 'other', activity: 760, unit: 'mci', gamma: 0.756, halfLifeDays: 0.251 });
  assert.ok(Math.abs(tc.releaseActivityMci - 761.5) < 0.1); // table: 760
  const iodine = d({ nuclide: 'other', activity: 33, unit: 'mci', gamma: 2.2, halfLifeDays: 8.04 });
  assert.ok(Math.abs(iodine.releaseActivityMci - 32.68) < 0.01); // table: 33
  assert.ok(Math.abs(iodine.instructionActivityMci - 6.536) < 0.01); // table: 7
  assert.match(iodine.notes[0], /Equation 2 \(occupancy factor 0\.25/);
  assert.match(tc.notes[0], /Equation 3 \(occupancy factor 1/);
});

test('Equation B-5 reproduces the guide\'s Examples 2 and 3', () => {
  const ex3 = d({ nuclide: 'i-131', activity: 55, unit: 'mci', condition: 'hyperthyroidism', occupancyFirst8h: 0.75, occupancyAfter: 0.25 });
  assert.ok(Math.abs(ex3.patientSpecificDoseRem - 0.486) < 0.0005);
  assert.deepEqual([ex3.byActivity, ex3.releasable, ex3.instructionsRequired], [false, true, true]);
  const ex2 = d({ nuclide: 'i-131', activity: 200, unit: 'mci', condition: 'thyroid-cancer', occupancyFirst8h: 0.75, occupancyAfter: 0.25 });
  assert.ok(Math.abs(ex2.patientSpecificDoseRem - 0.453) < 0.0005);
  assert.equal(d({ nuclide: 'i-131', activity: 250, unit: 'mci', condition: 'thyroid-cancer', occupancyFirst8h: 0.75, occupancyAfter: 0.25 }).releasable, false);
});

test('no occupancy factor is chosen for the reader', () => {
  assert.match(d({ nuclide: 'i-131', activity: 55, unit: 'mci', condition: 'hyperthyroidism' }).message, /does not choose an occupancy factor/);
  assert.match(d({ nuclide: 'i-131', activity: 55, unit: 'mci', condition: 'hyperthyroidism', occupancyFirst8h: 0.75, occupancyAfter: 0.125 }).notes.join(' '), /below its defaults/);
});

test('pure beta emitters and refusals', () => {
  assert.equal(d({ nuclide: 'sr-89' }).flag, 'limits-do-not-apply');
  assert.match(d({}).message, /^Choose the radionuclide/);
  assert.match(d({ nuclide: 'i-131' }).message, /^Enter the administered activity, or/);
  assert.match(d({ nuclide: 'i-131', activity: 5 }).message, /^Choose the unit/);
  assert.match(d({ nuclide: 'other', activity: 5, unit: 'mci' }).message, /^Enter the exposure rate constant/);
  assert.match(d({ nuclide: 'other', doseRateMremH: 5 }).message, /enter the administered activity/);
  assert.match(d({ nuclide: 'i-131', activity: 5, unit: 'mci', occupancyAfter: 0.25 }).message, /^Choose the condition/);
  assert.equal(d({ nuclide: 'i-131', activity: 5, unit: 'mci', condition: 'hyperthyroidism', occupancyFirst8h: 1.5, occupancyAfter: 0.25 }).valid, false);
  assert.equal(d(null).valid, false);
});
