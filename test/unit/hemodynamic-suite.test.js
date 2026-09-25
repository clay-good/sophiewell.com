// spec-v87 §2.1: cardiac index, stroke volume, and the SVR/PVR resistance suite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hemodynamicSuite } from '../../lib/hemodynamics-v87.js';

test('worked example: CO 5, HR 80, BSA 2, MAP 90, CVP 5, mPAP 20, PCWP 10', () => {
  const r = hemodynamicSuite({ cardiacOutput: 5, heartRate: 80, bsa: 2, map: 90, cvp: 5, mpap: 20, pcwp: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.ci, 2.5);
  assert.equal(r.ciFlag, 'normal');
  assert.equal(r.sv, 62.5);
  assert.equal(r.svFlag, 'normal');
  assert.equal(r.svi, 31.3); // 62.5 / 2 = 31.25 -> 31.3, below 33 (low)
  assert.equal(r.sviFlag, 'low');
  assert.equal(r.svr, 1360); // 80 * (90-5) / 5
  assert.equal(r.svrFlag, 'high');
  assert.equal(r.svri, 2720);
  assert.equal(r.pvrWood, 2); // (20-10)/5
  assert.equal(r.pvrFlag, 'normal'); // 2 is not > 2
  assert.equal(r.pvr, 160); // 2 * 80
  assert.equal(r.pvri, 320);
});

test('cardiogenic-shock pattern: low CI, high SVR, high PVR', () => {
  const r = hemodynamicSuite({ cardiacOutput: 2.8, heartRate: 110, bsa: 1.9, map: 65, cvp: 14, mpap: 35, pcwp: 24 });
  assert.equal(r.ci, 1.47); // 2.8 / 1.9
  assert.equal(r.ciFlag, 'low');
  assert.equal(r.sv, 25.5); // (2.8/110)*1000
  assert.equal(r.svFlag, 'low');
  assert.equal(r.svr, 1457); // 80*(65-14)/2.8 = 1457.14
  assert.equal(r.svrFlag, 'high');
  assert.equal(r.pvrWood, 3.93); // (35-24)/2.8 = 3.9286
  assert.equal(r.pvrFlag, 'high');
});

test('zero / blank cardiac output surfaces a valid:false fallback, never Infinity', () => {
  const zero = hemodynamicSuite({ cardiacOutput: 0, map: 90, cvp: 5 });
  assert.equal(zero.valid, false);
  assert.match(zero.band, /cardiac output/i);
  const blank = hemodynamicSuite({});
  assert.equal(blank.valid, false);
});

test('partial inputs compute only what is supported (no false outputs)', () => {
  const r = hemodynamicSuite({ cardiacOutput: 6, heartRate: 60 });
  assert.equal(r.valid, true);
  assert.equal(r.sv, 100); // (6/60)*1000
  assert.equal(r.ci, null); // no BSA
  assert.equal(r.svr, null); // no MAP/CVP
  assert.equal(r.pvrWood, null); // no mPAP/PCWP
  assert.equal(r.ciFlag, null);
});

test('spec-v1474: stroke work indices in both reported units, only when their inputs are present', () => {
  const r = hemodynamicSuite({ cardiacOutput: 5, heartRate: 70, bsa: 1.9, map: 85, cvp: 8, mpap: 25, pcwp: 12 });
  // SVI = 5 / 70 * 1000 / 1.9 = 37.59 mL/m2
  assert.equal(r.lvswiMmhg, 2744); // 37.59 * (85 - 12)
  assert.equal(r.lvswi, 37.3); // * 0.0136
  assert.equal(r.rvswiMmhg, 639); // 37.59 * (25 - 8)
  assert.equal(r.rvswi, 8.7);
  assert.match(r.note, /correct units are disputed/);
  const noWedge = hemodynamicSuite({ cardiacOutput: 5, heartRate: 70, bsa: 1.9, map: 85, cvp: 8, mpap: 25 });
  assert.equal(noWedge.lvswi, null);
  assert.equal(noWedge.rvswi, 8.7);
  assert.equal(hemodynamicSuite({ cardiacOutput: 5, bsa: 1.9, map: 85, pcwp: 12 }).lvswi, null, 'no heart rate, no SVI');
});
