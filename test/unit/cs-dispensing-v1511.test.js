// spec-v1511 tools 3-5: controlled-substance refills, C-II fill deadlines, and C-II series.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING } from '../lib/asking-language.js';
import { csRefillValidity as rv, c2FillDeadlines as fd, c2MultipleRxSeries as ms } from '../../lib/cs-dispensing-v1511.js';

test('refills: C-II none; C-III/IV five and six months; the 6-month limit can come first', () => {
  assert.equal(rv({ schedule: 'II', issued: '2026-10-03', checkDate: '2026-10-04' }).refillsLeft, 0);
  assert.equal(rv({ schedule: 'IV', issued: '2026-10-03', checkDate: '2027-02-10', authorized: '5', dispensed: '3' }).refillsLeft, 2);
  assert.equal(rv({ schedule: 'IV', issued: '2026-10-03', checkDate: '2027-04-03', authorized: '5', dispensed: '2' }).refillsLeft, 3);
  assert.equal(rv({ schedule: 'III', issued: '2026-10-03', checkDate: '2027-04-04', authorized: '5', dispensed: '2' }).bandLabel, 'Expired (6 months)');
  assert.equal(rv({ schedule: 'IV', issued: '2026-10-03', checkDate: '2026-11-01', authorized: '8', dispensed: '5' }).refillsLeft, 0);
  assert.equal(rv({ schedule: 'V', issued: '2025-01-03', checkDate: '2026-11-01', authorized: '8', dispensed: '5' }).refillsLeft, 3);
});

test('C-II fill deadlines: 72 hours across a DST change, 30 days, 60 days, 7 days', () => {
  assert.equal(fd({ case: 'short-stock', start: '2026-10-31T16:00' }).deadline, '2026-11-03T15:00');
  assert.equal(fd({ case: 'requested', start: '2026-10-05T10:00' }).deadline, '2026-11-04');
  assert.equal(fd({ case: 'ltc', start: '2026-10-05T10:00' }).deadline, '2026-12-04');
  assert.equal(fd({ case: 'emergency', start: '2026-10-05T10:00' }).deadline, '2026-10-12');
});

test('C-II series: the 90-day total, missing earliest dates, and overlapping dates flagged but not refused', () => {
  assert.equal(ms({ issued: '2026-10-01', rx1Days: '30', rx2Days: '30', rx2Earliest: '2026-10-31', rx3Days: '30', rx3Earliest: '2026-11-30' }).ok, true);
  assert.equal(ms({ issued: '2026-10-01', rx1Days: '30', rx2Days: '70', rx2Earliest: '2026-10-31' }).ok, false);
  assert.equal(ms({ issued: '2026-10-01', rx1Days: '30', rx2Days: '30' }).ok, false);
  const r = ms({ issued: '2026-10-01', rx1Days: '30', rx2Days: '30', rx2Earliest: '2026-10-25' });
  assert.equal(r.ok, true);
  assert.match(r.bandLabel, /check dates/);
});

test('blanks are asked for', () => {
  for (const r of [rv({}), rv({ schedule: 'IV' }), rv({ schedule: 'IV', issued: '2026-10-03', checkDate: '2026-11-01' }), fd({}), fd({ case: 'ltc' }), ms({}), ms({ issued: '2026-10-01' })]) {
    assert.equal(r.valid, false);
    assert.match(r.message, ASKING);
  }
});

import { daysSupply as ds, refillEligibleDate as re } from '../../lib/days-supply-v1511.js';

test('days supply: tablets, drops, and priming counted per injection', () => {
  assert.equal(ds({ form: 'tablet', quantity: '60', perDose: '1', dosesPerDay: '2' }).daysSupply, 30);
  assert.equal(ds({ form: 'drops', volume: '5', dropsPerMl: '20', dropsPerEye: '1', eyes: '2', dosesPerDay: '2' }).daysSupply, 25);
  // 1500 units / (40 + 2 x 2) = 34.09 -> 34; priming per injection, not per day.
  assert.equal(ds({ form: 'insulin', unitsPerMl: '100', mlPerPen: '3', pens: '5', unitsPerDay: '40', injectionsPerDay: '2', primingUnits: '2' }).daysSupply, 34);
});

test('days supply: the discard limit binds before the units run out, and the reverse', () => {
  const r = ds({ form: 'insulin', unitsPerMl: '100', mlPerPen: '3', pens: '1', unitsPerDay: '8', injectionsPerDay: '1', primingUnits: '2', discardDays: '28' });
  assert.equal(r.daysSupply, 28);
  assert.match(r.band, /capped at 28/);
  assert.equal(ds({ form: 'insulin', unitsPerMl: '100', mlPerPen: '3', pens: '5', unitsPerDay: '40', injectionsPerDay: '2', primingUnits: '2', discardDays: '28' }).daysSupply, 34);
});

test('earliest refill: the plan threshold, and the CMS 70% eye-drop recommendation', () => {
  assert.equal(re({ fillDate: '2026-10-01', daysSupply: '30', eyeDrops: 'yes' }).earliest, '2026-10-22');
  assert.equal(re({ fillDate: '2026-10-01', daysSupply: '90', threshold: '75' }).earliest, '2026-12-08');
  assert.match(re({ fillDate: '2026-10-01', daysSupply: '30' }).message, ASKING);
  assert.match(ds({ form: 'tablet', quantity: '60' }).message, ASKING);
});
