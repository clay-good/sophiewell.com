// spec-v1638 tool 28: is a vaccine dose valid under CDC's minimum interval and grace period rule?
//
// Source: CDC, ACIP General Best Practice Guidelines for Immunization, "Timing and Spacing of
// Immunobiologics", read October 12, 2026 in CDC's PDF edition of the guideline, and re-read October
// 15, 2026 on the web page itself (still dated July 24, 2024), where every sentence below matches:
//   "vaccine doses administered <=4 days before the minimum interval or age are considered valid;
//     however, local or state mandates might supersede this 4-day guideline. (Day 1 is the day
//     before the day that marks the minimum age or minimum interval for a vaccine.)"
//   "Because of the unique schedule for rabies vaccine and the accelerated Twinrix schedule the
//     4-day guideline does not apply".
//   "Doses of any vaccine administered >=5 days earlier than the minimum interval or age should
//     not be counted as valid doses and should be repeated as age appropriate. The repeat dose
//     should be spaced after the invalid dose by the recommended minimum interval".
//   "If the first dose in a series is given >=5 days before the recommended minimum age, the dose
//     should be repeated on or after the date when the child reaches at least the minimum age. If
//     the vaccine is a live vaccine, ensuring that a minimum interval of 28 days has elapsed from
//     the invalid dose is recommended".
//   Two live injectable or intranasal vaccines not given simultaneously: 28 days minimum (Table
//     3-4). "If 2 such vaccines are separated by <4 weeks, the second vaccine administered should
//     not be counted and the dose should be repeated at least 4 weeks later." "The 4-day grace
//     period ... should not be applied to this 4-week interval between 2 different live vaccines",
//     including a second dose due 4 weeks after two live vaccines given the same day.
//   The live oral vaccines (Ty21a typhoid, rotavirus) may be given at any interval before or
//     after other live vaccines.
//   Table 3-2 notes: "'Months' refers to calendar months"; special grace periods of 2 months for
//     two doses, to which "4 days should not be added".
//
// NO SCHEDULE SHIPS: the minimum age and minimum interval are the reader's entries from the
// current CDC schedule. The tool reports validity under the rule; whether to give or repeat a
// dose is the vaccinator's decision.
//
// DATED RULE (route B): the page is under the weekly page watch, and the rule answers only through its
// review date; after that the tool fails closed and asks for the page to be read again.
//
// Pure: no DOM, no network; `now` is passed in, or the current date.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc, addMonthsUtc } from './deadline.js';
import { inputFault } from './num.js';
import { datedValue } from './dated-data.js';

export const DATED_VACCINE_RULE = {
  'cdc-timing-spacing': { edition: 'page dated July 24, 2024', validThrough: '2027-10-15', route: 'B', readOn: '2026-10-15', source: { label: 'CDC, Timing and Spacing of Immunobiologics', url: 'https://www.cdc.gov/vaccines/hcp/imz-best-practices/timing-spacing-immunobiologics.html' }, values: { graceDays: 4, liveSpacingDays: 28 } },
};

const opt = (value, text) => ({ value, text });
export const UNITS = [opt('days-unit', 'days'), opt('wk-unit', 'weeks'), opt('calendar-months-unit', 'calendar months'), opt('yr-unit', 'years')];
export const LIVE = [opt('live-injectable-or-intranasal', 'A live injectable or intranasal vaccine'), opt('not-live-or-live-oral', 'Not live, or a live oral vaccine (Ty21a typhoid, rotavirus)')];
export const GRACE = [
  opt('four-day-grace-applies', 'The 4-day grace period applies'),
  opt('rabies-or-accelerated-twinrix', 'Rabies vaccine, or the accelerated Twinrix schedule: no grace period'),
  opt('mandate-disallows-grace', 'A state or local mandate disallows the grace period'),
];
export const TOGETHER = [opt('previous-dose-given-with-another-live', 'Yes'), opt('previous-dose-given-alone', 'No')];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const days = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);
const later = (a, b) => (a.getTime() >= b.getTime() ? a : b);
function add(d, n, unit) {
  if (unit === 'days-unit') return addCalendarDaysUtc(d, n);
  if (unit === 'wk-unit') return addCalendarDaysUtc(d, n * 7);
  if (unit === 'yr-unit') return addMonthsUtc(d, n * 12);
  return addMonthsUtc(d, n);
}
const unitWord = (u, n) => `${n} ${UNITS.find((x) => x.value === u).text}`;

