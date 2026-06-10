// spec-v63 OA1: lib/deadline.js -- the regulatory-deadline engine. Covers
// calendar vs federal-business-day modes, weekend/holiday rollover, the
// year-boundary New Year observance edge, past-due, and invalid-input fallback
// (TypeError/RangeError only -- caught by the renderer safe() wrapper).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  deadline, isFederalHoliday, isBusinessDay, nextBusinessDay,
  parseIsoStrict, fmtUtc, addCalendarDaysUtc,
} from '../../lib/deadline.js';
import { parseDate } from '../../lib/pa/date.js';

const D = (s) => parseDate(s);

// --- calendar mode ----------------------------------------------------------
test('deadline calendar: 60 days after 2026-03-15 = 2026-05-14', () => {
  const r = deadline({ anchor: '2026-03-15', days: 60, now: D('2026-03-15') });
  assert.equal(r.deadline, '2026-05-14');
  assert.equal(r.basis, 'calendar');
  assert.equal(r.daysRemaining, 60);
  assert.equal(r.daysElapsed, 0);
  assert.equal(r.pastDue, false);
});
test('deadline calendar: leap-year boundary (2024-01-01 + 60 = 2024-03-01)', () => {
  assert.equal(deadline({ anchor: '2024-01-01', days: 60, now: D('2024-01-01') }).deadline, '2024-03-01');
});
test('deadline: past-due flag and negative daysRemaining', () => {
  const r = deadline({ anchor: '2020-01-01', days: 10, now: D('2026-01-01') });
  assert.equal(r.pastDue, true);
  assert.ok(r.daysRemaining < 0);
  assert.ok(r.daysElapsed > 2000);
});

// --- business-day mode ------------------------------------------------------
test('deadline business: 7 business days after Fri 2026-01-02 = Tue 2026-01-13', () => {
  // skips Sat/Sun 1/3-1/4 and 1/10-1/11
  const r = deadline({ anchor: '2026-01-02', days: 7, basis: 'business', now: D('2026-01-02') });
  assert.equal(r.deadline, '2026-01-13');
  assert.equal(r.basis, 'business');
});
test('deadline business: skips a federal holiday in the window', () => {
  // 3 business days after Wed 2026-07-01: Thu 7/2, (Fri 7/3 is the observed
  // Independence Day holiday -- skipped), Mon 7/6, Tue 7/7.
  const r = deadline({ anchor: '2026-07-01', days: 3, basis: 'business', now: D('2026-07-01') });
  assert.equal(r.deadline, '2026-07-07');
});
test('deadline business: 0 days returns the anchor unchanged', () => {
  assert.equal(deadline({ anchor: '2026-03-15', days: 0, basis: 'business', now: D('2026-03-15') }).deadline, '2026-03-15');
});

// --- calendar rollForward ---------------------------------------------------
test('deadline calendar rollForward: a deadline on a holiday rolls to the next business day', () => {
  // 2025-12-25 (Christmas, Thu) -> rolls to Fri 2025-12-26.
  const r = deadline({ anchor: '2025-11-25', days: 30, basis: 'calendar', rollForward: true, now: D('2025-11-25') });
  assert.equal(r.deadline, '2025-12-26');
  // Without rollForward the raw calendar date is the holiday itself.
  assert.equal(deadline({ anchor: '2025-11-25', days: 30, now: D('2025-11-25') }).deadline, '2025-12-25');
});

// --- holiday set (5 U.S.C. §6103) -------------------------------------------
test('federal holidays: fixed + floating + weekend observance', () => {
  assert.equal(isFederalHoliday(D('2026-01-01')), true);  // New Year's (Thu)
  assert.equal(isFederalHoliday(D('2026-01-19')), true);  // MLK 3rd Mon Jan
  assert.equal(isFederalHoliday(D('2026-05-25')), true);  // Memorial last Mon May
  assert.equal(isFederalHoliday(D('2026-07-03')), true);  // Jul 4 (Sat) observed Fri 7/3
  assert.equal(isFederalHoliday(D('2026-11-26')), true);  // Thanksgiving 4th Thu Nov
  assert.equal(isFederalHoliday(D('2026-12-25')), true);  // Christmas (Fri)
  assert.equal(isFederalHoliday(D('2026-07-04')), false); // the actual Sat is not the observed day
  assert.equal(isFederalHoliday(D('2026-03-17')), false); // ordinary weekday
});
test('federal holidays: New Year year-boundary observance (Jan 1 2028 is Sat -> Fri 2027-12-31)', () => {
  assert.equal(isFederalHoliday(D('2027-12-31')), true);
  assert.equal(isBusinessDay(D('2027-12-31')), false);
});
test('business day: weekends and holidays are not business days', () => {
  assert.equal(isBusinessDay(D('2026-01-03')), false); // Sat
  assert.equal(isBusinessDay(D('2026-01-04')), false); // Sun
  assert.equal(isBusinessDay(D('2026-01-19')), false); // MLK
  assert.equal(isBusinessDay(D('2026-01-20')), true);  // Tue
  assert.equal(fmtUtc(nextBusinessDay(D('2026-01-17'))), '2026-01-20'); // Sat -> Tue (Mon is MLK)
});

// --- invalid input ----------------------------------------------------------
test('deadline: invalid anchor / bad days throw (no Invalid Date leak)', () => {
  assert.throws(() => deadline({ anchor: 'not-a-date', days: 30 }), RangeError);
  assert.throws(() => deadline({ anchor: '2026-03-15', days: -1 }), TypeError);
  assert.throws(() => deadline({ anchor: '2026-03-15', days: 1.5 }), TypeError);
  assert.throws(() => deadline({ anchor: '2026-03-15', days: NaN }), TypeError);
});
test('parseIsoStrict: throws on malformed / impossible dates with anchored messages', () => {
  assert.throws(() => parseIsoStrict('2026/03/15', 'd'), /YYYY-MM-DD/);
  assert.throws(() => parseIsoStrict('2026-02-30', 'd'), /real date/);
  assert.throws(() => parseIsoStrict(42, 'd'), TypeError);
  assert.equal(fmtUtc(addCalendarDaysUtc(parseIsoStrict('2026-01-31'), 1)), '2026-02-01');
});
