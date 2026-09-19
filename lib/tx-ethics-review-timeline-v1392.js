// spec-v1392: Texas ethics or medical committee review of a disputed treatment decision -- the
// dates in Health & Safety Code 166.046 as amended in 2023.
//
// Source: official mirror tcss.legis.texas.gov, HSC ch. 166, read 2026-09-18.
//   (b)(1) The person responsible for the patient's decisions is informed in writing "not less than
//     seven calendar days before the meeting", unless waived by written mutual agreement.
//   (b-3) A facility or person intending to bring legal counsel makes a good faith effort to give
//     written notice "not less than 48 hours before the meeting begins".
//   (d-2) When a transfer-enabling medical procedure meets every condition but consent, the person
//     has 24 hours from the request to consent; consent brings a delay notice, no consent a start
//     notice.
//   (e) The physician and facility are not obligated to provide life-sustaining treatment "after the
//     25th calendar day after a start notice is provided", or after the procedure named in a delay
//     notice is performed, whichever occurs first, unless a court extends the period under (g).
//     Artificial nutrition and hydration continue unless an (e)(1)-(5) exception applies, and pain
//     and comfort care are never withdrawn.
//   (d-3) Once the 25-day period begins it may not be suspended or stopped for any reason.
//
// Pure: no DOM, no clock, no network. Dates 'YYYY-MM-DD'; times 'YYYY-MM-DDTHH:MM'.

import { parseDate, parseDateTime, addHours, formatDeadline, scopeSentence } from './state-calendar.js';

export const ETHICS_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
const DAY = 86400000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function day(t) {
  const d = new Date(t);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
function clockOf(t) {
  const d = new Date(t);
  const h = d.getUTCHours();
  return `${day(t)}, ${h % 12 === 0 ? 12 : h % 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}
function dateOf(v) {
  const dt = parseDateTime(v);
  if (dt !== null) return Math.floor(dt / DAY) * DAY;
  return parseDate(v);
}

export function txEthicsReviewTimeline(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.noticeGiven)) return { valid: false, message: 'Enter the date the written notice of the meeting was given. The meeting may be no sooner than seven calendar days later.' };
  const notice = parseDate(o.noticeGiven);
  if (notice === null) return { valid: false, message: 'Enter the notice date as a date.' };
  const waived = o.waived === 'yes';
  const earliestMeeting = notice + 7 * DAY;
  const lines = [];
  const problems = [];
  lines.push(waived
    ? 'The seven-day notice period was waived by written mutual agreement.'
    : `Earliest meeting: ${day(earliestMeeting)}, seven calendar days after written notice.`);

  if (!isBlank(o.meeting)) {
    const m = parseDateTime(o.meeting);
    if (m === null) return { valid: false, message: 'Enter the meeting as a date and time.' };
    if (!waived && m < earliestMeeting) problems.push(`the meeting on ${day(m)} is less than seven calendar days after written notice, and no written waiver is entered`);
    lines.push(`Notice of intent to bring legal counsel: a good faith effort to give it by ${clockOf(m - 48 * 3600000)}, 48 hours before the meeting (b-3).`);
  }

  let clock = null;
  if (!isBlank(o.consentRequested)) {
    const r = parseDateTime(o.consentRequested);
    if (r === null) return { valid: false, message: 'Enter when consent for the transfer-enabling procedure was requested, as a date and time.' };
    const w = addHours(r, 24);
    lines.push(`Consent to the transfer-enabling procedure: within 24 hours of the request, by ${formatDeadline(r, w.endWall, 'the request')}. Consent brings a delay notice; no consent, a start notice.`);
  }
  if (!isBlank(o.startNotice) && !isBlank(o.procedureDone)) {
    return { valid: false, message: 'Enter either the start notice or the date the delay-notice procedure was performed, whichever came first. The 25 days run from that one.' };
  }
  const startRaw = !isBlank(o.startNotice) ? o.startNotice : o.procedureDone;
  if (!isBlank(startRaw)) {
    const s = dateOf(startRaw);
    if (s === null) return { valid: false, message: 'Enter the start date as a date.' };
    const lastDay = s + 25 * DAY;
    clock = {
      from: !isBlank(o.startNotice) ? 'the start notice' : 'the procedure named in the delay notice',
      lastDay,
    };
  }

  let bandLabel;
  let band;
  if (problems.length) {
    bandLabel = 'Notice problem';
    band = `Check the notice: ${problems.join('; ')}.`;
  } else if (clock) {
    bandLabel = `Obligation runs through ${day(clock.lastDay)}`;
    band = `Life-sustaining treatment continues through ${day(clock.lastDay)}, the 25th calendar day after ${clock.from}; the obligation ends after that day unless a court extends the period (166.046(e), (g)). Once started, the 25 days cannot be paused or stopped (d-3).`;
  } else {
    bandLabel = 'The 25 days have not started';
    band = 'The 25-day period has not started: it begins with a start notice, or with the procedure named in a delay notice. Life-sustaining treatment continues during the review and pending transfer.';
  }
  return {
    valid: true,
    abnormal: problems.length > 0,
    lastDay: clock ? new Date(clock.lastDay).toISOString().slice(0, 10) : null,
    bandLabel,
    band,
    lines,
    carveOut: 'Artificial nutrition and hydration continue unless one of the (e)(1)-(5) exceptions applies, and pain management and comfort care are never withdrawn. This area is contested; involve the facility\'s ethics committee and counsel.',
    postureNote: scopeSentence(ETHICS_VERIFIED),
  };
}
