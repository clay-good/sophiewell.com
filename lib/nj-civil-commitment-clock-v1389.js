// spec-v1389: the New Jersey civil commitment clocks.
//
// Source: New Jersey Courts, Involuntary Civil Commitments Resource Binder (revised June 2024),
// citing N.J.S.A. 30:4-27.10, 30:4-27.12, 30:4-27.20 and R. 4:74-7; Directive #06-25 (November 17,
// 2025) on 30:4-27.9a.
//
//   Screening route  "A person cannot be detained at a facility or hospital for more than 72 hours
//                    from the time the screening certificate is completed." The facility obtains an
//                    order of temporary commitment within those 72 hours or discharges the person
//                    (R. 4:74-7(b)(1)).
//   Certificates     Two, and "at least one of them must be prepared by a psychiatrist" (27.10(b)).
//                    "No certificate may be executed by a person who is a relative by blood or
//                    marriage"; the same psychiatrist may not sign both the screening and the
//                    clinical certificate unless a reasonable attempt to find another failed.
//   Final hearing    "within 20 days from initial commitment to treatment" (27.12); an adjournment of
//                    up to 14 days more only for exceptional circumstances (R. 4:74-7(c)(1)).
//   Voluntary        Without a temporary or final order, a voluntary patient who asks to leave is
//   discharge        discharged "within 48 hours of the discharge request or at the end of the next
//                    working day following the request, whichever is longer" (27.20).
//
// THE TRAP: the 72 hours start at the SCREENING CERTIFICATE, not at arrival in the emergency
// department.
//
// NOT OFFERED: the 30:4-27.9a continued hold of up to 72 more hours. Directive #06-25 extended the
// window for applying to August 31, 2026; no further extension has been found, so the tile does not
// offer it and says so.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import {
  parseDateTime, parseDate, addHours, nextBusinessDay, formatDeadline, scopeSentence,
} from './state-calendar.js';

export const NJ_CC_VERIFIED = '2026-09-18';
export const NJ_CC_NOTE = 'New Jersey civil commitment (N.J.S.A. 30:4-27.10, 27.12, 27.20; R. 4:74-7). A person referred by a screening service may not be held more than 72 hours from completion of the screening certificate without a temporary commitment order. Two certificates are needed, at least one by a psychiatrist, and none by a relative by blood or marriage. The final hearing is within 20 days of initial commitment. A voluntary patient who asks to leave is discharged within 48 hours or at the end of the next working day, whichever is longer, unless a court order is obtained.';

export const NJ_MODES = [
  { value: 'screening', text: 'Referred by a screening service' },
  { value: 'voluntary', text: 'Voluntary patient asking to be discharged' },
];
export const MET_OR_NOT = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
  { value: 'not-assessed', text: 'Not assessed' },
];

const DAY = 86400000;

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function longDate(t) {
  const d = new Date(t);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
function iso(t) { return new Date(t).toISOString().slice(0, 10); }

export function njCivilCommitmentClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.mode) || !NJ_MODES.some((m) => m.value === o.mode)) {
    return { valid: false, message: 'Choose the route: referred by a screening service, or a voluntary patient asking to be discharged.' };
  }
  const deadlines = [];
  const checks = [];
  const caveats = [];
  let band;
  let abnormal = false;

  if (o.mode === 'voluntary') {
    if (isBlank(o.start)) return { valid: false, message: 'Enter the time the voluntary patient asked to be discharged. Without it no deadline is printed.' };
    const r = parseDateTime(o.start);
    if (r === null) return { valid: false, message: 'Enter the discharge request time as a date and time.' };
    const h48 = addHours(r, 48);
    caveats.push(...h48.caveats);
    const nwd = Date.parse(nextBusinessDay('NJ', Math.floor(r / DAY) * DAY) + 'T00:00:00Z');
    const h48Day = Math.floor(h48.endWall / DAY) * DAY;
    const workdayLater = nwd > h48Day;
    deadlines.push({ label: '48 hours from the discharge request', at: h48.end, text: formatDeadline(r, h48.endWall, 'the request') });
    deadlines.push({ label: 'The end of the next working day after the request', at: iso(nwd), text: `the end of ${longDate(nwd)}` });
    band = workdayLater
      ? `Without a temporary or final court order, the patient is discharged by the end of ${longDate(nwd)}, the next working day after the request, which is later than 48 hours (${formatDeadline(r, h48.endWall, 'the request')}).`
      : `Without a temporary or final court order, the patient is discharged by ${formatDeadline(r, h48.endWall, 'the request')}, which is later than the end of the next working day (${longDate(nwd)}).`;
    return finish({ band, deadlines, checks, caveats, abnormal: false, mode: o.mode });
  }

  // Screening route.
  if (isBlank(o.start)) return { valid: false, message: 'Enter the time the screening certificate was completed. The 72 hours start there, not at arrival, and without it no deadline is printed.' };
  const s = parseDateTime(o.start);
  if (s === null) return { valid: false, message: 'Enter the screening certificate time as a date and time.' };
  const h72 = addHours(s, 72);
  caveats.push(...h72.caveats);
  deadlines.push({ label: 'Temporary commitment order obtained, or the person discharged (72 hours from the screening certificate)', at: h72.end, text: formatDeadline(s, h72.endWall, 'the screening certificate') });
  band = `A temporary commitment order must be obtained by ${formatDeadline(s, h72.endWall, 'the screening certificate')}, or the person discharged. The 72 hours run from the screening certificate, not from arrival.`;

  if (!isBlank(o.committed)) {
    const c = parseDate(o.committed);
    if (c === null) return { valid: false, message: 'Enter the date of initial commitment as a date, or leave it blank.' };
    const d20 = c + 20 * DAY;
    const d34 = c + 34 * DAY;
    deadlines.push({ label: 'Final hearing within 20 days of initial commitment (27.12)', at: iso(d20), text: `by ${longDate(d20)}` });
    deadlines.push({ label: 'Latest with an adjournment for exceptional circumstances (R. 4:74-7(c)(1))', at: iso(d34), text: `by ${longDate(d34)}` });
  }

  // The certificate checks: three-state, because an unanswered item is not a "yes".
  const psych = o.psychiatrist;
  if (psych === 'no') { checks.push('Neither certificate is by a psychiatrist: at least one must be (27.10(b)).'); abnormal = true; }
  else if (psych === 'yes') checks.push('At least one certificate is by a psychiatrist.');
  else checks.push('Not assessed: whether at least one certificate is by a psychiatrist, which 27.10(b) requires.');
  const rel = o.relative;
  if (rel === 'yes') { checks.push('A certifier is a relative by blood or marriage: no certificate may be executed by one.'); abnormal = true; }
  else if (rel === 'no') checks.push('No certifier is a relative by blood or marriage.');
  else checks.push('Not assessed: whether any certifier is a relative by blood or marriage, which disqualifies them.');

  return finish({ band, deadlines, checks, caveats, abnormal, mode: o.mode });
}

function finish(r) {
  return {
    valid: true,
    mode: r.mode,
    abnormal: r.abnormal,
    bandLabel: `${r.deadlines[0].label.split(' (')[0]}: ${r.deadlines[0].text}`,
    band: r.band,
    deadlines: r.deadlines,
    checks: r.checks,
    caveats: r.caveats,
    continuedHoldNote: 'The 30:4-27.9a continued hold (up to 72 more hours on a general hospital\'s emergent application) is not offered: Directive #06-25 extended the application window to August 31, 2026, and no further extension has been found.',
    postureNote: scopeSentence(NJ_CC_VERIFIED),
    note: NJ_CC_NOTE,
  };
}
