// spec-v1397: the Texas prescriptive authority agreement checker.
//
// Source: Tex. Occupations Code 157.0512 (texas.public.law text read 2026-09-18).
//   (c)  A physician may not be party to agreements with more than seven APRNs and PAs, or their
//        full-time equivalent.
//   (d)  (c) does not apply in a practice serving a medically underserved population, or a
//        facility-based practice in a hospital.
//   (e)  The agreement must at a minimum: (1) be in writing, signed and dated; (2) state the parties'
//        names, addresses, and license numbers; (3) state the nature of the practice, locations, or
//        settings; (4) identify the drugs or devices that may, or may not, be prescribed; (5) give a
//        plan for consultation and referral; (6) give a plan for patient emergencies; (7) state the
//        process for communication and sharing information; (8) designate any alternate physicians;
//        (9) describe a quality assurance and improvement plan with chart review and periodic
//        meetings.
//   (f)  The meetings are documented and held "at least once a month". The first-year and later
//        cadence (former (f-1)) was repealed by Acts 2019, H.B. 278: it is monthly throughout.
//
// Pure: no DOM, no clock, no network.

import { parseDate, scopeSentence } from './state-calendar.js';

export const PAA_VERIFIED = '2026-09-18';
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const PAA_ELEMENTS = [
  { key: 'signed', text: 'In writing, signed and dated by the parties' },
  { key: 'parties', text: 'Names, addresses, and all license numbers of the parties' },
  { key: 'practice', text: 'Nature of the practice, practice locations, or settings' },
  { key: 'drugs', text: 'Drugs or devices that may, or may not, be prescribed' },
  { key: 'referral', text: 'General plan for consultation and referral' },
  { key: 'emergencies', text: 'Plan for patient emergencies' },
  { key: 'communication', text: 'Process for communication and sharing information' },
  { key: 'alternates', text: 'Alternate physicians, if alternate supervision is used' },
  { key: 'qaPlan', text: 'Quality assurance plan with chart review and periodic meetings' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function iso(t) { return new Date(t).toISOString().slice(0, 10); }
function addMonths(t, n) {
  const d = new Date(t);
  const m = d.getUTCMonth() + n;
  const last = new Date(Date.UTC(d.getUTCFullYear(), m + 1, 0)).getUTCDate();
  return Date.UTC(d.getUTCFullYear(), m, Math.min(d.getUTCDate(), last));
}

export function txPrescriptiveAuthorityAgreement(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const fte = Number(String(o.fte ?? '').trim());
  if (isBlank(o.fte) || !Number.isFinite(fte) || fte < 0 || fte > 100) return { valid: false, message: 'Enter the number of APRNs and PAs under agreement with this physician, as full-time equivalents.' };
  if (isBlank(o.exempt) || !['yes', 'no'].includes(o.exempt)) return { valid: false, message: 'Say whether the practice serves a medically underserved population or is a hospital facility-based practice. Either lifts the seven-FTE cap.' };

  const problems = [];
  const notes = [];

  if (o.exempt === 'yes') notes.push(`${fte} FTE: the seven-FTE cap does not apply in a practice serving a medically underserved population or a hospital facility-based practice.`);
  else if (fte > 7) problems.push(`${fte} FTE is over the seven full-time-equivalent APRNs and PAs a physician may supervise under prescriptive authority agreements.`);
  else notes.push(`${fte} FTE is within the cap of seven.`);

  const missing = PAA_ELEMENTS.filter((e) => o[e.key] === 'no').map((e) => e.text);
  const unanswered = PAA_ELEMENTS.filter((e) => o[e.key] !== 'yes' && o[e.key] !== 'no').map((e) => e.text);
  if (missing.length) problems.push(`The agreement lacks ${missing.length} required element${missing.length === 1 ? '' : 's'}: ${missing.join('; ')}.`);

  let meeting = null;
  if (!isBlank(o.lastMeeting)) {
    const m = parseDate(o.lastMeeting);
    if (m === null) return { valid: false, message: 'Enter the last quality assurance meeting as a date, or leave it blank.' };
    meeting = `Last documented meeting ${iso(m)}: the next is due within the month, by ${iso(addMonths(m, 1))}.`;
    if (!isBlank(o.asOf)) {
      const a = parseDate(o.asOf);
      if (a === null) return { valid: false, message: 'Enter the check date as a date, or leave it blank.' };
      if (a > addMonths(m, 1)) problems.push(`No documented meeting since ${iso(m)}: meetings are held at least once a month.`);
    }
  }

  const verdict = problems.length ? 'problems' : (unanswered.length ? 'unassessed' : 'ok');
  const band = problems.length
    ? problems.join(' ')
    : (unanswered.length ? `${notes.join(' ')} Not yet checked: ${unanswered.length} required element${unanswered.length === 1 ? '' : 's'} unanswered.` : `${notes.join(' ')} All nine required elements are present.`);
  return {
    valid: true,
    verdict,
    abnormal: verdict !== 'ok',
    bandLabel: verdict === 'ok' ? 'Meets 157.0512' : (verdict === 'problems' ? 'Does not meet 157.0512' : 'Not fully checked'),
    band,
    missing,
    unanswered,
    meeting,
    meetingRule: 'Quality assurance meetings are documented and held at least once a month (157.0512(f)); the separate first-year cadence was repealed in 2019.',
    postureNote: scopeSentence(PAA_VERIFIED),
    note: 'Tex. Occupations Code 157.0512: at most seven full-time-equivalent APRNs and PAs per physician (not in underserved or hospital facility-based practice), nine required elements, and monthly documented quality assurance meetings.',
  };
}

