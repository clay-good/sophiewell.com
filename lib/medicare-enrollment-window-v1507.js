// spec-v1507 tool 1: which Medicare Part B enrollment window is open on a date, and when coverage starts.
//
// Read in the eCFR on 2026-09-26:
//   20 CFR 404.2(c)(4): "An individual attains a given age on the first moment of the day preceding the
//     anniversary of his birth corresponding to such age" -- so a birthday on the 1st makes the month
//     before the month of eligibility.
//   42 CFR 407.14(a)(1): "the 7-month period that begins 3 months before the month an individual first
//     meets the eligibility requirements ... and ends 3 months after that first month of eligibility".
//   42 CFR 407.25(a)(2), on or after January 1, 2023: enrolling "during the first 3 months of the
//     initial enrollment period, entitlement begins with the first month of eligibility"; "during the
//     last 4 months ... entitlement begins with the month following the month in which they enroll".
//     407.25(b)(3): a general enrollment period enrollment starts "the first day of the month following
//     the month in which they enroll". 407.15(a): the general enrollment period is "January through
//     March of each calendar year".
//   42 CFR 406.24(b)(2): the special enrollment period "ends on the last day of the eighth consecutive
//     month during which the individual is at no time enrolled" in employer coverage based on current
//     employment; (e)(1) enrolling while so covered, or in the first full month without it, starts
//     coverage "on the first day of the month of enrollment or, at the individual's option, on the first
//     day of any of the three following months"; (e)(2) otherwise the month after enrollment.
//
// Pure: no DOM, no clock.

import { parseIsoStrict, addCalendarDaysUtc, addMonthsUtc, firstOfNextMonth, fmtUtc } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';

const POSTURE = 'This is the rule\'s arithmetic, not a Social Security decision. Social Security\'s notice controls.';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthName = (d) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const first = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const lastOf = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
const opt = (s, what) => {
  if (!String(s ?? '').trim()) return { none: true };
  try { return { d: parseIsoStrict(String(s).trim()) }; } catch { return { error: `Enter ${what} as YYYY-MM-DD, or leave it blank.` }; }
};

export function medicareEnrollmentWindow(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const birth = opt(o.birthDate, 'the date of birth');
  const elig = opt(o.eligibleFrom, 'the first month of disability eligibility');
  if (birth.error) return { valid: false, message: birth.error };
  if (elig.error) return { valid: false, message: elig.error };
  if (!birth.d && !elig.d) return { valid: false, message: 'Enter the date of birth, or for Medicare based on disability, the first month of eligibility.' };
  let enroll;
  try { enroll = parseIsoStrict(String(o.enrollDate ?? '').trim()); } catch { return { valid: false, message: 'Enter the date of signing up, or the date to check (YYYY-MM-DD).' }; }
  const notes = [];
  let E;
  if (elig.d) {
    E = first(elig.d);
    notes.push(`First month of eligibility: ${monthName(E)}, as entered.`);
  } else {
    const turns = addCalendarDaysUtc(new Date(Date.UTC(birth.d.getUTCFullYear() + 65, birth.d.getUTCMonth(), birth.d.getUTCDate())), -1);
    E = first(turns);
    notes.push(`Age 65 is attained on ${longDate(turns)}, the day before the 65th birthday (20 CFR 404.2(c)(4)), so the first month of eligibility is ${monthName(E)}.`);
  }
  const iepStart = addMonthsUtc(E, -3);
  const iepEnd = lastOf(addMonthsUtc(E, 3));
  const iepText = `${longDate(iepStart)} to ${longDate(iepEnd)}`;
  // Special enrollment period from the end of employer coverage.
  const cov = opt(o.employerCoverageEnd, 'the last day of employer coverage');
  if (cov.error) return { valid: false, message: cov.error };
  let sep = null;
  if (cov.d) {
    const firstFree = firstOfNextMonth(cov.d); // the month that ends is a month with coverage in it
    sep = { firstFree, end: lastOf(addMonthsUtc(firstFree, 7)) };
  }
  let band;
  let label;
  let start = null;
  if (enroll >= iepStart && enroll <= iepEnd) {
    start = enroll < E ? E : firstOfNextMonth(enroll);
    band = `Initial enrollment period, ${iepText}, is open: signing up on ${longDate(enroll)} starts coverage ${longDate(start)}.`;
    label = 'Initial enrollment period';
    notes.push(enroll < E ? 'Signing up in the 3 months before the month of eligibility starts coverage in that month.' : 'Signing up in the month of eligibility or later starts coverage the first of the next month (the rule since January 1, 2023).');
  } else if (sep && enroll <= sep.end && enroll > iepEnd) {
    const early = enroll < addMonthsUtc(sep.firstFree, 1);
    start = early ? first(enroll) : firstOfNextMonth(enroll);
    band = `Special enrollment period after employer coverage, to ${longDate(sep.end)}, is open: signing up on ${longDate(enroll)} starts coverage ${longDate(start)}.`;
    label = 'Special enrollment period';
    notes.push(`The special period ends on the last day of the 8th full month without employer coverage, counted from ${monthName(sep.firstFree)} (42 CFR 406.24(b)(2)).`);
    if (early) notes.push('Signing up while still covered, or in the first full month without coverage, can start coverage that month or, by choice, in any of the next three months.');
    notes.push('The special period needs employer coverage based on current employment (the person\'s or a spouse\'s, or a family member\'s for large plans and disability); COBRA and retiree coverage do not count.');
  } else if (enroll.getUTCMonth() <= 2 && enroll > iepEnd) {
    start = firstOfNextMonth(enroll);
    band = `General enrollment period (January 1 to March 31) is open: signing up on ${longDate(enroll)} starts coverage ${longDate(start)}.`;
    label = 'General enrollment period';
    notes.push('Signing up after the initial period without a special period usually adds the Part B late penalty for each full 12 months late.');
  } else if (enroll < iepStart) {
    band = `No window is open yet: the initial enrollment period runs ${iepText}.`;
    label = 'Not open yet';
  } else {
    const nextGep = new Date(Date.UTC(enroll.getUTCFullYear() + 1, 0, 1));
    band = `No window is open on ${longDate(enroll)}: the initial period ended ${longDate(iepEnd)}${sep ? ` and the special period ended ${longDate(sep.end)}` : ''}. The next general enrollment period opens ${longDate(nextGep)}.`;
    label = 'No window open';
    notes.push('Signing up late usually adds the Part B late penalty for each full 12 months late.');
  }
  notes.push(`The initial enrollment period is ${iepText} (42 CFR 407.14).`);
  return { valid: true, window: label, coverageStarts: start ? fmtUtc(start) : null, band, bandLabel: label, notes, note: POSTURE };
}
