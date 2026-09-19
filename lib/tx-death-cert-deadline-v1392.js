// spec-v1392: Texas medical certification of death -- the five-day deadline and who may certify,
// Health & Safety Code 193.005.
//
// Source: official mirror tcss.legis.texas.gov, HSC ch. 193, read 2026-09-18.
//   (a) The medical certification comes from the decedent's attending physician, or a physician
//     assistant or APRN of the decedent, if the death occurred under that person's care for the
//     condition that contributed to it.
//   (b) They complete it "not later than five days after receiving the death certificate".
//   (c) An associate physician, the institution's chief medical officer, or the physician who
//     performed an autopsy may complete it if (1) the attending, PA, and APRN are unavailable, (2)
//     one of them approves, and (3) the person completing it has the medical history and the death
//     is from natural causes.
//   (e) A person conducting an inquest also has five days.
//   (g) If it cannot be completed in time, the certifier tells the funeral director why; the body
//     may not be finally disposed of without the certifier's authorization.
//
// Pure: no DOM, no clock, no network. Dates 'YYYY-MM-DD'.

import { parseDate, scopeSentence } from './state-calendar.js';

export const DC_VERIFIED = '2026-09-18';
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

export function txDeathCertDeadline(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.received)) return { valid: false, message: 'Enter the date the death certificate was received for medical certification. The five days run from it.' };
  const r = parseDate(o.received);
  if (r === null) return { valid: false, message: 'Enter the date received as a date.' };
  const due = r + 5 * DAY;
  const avail = o.attendingAvailable === 'yes' || o.attendingAvailable === 'no' ? o.attendingAvailable : null;
  let who;
  if (avail === 'no') who = 'With the attending physician, PA, and APRN unavailable, an associate physician, the chief medical officer, or the autopsy physician may certify, if one of them approves, the certifier has the medical history, and the death is from natural causes (193.005(c)).';
  else if (avail === 'yes') who = 'The attending physician, or the PA or APRN under whose care the death occurred, certifies (193.005(a)).';
  else who = 'The attending physician, PA, or APRN under whose care the death occurred certifies; if all are unavailable, 193.005(c) names who else may.';
  return {
    valid: true,
    dueDate: new Date(due).toISOString().slice(0, 10),
    abnormal: false,
    bandLabel: `Certify by ${day(due)}`,
    band: `Complete the medical certification by ${day(due)}, five days after receiving the death certificate on ${day(r)} (193.005(b)).`,
    who,
    delayNote: 'If it cannot be done in time, tell the funeral director why. The body may not be finally disposed of without the certifier\'s authorization (193.005(g)). A death without medical attendance goes to the inquest authority, which also has five days.',
    postureNote: scopeSentence(DC_VERIFIED),
  };
}
