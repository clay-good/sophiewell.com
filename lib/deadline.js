// spec-v63 OA1: the regulatory-deadline engine. Pure UTC-midnight date
// arithmetic, generalizing the one-off math in lib/regulatory.js into a single
// audited code path that every ops deadline tile shares.
//
// Given an anchor date + a window of N days, it returns the deadline date, the
// days elapsed and days remaining versus "today", and a past-due flag — in
// CALENDAR days or FEDERAL BUSINESS days. Business-day mode skips weekends and
// the 5 U.S.C. §6103 federal holidays (with the federal weekend-observance rule
// for the fixed-date holidays), rolling forward deterministically.
//
// Everything is UTC midnight (the lib/pa/date.js convention) so two machines
// computing the same rule produce byte-identical output, and "today" honors the
// SOPHIEWELL_NOW pin for byte-stable golden tests. No network, no locale, no AI.
//
// The federal-holiday SET (which holidays exist — Juneteenth was added in 2021)
// is the dated constant; it is computed from the statutory rules below and
// tracked by a pa-staleness-ledger.json row so the check-pa-staleness CI gate
// guards it (spec-v63 OA4).

import { parseDate, isValidDate, diffDays, todayUtc } from './pa/date.js';

const MS_PER_DAY = 86400000;

// --- low-level UTC date helpers (consumed by lib/regulatory.js too) ---------

// Strict ISO parser that THROWS (TypeError/RangeError) — the breach-clock and
// the deadline tiles want a hard failure on a malformed date, not a silent
// null. `label` names the offending field in the message.
export function parseIsoStrict(s, label = 'date') {
  if (typeof s !== 'string') throw new TypeError(`${label} must be a YYYY-MM-DD string`);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new RangeError(`${label} must match YYYY-MM-DD`);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (Number.isNaN(dt.getTime())) throw new RangeError(`${label} is not a valid date`);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
    throw new RangeError(`${label} components do not form a real date`);
  }
  return dt;
}

export function fmtUtc(dt) {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addCalendarDaysUtc(dt, n) {
  return new Date(dt.getTime() + n * MS_PER_DAY);
}

// --- 5 U.S.C. §6103 federal holidays ----------------------------------------

function utc(y, m, d) { return new Date(Date.UTC(y, m, d)); }

// nth (1..5) `weekday` (0=Sun..6=Sat) of `month` (0..11) in `year`.
function nthWeekdayOfMonth(year, month, weekday, n) {
  const firstDow = utc(year, month, 1).getUTCDay();
  const day = 1 + ((weekday - firstDow + 7) % 7) + (n - 1) * 7;
  return utc(year, month, day);
}

// Last `weekday` of `month`.
function lastWeekdayOfMonth(year, month, weekday) {
  const last = utc(year, month + 1, 0); // day 0 of next month = last day of this month
  const back = (last.getUTCDay() - weekday + 7) % 7;
  return utc(year, month, last.getUTCDate() - back);
}

// Federal weekend-observance rule for the fixed-date holidays: Saturday is
// observed on the preceding Friday, Sunday on the following Monday.
function observedFixed(year, month, day) {
  const d = utc(year, month, day);
  const dow = d.getUTCDay();
  if (dow === 6) return addCalendarDaysUtc(d, -1);
  if (dow === 0) return addCalendarDaysUtc(d, 1);
  return d;
}

const holidayCache = new Map();

function holidaysForYear(year) {
  if (holidayCache.has(year)) return holidayCache.get(year);
  const set = new Set([
    fmtUtc(observedFixed(year, 0, 1)),        // New Year's Day
    fmtUtc(nthWeekdayOfMonth(year, 0, 1, 3)), // MLK Jr. — 3rd Mon Jan
    fmtUtc(nthWeekdayOfMonth(year, 1, 1, 3)), // Washington's Birthday — 3rd Mon Feb
    fmtUtc(lastWeekdayOfMonth(year, 4, 1)),   // Memorial Day — last Mon May
    fmtUtc(observedFixed(year, 5, 19)),       // Juneteenth — Jun 19
    fmtUtc(observedFixed(year, 6, 4)),        // Independence Day — Jul 4
    fmtUtc(nthWeekdayOfMonth(year, 8, 1, 1)), // Labor Day — 1st Mon Sep
    fmtUtc(nthWeekdayOfMonth(year, 9, 1, 2)), // Columbus Day — 2nd Mon Oct
    fmtUtc(observedFixed(year, 10, 11)),      // Veterans Day — Nov 11
    fmtUtc(nthWeekdayOfMonth(year, 10, 4, 4)), // Thanksgiving — 4th Thu Nov
    fmtUtc(observedFixed(year, 11, 25)),      // Christmas Day — Dec 25
  ]);
  // Year-boundary edge: when Jan 1 of the next year is a Saturday, it is
  // observed on Dec 31 of THIS year — a non-business day that falls in `year`.
  const nyNext = observedFixed(year + 1, 0, 1);
  if (nyNext.getUTCFullYear() === year) set.add(fmtUtc(nyNext));
  holidayCache.set(year, set);
  return set;
}

export function isFederalHoliday(dt) {
  return holidaysForYear(dt.getUTCFullYear()).has(fmtUtc(dt));
}

export function isBusinessDay(dt) {
  const dow = dt.getUTCDay();
  if (dow === 0 || dow === 6) return false;
  return !isFederalHoliday(dt);
}

// Roll a date forward to the next federal business day (no-op if it already is).
export function nextBusinessDay(dt) {
  let d = dt;
  while (!isBusinessDay(d)) d = addCalendarDaysUtc(d, 1);
  return d;
}

// N federal business days after `start` (start itself is day 0 and is not
// counted; n=0 returns start unchanged).
function addBusinessDays(start, n) {
  let d = start;
  let remaining = n;
  while (remaining > 0) {
    d = addCalendarDaysUtc(d, 1);
    if (isBusinessDay(d)) remaining -= 1;
  }
  return d;
}

// --- public API -------------------------------------------------------------

// deadline({ anchor, days, basis, now, rollForward }) -> {
//   anchor, deadline, daysElapsed, daysRemaining, pastDue, basis
// }
//   anchor       — a date (string in lib/pa/date.js formats, or a Date)
//   days         — non-negative integer window length
//   basis        — 'calendar' (default) or 'business'
//   now          — optional Date for "today" (else SOPHIEWELL_NOW pin or wall clock)
//   rollForward  — calendar mode only: if the deadline lands on a weekend or
//                  federal holiday, roll it to the next business day (the common
//                  "if the last day is not a business day…" regulatory rule).
//                  Off by default so a pure N-calendar-day rule is exact.
export function deadline({ anchor, days, basis = 'calendar', now, rollForward = false }) {
  const start = parseDate(anchor);
  if (!isValidDate(start)) throw new RangeError('anchor must be a valid date');
  if (typeof days !== 'number' || !Number.isFinite(days) || !Number.isInteger(days) || days < 0) {
    throw new TypeError('days must be a non-negative integer');
  }
  let due;
  if (basis === 'business') {
    due = addBusinessDays(start, days);
  } else {
    due = addCalendarDaysUtc(start, days);
    if (rollForward) due = nextBusinessDay(due);
  }
  const today = todayUtc(now);
  return {
    anchor: fmtUtc(start),
    deadline: fmtUtc(due),
    daysElapsed: diffDays(today, start),
    daysRemaining: diffDays(due, today),
    pastDue: diffDays(due, today) < 0,
    basis: basis === 'business' ? 'business' : 'calendar',
  };
}
