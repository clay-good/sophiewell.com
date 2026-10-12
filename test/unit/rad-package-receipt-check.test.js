// spec-v1635 tool 31: receiving a radioactive package (10 CFR 20.1906; 49 CFR 173.443 Table 9).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { radPackageReceiptCheck as d } from '../../lib/rad-package-receipt-check-v1635.js';

test('the 3-hour clock: from receipt in working hours, from the next working day otherwise', () => {
  assert.equal(d({ received: '2026-10-12T09:30', duringWorkingHours: 'yes' }).monitorBy, '2026-10-12T12:30');
  assert.equal(d({ received: '2026-10-09T19:00', duringWorkingHours: 'no', nextWorkingDayStart: '2026-10-13T08:00' }).monitorBy, '2026-10-13T11:00');
  assert.equal(d({ received: '2026-10-12T22:30', duringWorkingHours: 'yes' }).monitorBy, '2026-10-13T01:30');
  assert.match(d({ received: '2026-10-12T09:30' }).message, /^Choose whether the package was received during/);
  assert.match(d({ duringWorkingHours: 'no', received: '2026-10-09T19:00' }).message, /^Enter the date and time the next working day begins/);
});

test('which monitoring 20.1906(b) requires', () => {
  const q = (x) => d(x).monitoringRequired;
  assert.deepEqual(q({ labeled: 'yes', damaged: 'no', gasOrSpecialForm: 'no', aboveTypeA: 'no' }), { contamination: true, radiationLevels: false });
  assert.deepEqual(q({ labeled: 'yes', damaged: 'no', gasOrSpecialForm: 'yes', aboveTypeA: 'yes' }), { contamination: false, radiationLevels: true });
  assert.deepEqual(q({ labeled: 'no', damaged: 'yes' }), { contamination: true, radiationLevels: true });
  assert.deepEqual(q({ labeled: 'no', damaged: 'no' }), { contamination: false, radiationLevels: false });
  // The questions alone measure nothing, so nothing is called "within the limits".
  assert.equal(d({ labeled: 'no', damaged: 'yes' }).bandLabel, 'Monitoring required by the rule');
  assert.match(d({ labeled: 'yes', damaged: 'no' }).message, /^Choose whether the package holds only a gas/);
});

test('the wipe: dpm per square centimeter against Table 9', () => {
  const w = d({ netCpm: 2000, efficiencyPercent: 10, areaCm2: 300, emitter: 'beta-gamma' });
  assert.ok(Math.abs(w.dpmPerCm2 - 2000 / 0.1 / 300 / 0.1) < 1e-3);
  assert.equal(w.contaminationExceeds, true);
  assert.match(w.notes.join(' '), /notify the final delivery carrier and the NRC Headquarters Operations Center/);
  // 720 cpm at 10% over 300 cm2 with the assumed 0.10 wipe efficiency is exactly 240 dpm/cm2: not above.
  assert.equal(d({ netCpm: 720, efficiencyPercent: 10, areaCm2: 300, emitter: 'beta-gamma' }).contaminationExceeds, false);
  assert.equal(d({ netCpm: 720, efficiencyPercent: 10, areaCm2: 300, emitter: 'other-alpha' }).contaminationExceeds, true);
  // A measured wipe efficiency replaces the assumed one.
  assert.ok(Math.abs(d({ netCpm: 2000, efficiencyPercent: 10, areaCm2: 300, wipeEfficiencyPercent: 50, emitter: 'beta-gamma' }).dpmPerCm2 - 133.333) < 1e-2);
  assert.match(d({ netCpm: 100, efficiencyPercent: 10, areaCm2: 100, emitter: 'beta-gamma' }).notes.join(' '), /wipes 300 cm²/);
});

test('radiation levels: 200 mrem/h at the surface and an index of 10', () => {
  assert.equal(d({ surfaceMremH: 200, oneMeterMremH: 10 }).radiationExceeds, false);
  assert.equal(d({ surfaceMremH: 201 }).radiationExceeds, true);
  assert.equal(d({ oneMeterMremH: 10.1 }).radiationExceeds, true);
  assert.equal(d({ surfaceMremH: 50 }).bandLabel, 'Within the limits checked');
});

test('refusals', () => {
  assert.match(d({}).message, /^Enter the receipt time/);
  assert.match(d({ netCpm: 100 }).message, /^Choose the emitter type/);
  assert.match(d({ netCpm: 100, emitter: 'beta-gamma' }).message, /^Enter the counter efficiency/);
  assert.match(d({ netCpm: 100, efficiencyPercent: 10, emitter: 'beta-gamma' }).message, /^Enter the area wiped/);
  assert.match(d({ received: '2026-02-30T09:00', duringWorkingHours: 'yes' }).message, /^Enter the date and time the package was received/);
  assert.equal(d({ surfaceMremH: -1 }).valid, false);
  assert.equal(d(null).valid, false);
});
