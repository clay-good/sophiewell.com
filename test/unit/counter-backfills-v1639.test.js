// spec-v1639 backfills 1 to 3: run-out date and trip coverage, inhaler priming, the PRN label, and
// rounding a draw-up volume to the measuring device.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daysSupply as ds } from '../../lib/days-supply-v1511.js';
import { doseVolume as dv } from '../../lib/ems-v149.js';

const tabs = { form: 'tablet', quantity: '30', perDose: '1', dosesPerDay: '1' };

test('days supply: the run-out date from a start date', () => {
  const r = ds({ ...tabs, startDate: '2026-10-01' });
  assert.deepEqual([r.daysSupply, r.lastCoveredDate], [30, '2026-10-30']);
  assert.match(r.notes.join(' '), /last day covered is October 30, 2026, and the supply has run out on October 31, 2026/);
  assert.equal(ds(tabs).lastCoveredDate, undefined);
});

test('days supply: a trip past the run-out date shows the days short and the quantity', () => {
  const r = ds({ ...tabs, perDose: '2', quantity: '60', startDate: '2026-10-01', departDate: '2026-10-20', returnDate: '2026-11-05' });
  assert.equal(r.daysShort, 6);
  assert.match(r.notes.join(' '), /6 more days is 12 units/);
  const ok = ds({ ...tabs, startDate: '2026-10-01', departDate: '2026-10-10', returnDate: '2026-10-30' });
  assert.equal(ok.daysShort, undefined);
  assert.match(ok.notes.join(' '), /the supply on hand covers it/);
  assert.match(ds({ ...tabs, departDate: '2026-10-10', returnDate: '2026-10-30' }).message, /start date of the supply/);
  assert.match(ds({ ...tabs, startDate: '2026-10-01', departDate: '2026-10-10' }).message, /both the departure date and the return date/);
  assert.match(ds({ ...tabs, startDate: '2026-10-01', departDate: '2026-10-10', returnDate: '2026-10-05' }).message, /on or after the departure/);
});

test('days supply: inhaler priming puffs come off each canister', () => {
  const base = { form: 'inhaler', actuations: '120', canisters: '1', puffsPerDose: '2', dosesPerDay: '2' };
  assert.equal(ds(base).daysSupply, 30);
  assert.match(ds(base).notes.join(' '), /Priming puffs were not entered/);
  assert.equal(ds({ ...base, primingPuffs: '4' }).daysSupply, 29);
  assert.match(ds({ ...base, actuations: '60', primingPuffs: '60' }).message, /fewer than the actuations/);
});

test('days supply: the doses left on an inhaler counter replace the canister count', () => {
  const r = ds({ form: 'inhaler', counterLeft: '60', puffsPerDose: '2', dosesPerDay: '2' });
  assert.equal(r.daysSupply, 15);
  assert.match(r.band, /60 doses left on the counter/);
  assert.match(r.notes.join(' '), /none is subtracted/);
  // The canister fields are not asked for, and priming entered is not subtracted again.
  assert.equal(ds({ form: 'inhaler', counterLeft: '60', puffsPerDose: '2', dosesPerDay: '2', actuations: '200', canisters: '3', primingPuffs: '4' }).daysSupply, 15);
  assert.equal(ds({ form: 'inhaler', counterLeft: '0', puffsPerDose: '2', dosesPerDay: '2' }).daysSupply, 0);
  assert.match(ds({ form: 'inhaler', counterLeft: '-1', puffsPerDose: '2', dosesPerDay: '2' }).message, /doses left on the counter must be between 0 and 10000/);
  assert.match(ds({ form: 'inhaler', counterLeft: '60', dosesPerDay: '2' }).message, /Enter the puffs per dose/);
  // The discard limit counts from opening, which the counter does not show.
  const d = ds({ form: 'inhaler', counterLeft: '120', puffsPerDose: '1', dosesPerDay: '2', discardDays: '30' });
  assert.equal(d.daysSupply, 60);
  assert.match(d.notes.join(' '), /not applied here/);
  // Another form ignores the field.
  assert.equal(ds({ ...tabs, counterLeft: '5' }).daysSupply, 30);
});

test('days supply: an as-needed sig at its maximum is labeled as such', () => {
  const r = ds({ ...tabs, quantity: '30', perDose: '1', dosesPerDay: '6', maxPerDay: 'yes' });
  assert.deepEqual([r.daysSupply, r.bandLabel], [5, '5 days at the maximum']);
  assert.match(r.band, /^5-day supply at the maximum the sig allows/);
  assert.equal(ds({ ...tabs, maxPerDay: 'no' }).bandLabel, '30 days');
});

test('dose volume: rounding to the device marking shows the dose delivered', () => {
  const r = dv({ doseMg: 125, concentration: 160 / 5, incrementMl: 0.5 });
  // 125 mg at 32 mg/mL is 3.90625 mL; on a 0.5 mL marking that is 4 mL, which is 128 mg (+2.4%).
  assert.deepEqual([r.roundedVolumeMl, r.deliveredMg, r.percentChange], [4, 128, 2.4]);
  assert.match(r.flags.join(' '), /4 mL, which delivers 128 mg \(\+2\.4% from the ordered 125 mg\)/);
  assert.equal(dv({ doseMg: 125, concentration: 32 }).roundedVolumeMl, undefined);
  assert.match(dv({ doseMg: 1, concentration: 100, incrementMl: 0.1 }).flags.join(' '), /rounds to zero/);
  assert.equal(dv({ doseMg: 125, concentration: 32, incrementMl: -1 }).valid, false);
});
