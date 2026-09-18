// spec-v1389: New York psychiatric hold deadlines under Mental Hygiene Law article 9.
//
// Sources (N.Y. Mental Hygiene Law, nysenate.gov text read 2026-09-18):
//   9.39  Emergency admission. "Such person shall not be retained for a period of more than
//         forty-eight hours unless within such period such finding is confirmed after examination
//         by another physician"; retention up to fifteen days from admission; on a request, a
//         hearing "not more than five days after such request is received."
//   9.37  Admission on a director's (or designee's) certificate. "Within seventy-two hours,
//         excluding Sunday and holidays, after such admission", if the patient is to be retained
//         and does not agree to stay voluntarily, the certificate of another examining physician
//         of the psychiatric staff is filed.
//   9.40  Comprehensive psychiatric emergency program (CPEP). Examination begun within six hours
//         after the person is received; no involuntary retention past twenty-four hours unless a
//         second physician confirms; seventy-two hours at most. "All time periods ... shall be
//         calculated from the time such person is initially registered into the emergency room."
//   9.13  Voluntary patient's written notice to leave: retention "not to exceed seventy-two hours
//         from receipt of such notice", within which the director releases the patient or applies
//         to the supreme or county court; a court order may authorize up to sixty days.
//   9.27  Involuntary admission on medical certification: the application "must have been
//         executed within ten days prior to such admission"; the certificates are from two
//         physicians, or a physician and a psychiatric nurse practitioner.
//
// THE TRAP: 9.37's 72 hours EXCLUDE Sundays and holidays; 9.39's 48 hours, 9.40's clocks, and
// 9.13's 72 hours do not. The holidays are New York's (General Construction Law s.24), from
// lib/state-calendar.js.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import {
  parseDateTime, parseDate, addHours, addExcludingSundaysAndHolidays, formatDeadline, scopeSentence,
} from './state-calendar.js';

export const NY_HOLD_VERIFIED = '2026-09-18';
export const NY_HOLD_NOTE = 'N.Y. Mental Hygiene Law article 9. Section 9.39: a second physician confirms within 48 hours of admission, retention runs at most 15 days, and a requested hearing is held within 5 days. Section 9.37: the second certificate is filed within 72 hours of admission, excluding Sundays and holidays. Section 9.40 (CPEP): examination within 6 hours of registration, 24 hours unless a second physician confirms, 72 hours at most. Section 9.13: release or apply to court within 72 hours of a voluntary patient\'s written notice. Section 9.27: the application is executed within 10 days before admission.';

export const NY_STATUSES = [
  { value: '9.39', text: '9.39 emergency admission' },
  { value: '9.37', text: "9.37 director's certificate" },
  { value: '9.40', text: '9.40 CPEP emergency room' },
  { value: '9.13', text: "9.13 voluntary patient's notice to leave" },
  { value: '9.27', text: '9.27 involuntary on two certificates' },
];

