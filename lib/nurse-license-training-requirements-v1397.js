// spec-v1397: what mandated training a nurse's license needs, and by when. New York first.
//
// Sources: NYSED Office of the Professions (op.nysed.gov), read 2026-09-18.
//   Child abuse identification and reporting. A one-time two-hour course, required since 1989 for
//   registered nurses and nurse practitioners (LPNs are not on NYSED's list). Chapter 25 of the Laws
//   of 2024 added identifying abuse of children with intellectual or developmental disabilities;
//   every mandated reporter completes the UPDATED curriculum by November 17, 2026. Approved
//   providers began offering it September 1, 2025. Those trained between November 1, 2022 and
//   August 31, 2025 may instead complete a 15-minute addendum. An exemption is available to those
//   with no professional contact with people under 18 (or the listed residential populations).
//   Infection control and barrier precautions (Education Law 6505-b): registered nurses and licensed
//   practical nurses, every four years. A licensee not practicing in New York need not complete it
//   now, and has 90 days after resuming practice. A nurse practitioner holds an RN license and meets
//   it through that license.
//
// New Jersey, California, and Texas are added only after their rules are read at the source; the
// picker offers New York alone until then (spec-v1388 s.1).
//
// THE DEADLINE: the updated child-abuse curriculum is due November 17, 2026. This tile's ledger row
// is reviewed on November 18, 2026, when "due by" becomes "was due by".
//
// Pure: no DOM, no clock, no network.

import { stateOptions, parseDate, scopeSentence } from './state-calendar.js';

export const NLT_VERIFIED = '2026-09-18';
export const NLT_STATES = stateOptions(['NY']);
export const LICENSES = [
  { value: 'RN', text: 'Registered nurse (RN)' },
  { value: 'NP', text: 'Nurse practitioner (NP)' },
  { value: 'LPN', text: 'Licensed practical nurse (LPN)' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const DEADLINE = '2026-11-17';
const ADDENDUM_FROM = '2022-11-01';
const ADDENDUM_TO = '2025-08-31';
const UPDATED_FROM = '2025-09-01';

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function addYears(t, n) {
  const d = new Date(t);
  const y = d.getUTCFullYear() + n;
  const last = new Date(Date.UTC(y, d.getUTCMonth() + 1, 0)).getUTCDate();
  return Date.UTC(y, d.getUTCMonth(), Math.min(d.getUTCDate(), last));
}
function iso(t) { return new Date(t).toISOString().slice(0, 10); }

function childAbuse(o) {
  if (o.license === 'LPN') {
    return { item: 'Child abuse identification and reporting', status: 'not-listed', text: 'NYSED does not list licensed practical nurses among the professions that must take this course.' };
  }
  if (o.abuseExempt === 'yes') {
    return { item: 'Child abuse identification and reporting', status: 'exempt', text: 'Exempt: no professional contact with people under 18 or the listed residential populations. The exemption is claimed with NYSED.' };
  }
  if (isBlank(o.abuseDate)) {
    return { item: 'Child abuse identification and reporting', status: 'due', due: DEADLINE, text: 'No completion date entered: the updated two-hour course is due by November 17, 2026.' };
  }
  const d = parseDate(o.abuseDate);
  if (d === null) return { error: 'Enter the date the child-abuse course was completed as a date, or leave it blank.' };
  const day = iso(d);
  if (day >= UPDATED_FROM) {
    return { item: 'Child abuse identification and reporting', status: 'met', text: `Completed ${day}, after approved providers began the updated curriculum on September 1, 2025: met, if that course was the updated one.` };
  }
  if (day >= ADDENDUM_FROM && day <= ADDENDUM_TO) {
    return { item: 'Child abuse identification and reporting', status: 'due', due: DEADLINE, text: `Completed ${day}, between November 1, 2022 and August 31, 2025: the 15-minute addendum (or the full updated course) is due by November 17, 2026.` };
  }
  return { item: 'Child abuse identification and reporting', status: 'due', due: DEADLINE, text: `Completed ${day}, before November 1, 2022: the updated two-hour course is due by November 17, 2026.` };
}

function infectionControl(o) {
  if (o.practicingNY === 'no') {
    return { item: 'Infection control and barrier precautions', status: 'deferred', text: 'Not practicing in New York: not required now. It is due within 90 days of resuming practice there.' };
  }
  if (isBlank(o.infectionDate)) {
    return { item: 'Infection control and barrier precautions', status: 'due', text: 'No completion date entered: the course is required every four years for registered nurses and licensed practical nurses.' };
  }
  const d = parseDate(o.infectionDate);
  if (d === null) return { error: 'Enter the date the infection-control course was completed as a date, or leave it blank.' };
  const next = iso(addYears(d, 4));
  const via = o.license === 'NP' ? ' (a nurse practitioner meets it through the RN license)' : '';
  return { item: 'Infection control and barrier precautions', status: 'due', due: next, text: `Completed ${iso(d)}: the next course is due by ${next}, every four years${via}.` };
}

export function nurseLicenseTrainingRequirements(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.state) || !NLT_STATES.some((s) => s.value === o.state)) {
    return { valid: false, message: 'Choose the state. New York is offered now; New Jersey, California, and Texas follow once their rules are read at the source.' };
  }
  if (isBlank(o.license) || !LICENSES.some((l) => l.value === o.license)) return { valid: false, message: 'Choose the license: RN, NP, or LPN.' };
  if (isBlank(o.practicingNY) || !['yes', 'no'].includes(o.practicingNY)) return { valid: false, message: 'Say whether you practice in New York. Infection control is deferred for a licensee who does not.' };

  const items = [childAbuse(o), infectionControl(o)];
  const err = items.find((i) => i.error);
  if (err) return { valid: false, message: err.error };

  const abuse = items[0];
  const band = `${abuse.text} ${items[1].text}`;
  return {
    valid: true,
    state: o.state,
    items,
    abnormal: items.some((i) => i.status === 'due'),
    bandLabel: abuse.status === 'due' ? 'Child-abuse update due by November 17, 2026' : (abuse.status === 'met' ? 'Child-abuse update met' : 'Child-abuse update not required'),
    band,
    postureNote: scopeSentence(NLT_VERIFIED),
    note: 'NYSED Office of the Professions: the one-time child abuse identification course (updated by Chapter 25, Laws of 2024, due November 17, 2026) and infection control every four years (Education Law 6505-b).',
  };
}
