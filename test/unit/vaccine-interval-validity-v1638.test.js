// spec-v1638 tool 28: CDC's minimum interval, minimum age and grace period rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vaccineIntervalValidity as v } from '../../lib/vaccine-interval-validity-v1638.js';

const base = { live: 'not-live-or-live-oral', graceRule: 'four-day-grace-applies' };
const interval = (doseDate, extra = {}) => v({ ...base, doseDate, previousDose: '2026-01-01', minInterval: 4, minIntervalUnit: 'wk-unit', ...extra });

test('4 or fewer days early is valid; 5 or more is not, and the repeat is spaced from the invalid dose', () => {
  // Minimum interval ends January 29.
  assert.equal(interval('2026-01-29').doseValid, true);
  assert.equal(interval('2026-01-25').doseValid, true);
  const bad = interval('2026-01-24');
  assert.deepEqual([bad.doseValid, bad.failed, bad.earliestRepeat], [false, ['minimum interval'], '2026-02-21']);
});

test('CDC\'s Hib example: doses 14 days apart; the repeat is at least 4 weeks after the invalid one', () => {
  const r = interval('2026-01-15');
  assert.deepEqual([r.doseValid, r.earliestRepeat], [false, '2026-02-12']);
});

test('no grace for rabies, accelerated Twinrix or a mandate', () => {
  assert.equal(interval('2026-01-28', { graceRule: 'rabies-or-accelerated-twinrix' }).doseValid, false);
  assert.equal(interval('2026-01-28', { graceRule: 'mandate-disallows-grace' }).doseValid, false);
  assert.equal(interval('2026-01-29', { graceRule: 'rabies-or-accelerated-twinrix' }).doseValid, true);
});

test('minimum age: calendar months, the grace period, and the repeat on or after the minimum age', () => {
  const age = (doseDate, extra = {}) => v({ ...base, doseDate, birthDate: '2025-03-10', minAge: 12, minAgeUnit: 'calendar-months-unit', ...extra });
  assert.equal(age('2026-03-06').doseValid, true);
  const early = age('2026-03-05');
  assert.deepEqual([early.doseValid, early.earliestRepeat], [false, '2026-03-10']);
  // CDC's varicella example: a live vaccine given at 11 months and 2 weeks is repeated no earlier than 28 days later.
  const live = age('2026-02-24', { live: 'live-injectable-or-intranasal' });
  assert.deepEqual([live.doseValid, live.earliestRepeat], [false, '2026-03-24']);
});

test('two live vaccines under 28 days apart: the second is not counted, and grace does not help', () => {
  const r = v({ ...base, live: 'live-injectable-or-intranasal', doseDate: '2026-02-01', birthDate: '2020-01-01', minAge: 1, minAgeUnit: 'yr-unit', otherLiveDate: '2026-01-08' });
  assert.deepEqual([r.doseValid, r.failed, r.earliestRepeat], [false, ['28 days from another live vaccine'], '2026-03-01']);
  assert.equal(v({ ...base, live: 'live-injectable-or-intranasal', doseDate: '2026-02-05', birthDate: '2020-01-01', minAge: 1, minAgeUnit: 'yr-unit', otherLiveDate: '2026-01-08' }).doseValid, true);
  // The same day is allowed.
  assert.equal(v({ ...base, live: 'live-injectable-or-intranasal', doseDate: '2026-02-01', birthDate: '2020-01-01', minAge: 1, minAgeUnit: 'yr-unit', otherLiveDate: '2026-02-01' }).doseValid, true);
});

test('MMR and varicella together: the second dose of either gets no grace period', () => {
  const second = (previousWithOtherLive) => interval('2026-01-26', { live: 'live-injectable-or-intranasal', previousWithOtherLive });
  assert.equal(second('previous-dose-given-alone').doseValid, true);
  assert.equal(second('previous-dose-given-with-another-live').doseValid, false);
  assert.match(interval('2026-01-26', { live: 'live-injectable-or-intranasal' }).message, /^Choose whether the previous dose was given the same day/);
});

test('a special grace period replaces the 4 days', () => {
  const r = v({ ...base, doseDate: '2026-02-05', previousDose: '2025-12-01', minInterval: 3, minIntervalUnit: 'calendar-months-unit', specialGraceMonths: 2 });
  assert.equal(r.doseValid, true);
  assert.match(r.note, /the 4 days are not added to it/);
  // Three months from December 1 is March 1; two months of grace reaches back to January 1 and no further.
  assert.equal(v({ ...base, doseDate: '2026-01-01', previousDose: '2025-12-01', minInterval: 3, minIntervalUnit: 'calendar-months-unit', specialGraceMonths: 2 }).doseValid, true);
  assert.equal(v({ ...base, doseDate: '2025-12-31', previousDose: '2025-12-01', minInterval: 3, minIntervalUnit: 'calendar-months-unit', specialGraceMonths: 2 }).doseValid, false);
  // Without the special period, the 4 days alone would not cover February 5.
  assert.equal(v({ ...base, doseDate: '2026-02-05', previousDose: '2025-12-01', minInterval: 3, minIntervalUnit: 'calendar-months-unit' }).doseValid, false);
});

test('refusals: no minimum is supplied by the tool', () => {
  assert.match(v({}).message, /^Enter the date of the dose/);
  assert.match(v({ ...base, doseDate: '2026-01-29' }).message, /none is supplied here/);
  assert.match(v({ ...base, doseDate: '2026-01-29', previousDose: '2026-01-01' }).message, /^Enter the minimum interval/);
  assert.match(v({ ...base, doseDate: '2026-01-29', previousDose: '2026-01-01', minInterval: 4 }).message, /^Choose the unit of the minimum interval/);
  assert.match(v({ doseDate: '2026-01-29', graceRule: 'four-day-grace-applies' }).message, /^Choose whether this is a live/);
});

// Route B: the rule answers through its review date and then fails closed.
test('the CDC rule fails closed after its review date', async () => {
  const { vaccineIntervalValidity: vi, DATED_VACCINE_RULE } = await import('../../lib/vaccine-interval-validity-v1638.js');
  assert.deepEqual(DATED_VACCINE_RULE['cdc-timing-spacing'].values, { graceDays: 4, liveSpacingDays: 28 });
  const args = { doseDate: '2026-10-01', previousDose: '2026-09-01', minInterval: 28, minIntervalUnit: 'days-unit', live: 'not-live-or-live-oral', graceRule: 'four-day-grace-applies' };
  assert.equal(vi(args, new Date('2027-10-15T12:00:00Z')).valid, true);
  assert.match(vi(args, new Date('2027-10-16T12:00:00Z')).message, /passed its review date/);
});