const DAY = 86400000;

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function listOf(items) {
  if (items.length <= 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
function need(label) {
  return { valid: false, message: `Enter ${label}. Without it no deadline is printed.` };
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function longDate(t) {
  const d = new Date(t);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function nyMhlHoldClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.status) || !NY_STATUSES.some((s) => s.value === o.status)) {
    return { valid: false, message: 'Choose the legal status: 9.39, 9.37, 9.40, 9.13, or 9.27. Each counts time differently.' };
  }
  const deadlines = [];
  const caveats = [];
  let band;
  let skipped = [];

  if (o.status === '9.39') {
    if (isBlank(o.start)) return need('the admission time');
    const a = parseDateTime(o.start);
    if (a === null) return { valid: false, message: 'Enter the admission time as a date and time.' };
    const c = addHours(a, 48);
    caveats.push(...c.caveats);
    const maxDay = Math.floor(a / DAY) * DAY + 15 * DAY;
    deadlines.push({ label: 'Second physician confirms (9.39: 48 hours, Sundays and holidays counted)', at: c.end, text: formatDeadline(a, c.endWall, 'admission') });
    deadlines.push({ label: 'Retention ends unless converted to another status (9.39: 15 days from admission)', at: new Date(maxDay).toISOString().slice(0, 10), text: longDate(maxDay) });
    if (!isBlank(o.hearingRequested)) {
      const h = parseDateTime(o.hearingRequested);
      if (h === null) return { valid: false, message: 'Enter the hearing request time as a date and time, or leave it blank.' };
      if (h < a) return { valid: false, message: 'The hearing request is before the admission. Check the two times.' };
      const hd = Math.floor(h / DAY) * DAY + 5 * DAY;
      deadlines.push({ label: 'Hearing held (9.39: not more than 5 days after the request is received)', at: new Date(hd).toISOString().slice(0, 10), text: `by ${longDate(hd)}` });
    }
    band = `Under 9.39 the admitting finding must be confirmed by another physician by ${formatDeadline(a, c.endWall, 'admission')}. The 48 hours count Sundays and holidays.`;
  } else if (o.status === '9.37') {
    if (isBlank(o.start)) return need('the admission time');
    const a = parseDateTime(o.start);
    if (a === null) return { valid: false, message: 'Enter the admission time as a date and time.' };
    const c = addExcludingSundaysAndHolidays('NY', a, 72);
    caveats.push(...c.caveats);
    skipped = c.skipped;
    deadlines.push({ label: "Second physician's certificate filed (9.37: 72 hours, excluding Sundays and holidays)", at: c.end, text: formatDeadline(a, c.endWall, 'admission') });
    band = `Under 9.37 the second certificate must be filed by ${formatDeadline(a, c.endWall, 'admission')}: 72 counted hours${skipped.length ? `, skipping ${listOf(skipped)}` : ''}.`;
  } else if (o.status === '9.40') {
    if (isBlank(o.start)) return need('the time the person was registered into the CPEP emergency room');
    const r = parseDateTime(o.start);
    if (r === null) return { valid: false, message: 'Enter the CPEP registration time as a date and time.' };
    const e6 = addHours(r, 6);
    const e24 = addHours(r, 24);
    const e72 = addHours(r, 72);
    caveats.push(...e72.caveats);
    deadlines.push({ label: 'Examination begun by a staff physician (9.40: within 6 hours)', at: e6.end, text: formatDeadline(r, e6.endWall, 'registration') });
    deadlines.push({ label: 'Released unless a second physician confirms (9.40: 24 hours)', at: e24.end, text: formatDeadline(r, e24.endWall, 'registration') });
    deadlines.push({ label: 'Maximum retention in the CPEP (9.40: 72 hours)', at: e72.end, text: formatDeadline(r, e72.endWall, 'registration') });
    band = `Under 9.40 every period runs from CPEP registration: examination by ${formatDeadline(r, e6.endWall, 'registration')}, a second physician's confirmation by ${formatDeadline(r, e24.endWall, 'registration')}, and 72 hours at most.`;
  } else if (o.status === '9.13') {
    if (isBlank(o.start)) return need("the time the director received the patient's written notice");
    const n = parseDateTime(o.start);
    if (n === null) return { valid: false, message: 'Enter the time the written notice was received as a date and time.' };
    const e = addHours(n, 72);
    caveats.push(...e.caveats);
    deadlines.push({ label: 'Release the patient or apply to court (9.13: 72 hours from receipt of the notice)', at: e.end, text: formatDeadline(n, e.endWall, 'receipt of the notice') });
    band = `Under 9.13 the patient must be released, or the court applied to, by ${formatDeadline(n, e.endWall, 'receipt of the notice')}. A court order may authorize retention for up to 60 days.`;
  } else {
    if (isBlank(o.executed) || isBlank(o.start)) return need('the date the application was executed and the admission time');
    const x = parseDate(o.executed);
    const a = parseDateTime(o.start);
    if (x === null || a === null) return { valid: false, message: 'Enter the application date as a date and the admission time as a date and time.' };
    const days = Math.round((Math.floor(a / DAY) * DAY - x) / DAY);
    if (days < 0) return { valid: false, message: 'The application is dated after the admission. Check the dates.' };
    const ok = days <= 10;
    deadlines.push({ label: 'Application executed within 10 days before admission (9.27)', at: new Date(x + 10 * DAY).toISOString().slice(0, 10), text: `executed ${days} day${days === 1 ? '' : 's'} before admission: ${ok ? 'within' : 'OUTSIDE'} the 10 days` });
    band = ok
      ? `Under 9.27 the application was executed ${days} day${days === 1 ? '' : 's'} before admission, within the 10 days the section allows.`
      : `Under 9.27 the application was executed ${days} days before admission, outside the 10 days the section allows.`;
    return finish({ band, deadlines, caveats, skipped, abnormal: !ok, status: o.status });
  }
  return finish({ band, deadlines, caveats, skipped, abnormal: false, status: o.status });
}

function finish(r) {
  return {
    valid: true,
    status: r.status,
    abnormal: r.abnormal,
    bandLabel: r.deadlines.length ? `${r.deadlines[0].label.split(' (')[0]}: ${r.deadlines[0].text}` : '',
    band: r.band,
    deadlines: r.deadlines,
    skipped: r.skipped,
    caveats: r.caveats,
    postureNote: scopeSentence(NY_HOLD_VERIFIED),
    note: NY_HOLD_NOTE,
  };
}