export function vaccineIntervalValidity(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const rule = datedValue('cdc-timing-spacing', 'graceDays', now instanceof Date ? now : undefined, DATED_VACCINE_RULE);
  if (rule.expired) return { valid: false, message: `This rule was read from CDC's ${rule.source.label} (${rule.edition}) and has passed its review date, so no answer is given. Read the current page and check the dose against it.` };
  const dose = date(o.doseDate);
  if (!dose) return { valid: false, message: 'Enter the date of the dose being checked.' };
  const live = LIVE.find((l) => l.value === String(o.live ?? '').trim());
  if (!live) return { valid: false, message: 'Choose whether this is a live injectable or intranasal vaccine: those carry a separate 28-day rule.' };
  const grace = GRACE.find((g) => g.value === String(o.graceRule ?? '').trim());
  if (!grace) return { valid: false, message: 'Choose the grace period rule: 4 days applies, except for rabies vaccine, the accelerated Twinrix schedule, or where a mandate disallows it.' };
  const hasInterval = !blank(o.previousDose) || !blank(o.minInterval);
  const hasAge = !blank(o.birthDate) || !blank(o.minAge);
  if (!hasInterval && !hasAge) return { valid: false, message: 'Enter the previous dose date with the minimum interval, the date of birth with the minimum age, or both. The minimums come from the current CDC schedule; none is supplied here.' };
  const whole = (label, v) => inputFault([[label, v, 0, 1500, '']]) || (Number.isInteger(Number(v)) ? null : `Enter ${label} as a whole number.`);
  const unitOf = (v, label) => UNITS.find((u) => u.value === String(v ?? '').trim()) || { fault: `Choose the unit of ${label}: days, weeks, calendar months or years.` };
  let special = null;
  if (!blank(o.specialGraceMonths)) {
    const f = whole('the special grace period in months', o.specialGraceMonths); if (f) return { valid: false, message: f };
    special = Number(o.specialGraceMonths);
  }
  const noGrace = grace.value !== 'four-day-grace-applies';
  const tests = []; const notes = [];
  let prev = null; let intervalDue = null; let intervalN = null; let intervalUnit = null;
  if (hasInterval) {
    prev = date(o.previousDose);
    if (!prev) return { valid: false, message: 'Enter the date of the previous dose.' };
    if (prev.getTime() >= dose.getTime()) return { valid: false, message: 'Enter a previous dose date that is before this dose.' };
    const f = whole('the minimum interval', o.minInterval); if (f) return { valid: false, message: f };
    const u = unitOf(o.minIntervalUnit, 'the minimum interval'); if (u.fault) return { valid: false, message: u.fault };
    intervalN = Number(o.minInterval); intervalUnit = u.value;
    intervalDue = add(prev, intervalN, intervalUnit);
    tests.push({ what: 'minimum interval', due: intervalDue, text: `${unitWord(intervalUnit, intervalN)} after the previous dose on ${say(prev)}` });
  }
  let ageDue = null;
  if (hasAge) {
    const birth = date(o.birthDate);
    if (!birth) return { valid: false, message: 'Enter the date of birth.' };
    if (birth.getTime() > dose.getTime()) return { valid: false, message: 'Enter a date of birth that is not after the dose.' };
    const f = whole('the minimum age', o.minAge); if (f) return { valid: false, message: f };
    const u = unitOf(o.minAgeUnit, 'the minimum age'); if (u.fault) return { valid: false, message: u.fault };
    ageDue = add(birth, Number(o.minAge), u.value);
    tests.push({ what: 'minimum age', due: ageDue, text: `age ${unitWord(u.value, Number(o.minAge))}, reached on` });
  }
  // The live-vaccine rule takes the grace period away from an interval set by another live vaccine.
  let together = null;
  if (live.value === 'live-injectable-or-intranasal' && hasInterval) {
    together = TOGETHER.find((t) => t.value === String(o.previousWithOtherLive ?? '').trim());
    if (!together) return { valid: false, message: 'Choose whether the previous dose was given the same day as a different live injectable or intranasal vaccine: if so, the grace period cannot shorten the wait.' };
  }
  const invalid = [];
  for (const t of tests) {
    const liveBlock = t.what === 'minimum interval' && together && together.value === 'previous-dose-given-with-another-live';
    const useSpecial = special !== null && !noGrace && !liveBlock;
    const graceDays = noGrace || liveBlock ? 0 : 4;
    const earliest = useSpecial ? addMonthsUtc(t.due, -special) : addCalendarDaysUtc(t.due, -graceDays);
    const early = days(t.due, dose);
    const ok = dose.getTime() >= earliest.getTime();
    t.ok = ok; t.daysEarly = Math.max(0, early);
    const graceText = useSpecial ? `the schedule's special grace period of ${special} month${special === 1 ? '' : 's'} (the 4 days are not added to it)` : graceDays ? 'the 4-day grace period' : liveBlock ? 'no grace period, because the previous dose was given with a different live vaccine' : `no grace period (${grace.value === 'mandate-disallows-grace' ? 'a mandate disallows it' : 'rabies vaccine or the accelerated Twinrix schedule'})`;
    notes.push(`${t.what.charAt(0).toUpperCase()}${t.what.slice(1)}: ${t.text} ${t.what === 'minimum age' ? say(t.due) : `is ${say(t.due)}`}. This dose on ${say(dose)} is ${early > 0 ? `${early} day${early === 1 ? '' : 's'} early` : 'on or after that date'}; with ${graceText}, the earliest valid date is ${say(earliest)}: ${ok ? 'valid' : 'not valid'}.`);
    if (!ok) invalid.push(t.what);
  }
  let liveTooClose = false;
  if (live.value === 'live-injectable-or-intranasal') {
    if (!blank(o.otherLiveDate)) {
      const other = date(o.otherLiveDate);
      if (!other) return { valid: false, message: 'Enter the date of the most recent other live vaccine as a real date, or leave it blank.' };
      const gap = days(dose, other);
      if (gap === 0) notes.push('The other live vaccine was given the same day, which the 28-day rule allows.');
      else if (gap > 0 && gap < 28) { liveTooClose = true; invalid.push('28 days from another live vaccine'); notes.push(`Another live injectable or intranasal vaccine was given ${gap} day${gap === 1 ? '' : 's'} earlier, on ${say(other)}: less than 28 days, and not the same day, so this dose is not counted. The grace period does not apply to this 28 days.`); }
      else if (gap >= 28) notes.push(`The most recent other live injectable or intranasal vaccine, on ${say(other)}, was ${gap} days earlier: at least 28.`);
      else notes.push(`The other live vaccine entered, on ${say(other)}, is after this dose; it is that later vaccine the rule would not count, not this one.`);
    } else notes.push('No other live injectable or intranasal vaccine date was entered. One given within the previous 28 days, on a different day, would make this dose not counted.');
  } else notes.push('Not a live injectable or intranasal vaccine, or a live oral one (Ty21a typhoid, rotavirus): the 28-day rule between live vaccines does not apply.');
  const out = { valid: true, doseValid: invalid.length === 0, failed: invalid };
  if (invalid.length) {
    let repeat = dose;
    if (invalid.includes('minimum interval')) repeat = later(repeat, add(dose, intervalN, intervalUnit));
    if (invalid.includes('minimum age')) { repeat = later(repeat, ageDue); if (live.value === 'live-injectable-or-intranasal') repeat = later(repeat, addCalendarDaysUtc(dose, 28)); }
    if (liveTooClose) repeat = later(repeat, addCalendarDaysUtc(dose, 28));
    out.earliestRepeat = fmtUtc(repeat);
    const why = [];
    if (invalid.includes('minimum interval')) why.push(`the minimum interval of ${unitWord(intervalUnit, intervalN)} counted from the invalid dose`);
    if (invalid.includes('minimum age')) why.push(`the date the minimum age is reached${live.value === 'live-injectable-or-intranasal' ? ', and 28 days from the invalid dose for a live vaccine' : ''}`);
    if (liveTooClose) why.push('4 weeks after this dose');
    notes.push(`Not a valid dose under the CDC rule, so it is repeated as age appropriate. The earliest date for the repeat is ${say(repeat)}: ${why.join('; ')}.`);
  }
  notes.push('The minimum age and interval are as entered, from the current CDC schedule; no schedule is supplied here. "Months" are calendar months. A state or local mandate can be stricter. This reports validity under CDC\'s best-practice rule; whether to give or repeat a dose is the vaccinator\'s decision.');
  return { ...out, flag: invalid.length ? 'dose-not-valid' : 'dose-valid', abnormal: invalid.length > 0, band: invalid.length ? `Not a valid dose: ${invalid.join(' and ')}.` : 'A valid dose under the CDC minimum age and interval rule.', bandLabel: invalid.length ? `Repeat no earlier than ${out.earliestRepeat}` : 'Valid', notes, note: notes.join(' ') };
}
