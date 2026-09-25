// spec-v1397: the California nurse practitioner 103 / 104 transition tracker.
//
// Sources: Cal. Business & Professions Code 2837.103 and 2837.104 (leginfo text read 2026-09-18).
//   2837.103(a)(1)  A "103" NP practices without standardized procedures in a listed group setting
//                   (clinic, health facility, medical group, and others in which physicians practice
//                   with the NP) after passing the national board examination, holding national
//                   certification, documenting board-standard education with clinical hours, and
//                   completing "a transition to practice in California of a minimum of three
//                   full-time equivalent years of practice or 4600 hours". Three FTE years or 4,600
//                   hours of direct patient care as an NP within the last five years may be deemed to
//                   satisfy it.
//   2837.104(b)     A "104" NP practices outside those settings after meeting all of 103(a)(1),
//                   holding an active California RN license and a master's or doctoral degree in
//                   nursing (or a clinical field related to nursing), and having "practiced as a nurse
//                   practitioner in good standing for at least three years, not inclusive of the
//                   transition to practice". The board may lower the three years for a DNP.
//
// THE CORRECTION: the three years for 104 are NP practice outside the transition to practice -- not
// three years "as a 103 NP".
//
// Pure: no DOM, no clock, no network. Dates are entered; "as of" is the date the reader enters.

import { parseDate, scopeSentence } from './state-calendar.js';

export const CANP_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
const HOURS_103 = 4600;

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

export function caNp103104Tracker(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.asOf)) return { valid: false, message: 'Enter the date to check against (today, or the date you are planning for).' };
  const asOf = parseDate(o.asOf);
  if (asOf === null) return { valid: false, message: 'Enter the check date as a date.' };
  if (isBlank(o.ttpStart) && isBlank(o.ttpHours)) {
    return { valid: false, message: 'Enter when the full-time transition to practice began, or the hours completed so far. The 103 requirement is three full-time years or 4,600 hours.' };
  }

  // 103: transition to practice.
  let ttpDone = null;
  let ttpText;
  if (!isBlank(o.ttpHours)) {
    const h = Number(String(o.ttpHours).trim());
    if (!Number.isFinite(h) || h < 0 || h > 50000) return { valid: false, message: 'Enter the transition-to-practice hours, from 0 to 50,000.' };
    if (h >= HOURS_103) {
      ttpDone = asOf;
      ttpText = `${h.toLocaleString('en-US')} hours: the 4,600-hour transition to practice is complete.`;
    } else {
      ttpText = `${h.toLocaleString('en-US')} hours: ${(HOURS_103 - h).toLocaleString('en-US')} more to reach 4,600 (or three full-time years).`;
    }
  }
  if (ttpDone === null && !isBlank(o.ttpStart)) {
    const s = parseDate(o.ttpStart);
    if (s === null) return { valid: false, message: 'Enter the transition-to-practice start date as a date, or leave it blank.' };
    const done = addYears(s, 3);
    ttpDone = done;
    ttpText = done <= asOf
      ? `Full-time since ${iso(s)}: three full-time years were reached on ${iso(done)}.`
      : `Full-time since ${iso(s)}: three full-time years are reached on ${iso(done)}, if practice stays full-time.`;
  }
  const ttpComplete = ttpDone !== null && ttpDone <= asOf;

  const reqs = [
    ['boardExam', 'passed the national NP board certification examination'],
    ['nationalCert', 'national NP certification from a recognized accredited body'],
    ['education', 'education meeting the board\'s standards, including clinical practice hours'],
  ];
  const missing103 = reqs.filter(([k]) => o[k] === 'no').map(([, t]) => t);
  const unassessed103 = reqs.filter(([k]) => o[k] !== 'yes' && o[k] !== 'no').map(([, t]) => t);

  let status103;
  if (missing103.length) status103 = { status: 'not-eligible', text: `Not yet eligible for 103: missing ${missing103.join('; ')}.` };
  else if (!ttpComplete) status103 = { status: 'pending', text: `103 when the transition to practice is complete. ${ttpText}` };
  else if (unassessed103.length) status103 = { status: 'unassessed', text: `Transition to practice complete; still to confirm: ${unassessed103.join('; ')}.` };
  else status103 = { status: 'eligible', text: `Eligible to apply for 103 status. ${ttpText}` };

  // 104: three years of NP practice in good standing, not counting the transition to practice.
  let status104;
  const extra104 = [];
  if (o.rnActive === 'no') extra104.push('an active California RN license');
  if (o.degree === 'no') extra104.push('a master\'s or doctoral degree in nursing or a related clinical field');
  const unassessed104 = [];
  if (o.rnActive !== 'yes' && o.rnActive !== 'no') unassessed104.push('an active California RN license');
  if (o.degree !== 'yes' && o.degree !== 'no') unassessed104.push('the qualifying degree');
  if (status103.status === 'not-eligible') {
    status104 = { status: 'not-eligible', text: '104 needs every 103 requirement first.' };
  } else if (!ttpComplete) {
    const reach = ttpDone !== null ? iso(addYears(ttpDone, 3)) : null;
    status104 = { status: 'pending', text: reach ? `104 after three more years of NP practice in good standing past the transition to practice: about ${reach} if practice continues.` : '104 after the transition to practice plus three more years of NP practice in good standing.' };
  } else {
    const post = isBlank(o.postTtpYears) ? null : Number(String(o.postTtpYears).trim());
    if (post !== null && (!Number.isFinite(post) || post < 0 || post > 60)) return { valid: false, message: 'Enter the years of NP practice after the transition to practice, from 0 to 60.' };
    const years = post !== null ? post : (asOf - ttpDone) / (365.25 * 86400000);
    if (extra104.length) status104 = { status: 'not-eligible', text: `Not yet eligible for 104: missing ${extra104.join(' and ')}.` };
    else if (years < 3) status104 = { status: 'pending', text: `About ${Math.floor(years * 10) / 10} of the 3 years of NP practice past the transition to practice (the board may lower this for a DNP); 104 about ${iso(addYears(ttpDone, 3))}.` };
    else if (unassessed104.length) status104 = { status: 'unassessed', text: `Three years past the transition to practice; still to confirm: ${unassessed104.join(' and ')}.` };
    else status104 = { status: 'eligible', text: 'Eligible to apply for 104 status: three years of NP practice in good standing past the transition to practice.' };
  }

  // spec-v1467: a projected 104 date assumes the RN license and the degree; when either was not
  // entered, the projection says so instead of reading the blank as a yes.
  if (status104.status === 'pending' && unassessed104.length) {
    status104 = { ...status104, text: `${status104.text} This date assumes ${unassessed104.join(' and ')}, which ${unassessed104.length === 1 ? 'was' : 'were'} not entered.` };
  }

  return {
    valid: true,
    status103: status103.status,
    status104: status104.status,
    abnormal: false,
    bandLabel: `103: ${status103.status}; 104: ${status104.status}`,
    band: `${status103.text} ${status104.text}`,
    items: [status103.text, status104.text],
    postureNote: scopeSentence(CANP_VERIFIED),
    note: 'Cal. Business & Professions Code 2837.103 (103: group settings without standardized procedures, after three full-time years or 4,600 hours of transition to practice) and 2837.104 (104: outside those settings, after three more years of NP practice in good standing, not counting the transition to practice).',
  };
}
