// spec-v1636 tools 20 and 21: the CMS administration window, and adjusted patient days.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { medAdminWindow } from '../../lib/med-admin-window-v1636.js';
import { adjustedPatientDays } from '../../lib/adjusted-patient-days-v1636.js';

const base = { scheduled: '2026-10-12T09:00', frequency: 'daily-weekly-or-monthly', policyClass: 'policy-not-critical' };
const m = (i) => medAdminWindow({ ...base, ...i });
const got = (r) => [r.flag, r.minutesFromScheduled, r.windowMinutesEachSide];

test('daily, weekly or monthly: 2 hours before or after, the edge inside', () => {
  assert.deepEqual(got(m({ actual: '2026-10-12T11:00' })), ['inside-window', 120, 120]);
  assert.deepEqual(got(m({ actual: '2026-10-12T11:01' })), ['outside-window', 121, 120]);
  assert.deepEqual(got(m({ actual: '2026-10-12T07:00' })), ['inside-window', -120, 120]);
  const r = m({ actual: '2026-10-12T11:01' });
  assert.deepEqual([r.earliest, r.latest, r.onTime], ['2026-10-12 07:00', '2026-10-12 11:00', false]);
});

test('more often than daily, up to every 4 hours: 1 hour before or after', () => {
  const f = { frequency: 'several-doses-a-day' };
  assert.deepEqual(got(m({ ...f, actual: '2026-10-12T10:00' })), ['inside-window', 60, 60]);
  assert.equal(m({ ...f, actual: '2026-10-12T10:01' }).flag, 'outside-window');
});

test('time-critical: 30 minutes before or after, at any frequency', () => {
  for (const frequency of ['daily-weekly-or-monthly', 'several-doses-a-day', 'more-often-than-q4h']) {
    const tc = { frequency, policyClass: 'policy-critical' };
    assert.deepEqual(got(m({ ...tc, actual: '2026-10-12T08:30' })), ['inside-window', -30, 30], frequency);
    assert.equal(m({ ...tc, actual: '2026-10-12T08:20' }).flag, 'outside-window', frequency);
  }
});

test('more often than every 4 hours and not time-critical: CMS gives no window, and the tool does not make one', () => {
  const r = m({ frequency: 'more-often-than-q4h', actual: '2026-10-12T09:10' });
  assert.deepEqual([r.flag, r.onTime, r.abnormal], ['no-cms-window-for-this-class', undefined, true]);
  assert.match(r.band, /among its examples of time-critical medications/);
});

test('a tighter hospital window is used; a wider one is refused', () => {
  const tight = m({ actual: '2026-10-12T09:50', policyMinutes: 30 });
  assert.deepEqual(got(tight), ['outside-window', 50, 30]);
  assert.match(tight.notes.join(' '), /outside the hospital's window but inside the CMS outer limit of 2 h/);
  assert.match(m({ actual: '2026-10-12T09:50', policyMinutes: 180 }).message, /wider than the CMS outer limit of 120 minutes/);
});

test('the administration window: nothing is defaulted', () => {
  assert.match(medAdminWindow({}).message, /^Enter the scheduled time/);
  assert.match(medAdminWindow({ scheduled: '2026-10-12T09:00' }).message, /^Enter the time the dose was given/);
  assert.match(medAdminWindow({ scheduled: '2026-10-12T09:00', actual: '2026-10-12T09:00' }).message, /^Choose the order's frequency/);
  assert.match(medAdminWindow({ scheduled: '2026-10-12T09:00', actual: '2026-10-12T09:00', frequency: 'several-doses-a-day' }).message, /^Choose whether the hospital's policy classes/);
  assert.equal(medAdminWindow(null).valid, false);
});

test('adjusted patient days: the worksheet lines', () => {
  const r = adjustedPatientDays({ inpatientDays: 30000, inpatientRevenue: 240000000, outpatientRevenue: 160000000, workedHours: 60000, drugExpense: 9000000 });
  assert.deepEqual([r.revenuePerInpatientDay, r.adjustedOutpatientDays, r.adjustedPatientDays, r.outpatientSharePercent, r.hoursPerAdjustedDay, r.drugCostPerAdjustedDay], [8000, 20000, 50000, 40, 1.2, 180]);
  // The same figure by the state-law construction: inpatient days over the inpatient share of revenue.
  assert.ok(Math.abs(r.adjustedPatientDays - 30000 / (240000000 / 400000000)) < 1e-6);
});

test('adjusted patient days: no outpatient revenue leaves the inpatient days; optional ratios are not invented', () => {
  const r = adjustedPatientDays({ inpatientDays: 30000, inpatientRevenue: 240000000, outpatientRevenue: 0 });
  assert.deepEqual([r.adjustedPatientDays, r.hoursPerAdjustedDay, r.drugCostPerAdjustedDay], [30000, null, null]);
  assert.match(r.notes.join(' '), /were not entered, so no per-day ratio is shown/);
});

test('adjusted patient days: nothing is defaulted', () => {
  assert.match(adjustedPatientDays({}).message, /^Enter the inpatient days/);
  assert.match(adjustedPatientDays({ inpatientDays: 30000 }).message, /^Enter the gross inpatient revenue/);
  assert.match(adjustedPatientDays({ inpatientDays: 30000, inpatientRevenue: 1000 }).message, /^Enter the gross outpatient revenue/);
  assert.equal(adjustedPatientDays({ inpatientDays: 0, inpatientRevenue: 1000, outpatientRevenue: 0 }).valid, false);
  assert.equal(adjustedPatientDays(null).valid, false);
});
