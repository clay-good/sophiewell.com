// spec-v1507 tool 7: COBRA notice, election, payment and end dates.
//
// Read in the eCFR on 2026-09-26:
//   29 CFR 2590.606-2: the employer notifies the administrator "not later than 30 days after" the
//     qualifying event (or the loss of coverage, when the plan measures from there).
//   29 CFR 2590.606-4(b): the administrator sends the election notice "not later than 14 days after
//     receipt of the notice of qualifying event"; an employer that is also the administrator has "44
//     days" from the event (or the loss of coverage).
//   26 CFR 54.4980B-6: the election period "must not end before the date that is 60 days after the
//     later of" the loss of coverage and the election notice.
//   26 CFR 54.4980B-7: coverage ends 18 months after a termination or reduction of hours, 29 with a
//     disability extension (or, if later, the first day of the month more than 30 days after the
//     final Social Security disability determination), and 36 months after other events.
//   26 CFR 54.4980B-8: the first payment cannot be required "earlier than 45 days after the date on
//     which the election ... is made"; later payments are timely within 30 days of each period; the
//     premium may be up to 102 percent, or 150 percent in the disability-extension months.
//
// Pure: no DOM, no clock.

import { parseIsoStrict, addCalendarDaysUtc, addMonthsUtc, fmtUtc } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';

const POSTURE = 'This is the rule\'s arithmetic, not a coverage decision. The plan and its COBRA notices control.';
export const EVENTS = [
  { value: 'employment', text: 'Job loss or reduced hours' },
  { value: 'other', text: 'Death, divorce, Medicare entitlement, or a child aging out' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const opt = (s, what) => {
  if (!String(s ?? '').trim()) return { none: true };
  try { return { d: parseIsoStrict(String(s).trim()) }; } catch { return { error: `Enter ${what} as YYYY-MM-DD, or leave it blank.` }; }
};

export function cobraClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const ev = EVENTS.some((e) => e.value === o.event) ? o.event : null;
  if (!ev) return { valid: false, message: 'Choose the qualifying event.' };
  let event;
  try { event = parseIsoStrict(String(o.eventDate ?? '').trim()); } catch { return { valid: false, message: 'Enter the date of the qualifying event (YYYY-MM-DD).' }; }
  const lossO = opt(o.lossDate, 'the date coverage is lost');
  if (lossO.error) return { valid: false, message: lossO.error };
  const loss = lossO.d || event;
  if (loss < event) return { valid: false, message: 'Enter the loss of coverage again: it cannot come before the event.' };
  const selfAdmin = o.employerAdministers === 'yes' || o.employerAdministers === 'no' ? o.employerAdministers : null;
  if (!selfAdmin) return { valid: false, message: 'Choose whether the employer is also the plan administrator: the notice deadline depends on it.' };
  const notes = [];
  if (!lossO.d) notes.push('No loss-of-coverage date was entered, so coverage is taken to end on the event date.');
  if (selfAdmin === 'yes') {
    notes.push(`The employer, as administrator, must send the election notice by ${longDate(addCalendarDaysUtc(event, 44))} (44 days after the event; 29 CFR 2590.606-4(b)(2)).`);
  } else {
    notes.push(`The employer must tell the plan administrator by ${longDate(addCalendarDaysUtc(event, 30))} (30 days; 29 CFR 2590.606-2), and the administrator then has 14 days from receiving that to send the election notice.`);
  }
  const noticeO = opt(o.noticeDate, 'the date of the election notice');
  if (noticeO.error) return { valid: false, message: noticeO.error };
  let electBy = null;
  if (noticeO.d) {
    const later = noticeO.d > loss ? noticeO.d : loss;
    electBy = addCalendarDaysUtc(later, 60);
    notes.push(`Elect by ${longDate(electBy)}: 60 days after the later of the loss of coverage and the election notice (26 CFR 54.4980B-6).`);
  } else {
    notes.push(`The election window runs at least 60 days from the later of the loss of coverage and the election notice: no earlier than ${longDate(addCalendarDaysUtc(loss, 60))}. Enter the notice date to fix it.`);
  }
  const electO = opt(o.electionDate, 'the date COBRA was elected');
  if (electO.error) return { valid: false, message: electO.error };
  if (electO.d) notes.push(`The first premium cannot be required before ${longDate(addCalendarDaysUtc(electO.d, 45))} (45 days after election); each later premium has a 30-day grace period (26 CFR 54.4980B-8).`);
  const disabled = o.disability === 'yes';
  const months = ev === 'employment' ? (disabled ? 29 : 18) : 36;
  const end = addMonthsUtc(event, months);
  if (disabled && ev !== 'employment') notes.push('The disability extension applies only after a job loss or reduced hours; the 36 months for this event already run longer.');
  if (disabled && ev === 'employment') notes.push('With the disability extension the premium may rise to 150% for months 19 to 29, and coverage runs to the later of 29 months or the first of the month more than 30 days after a final Social Security finding that the person is no longer disabled.');
  notes.push('The premium can be at most 102% of the plan\'s cost for the coverage (26 CFR 54.4980B-8).');
  return {
    valid: true,
    coverageEnds: fmtUtc(end),
    electBy: electBy ? fmtUtc(electBy) : null,
    band: `COBRA can last ${months} months after the event, to ${longDate(end)} (26 CFR 54.4980B-7)${electBy ? `; elect by ${longDate(electBy)}` : ''}.`,
    bandLabel: `Up to ${fmtUtc(end)}`,
    notes,
    note: POSTURE,
  };
}
