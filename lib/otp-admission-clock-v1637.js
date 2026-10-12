// spec-v1637 tool 13: opioid treatment program admission and interim treatment clocks.
//
// Source: 42 CFR 8.12(f) and (j), read on eCFR as current October 8, 2026 (re-read October 12,
// 2026).
//   (f)(2)(ii)  "If the licensed practitioner is not an OTP practitioner, the screening examination
//     must be completed no more than seven days prior to OTP admission."
//   (f)(2)(iii) "A full in-person physical examination ... must be completed within 14 calendar
//     days following a patient's admission to the OTP."
//   (f)(2)(iv)  serology and other testing "drawn not more than 30 days prior to admission ... may
//     form part of the full history and examination."
//   (f)(4)(i)   a physical and behavioral health assessment "within 14 calendar days following
//     admission"; "The full, initial psychosocial assessment must be completed within 14 calendar
//     days of admission and include preparation of a care plan".
//   (f)(6)      "no fewer than eight random drug tests per year patient, allowing for extenuating
//     circumstances at the individual patient level."
//   (j)(1)      "At least two drug tests shall be obtained from patients during the maximum of 180
//     days permitted for interim treatment."
//   (j)(4)(ii)  "Interim treatment cannot be provided for longer than 180 days in any 12-month
//     period"; (iii) "By day 120, a plan for continuing treatment beyond 180 days must be created".
//
// The rule does not say whether the first day of interim treatment is day 1. The tool counts it
// as day 1 (so day 120 and day 180 come one day sooner than counting from zero) and says so.
//
// Pure: no DOM, no clock, no network. It reports dates and whether dates the reader enters fall
// inside the rule; it reads no clock, so "overdue" is judged against the dates entered.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc } from './deadline.js';

export const SCREENERS = [
  { value: 'otp-practitioner', text: 'An OTP practitioner' },
  { value: 'outside-practitioner', text: 'A practitioner outside the program' },
];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const days = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);

export function otpAdmissionClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const admitted = date(o.admitted);
  if (!admitted) return { valid: false, message: 'Enter the admission date.' };
  const opt = {};
  for (const [key, label] of [['screened', 'the screening examination date'], ['labsDrawn', 'the date the labs were drawn'], ['fullExam', 'the date of the full examination'], ['assessment', 'the date of the psychosocial assessment and care plan'], ['interimStart', 'the interim treatment start date']]) {
    if (blank(o[key])) { opt[key] = null; continue; }
    opt[key] = date(o[key]);
    if (!opt[key]) return { valid: false, message: `Enter ${label} as a real date, or leave it blank.` };
  }
  const screener = SCREENERS.find((s) => s.value === String(o.screenedBy ?? '').trim()) || null;
  if (opt.screened && !screener) return { valid: false, message: 'Choose who did the screening examination: the seven-day limit applies to a practitioner outside the program.' };
  const fourteen = addCalendarDaysUtc(admitted, 14);
  const notes = []; const problems = [];
  const out = { valid: true, fullExamDue: fmtUtc(fourteen), assessmentDue: fmtUtc(fourteen), earliestOutsideScreening: fmtUtc(addCalendarDaysUtc(admitted, -7)), earliestLabDraw: fmtUtc(addCalendarDaysUtc(admitted, -30)) };

  if (opt.screened) {
    if (opt.screened.getTime() > admitted.getTime()) { problems.push('screening after admission'); notes.push(`Screening examination ${say(opt.screened)}: after the admission date. Treatment may commence after the screening examination has been completed (42 CFR 8.12(f)(2)(ii)).`); }
    else if (screener.value === 'outside-practitioner') {
      const gap = days(admitted, opt.screened);
      if (gap > 7) { problems.push('outside screening too early'); notes.push(`Screening examination ${say(opt.screened)} by a practitioner outside the program: ${gap} days before admission, more than the seven the rule allows (8.12(f)(2)(ii)).`); }
      else notes.push(`Screening examination ${say(opt.screened)} by a practitioner outside the program: ${gap} day${gap === 1 ? '' : 's'} before admission, within the seven the rule allows (8.12(f)(2)(ii)). Its written results go to the program and are verified by an OTP practitioner.`);
    } else notes.push(`Screening examination ${say(opt.screened)} by an OTP practitioner: the seven-day limit is for a practitioner outside the program (8.12(f)(2)(ii)).`);
  } else notes.push(`Screening examination: by a practitioner outside the program, no more than seven days before admission, so on or after ${say(addCalendarDaysUtc(admitted, -7))} (8.12(f)(2)(ii)). No screening date was entered.`);

  if (opt.labsDrawn) {
    const gap = days(admitted, opt.labsDrawn);
    if (gap > 30) { problems.push('labs drawn too early'); notes.push(`Labs drawn ${say(opt.labsDrawn)}: ${gap} days before admission, more than the 30 the rule allows for tests that form part of the examination (8.12(f)(2)(iv)).`); }
    else notes.push(`Labs drawn ${say(opt.labsDrawn)}: ${gap >= 0 ? `${gap} day${gap === 1 ? '' : 's'} before admission, within the 30 the rule allows` : 'after admission'} (8.12(f)(2)(iv)).`);
  } else notes.push(`Serology and other tests may form part of the examination if drawn not more than 30 days before admission, so on or after ${say(addCalendarDaysUtc(admitted, -30))} (8.12(f)(2)(iv)).`);

  for (const [key, what, para] of [['fullExam', 'Full in-person physical examination', '8.12(f)(2)(iii)'], ['assessment', 'Initial psychosocial assessment and care plan', '8.12(f)(4)(i)']]) {
    if (opt[key]) {
      const late = opt[key].getTime() > fourteen.getTime();
      if (late) problems.push(`${key === 'fullExam' ? 'full examination' : 'assessment'} late`);
      notes.push(`${what}: due within 14 calendar days of admission, by ${say(fourteen)}; done ${say(opt[key])}, ${late ? `${days(opt[key], fourteen)} day${days(opt[key], fourteen) === 1 ? '' : 's'} late` : 'in time'} (${para}).`);
    } else notes.push(`${what}: due within 14 calendar days of admission, by ${say(fourteen)} (${para}). No date was entered.`);
  }
  notes.push('Random drug testing in comprehensive treatment: no fewer than eight tests per year per patient, allowing for extenuating circumstances at the individual patient level (8.12(f)(6)).');
  if (opt.interimStart) {
    const day120 = addCalendarDaysUtc(opt.interimStart, 119); const day180 = addCalendarDaysUtc(opt.interimStart, 179);
    out.interimPlanBy = fmtUtc(day120); out.interimLastDay = fmtUtc(day180);
    notes.push(`Interim treatment from ${say(opt.interimStart)}, counted as day 1 (the rule does not say): a plan for continuing treatment beyond 180 days must be created and documented by day 120, ${say(day120)}; interim treatment cannot run longer than 180 days in any 12-month period, so day 180 is ${say(day180)}; and at least two drug tests are obtained in that time (8.12(j)(1), (j)(4)(ii)-(iii)). Earlier interim days in the same 12 months count toward the 180 and are not in this figure.`);
  }
  notes.push('The dates are the rule\'s outer limits. A state opioid treatment authority can set shorter ones.');
  return { ...out, problems, flag: problems.length ? 'outside-the-rule' : 'dates', abnormal: problems.length > 0, band: `Full examination and psychosocial assessment due by ${say(fourteen)}.`, bandLabel: problems.length ? `${problems.length} date${problems.length === 1 ? '' : 's'} outside the rule` : 'Admission dates', notes, note: notes.join(' ') };
}
