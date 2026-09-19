// spec-v1396: California hospital workplace violence report to Cal/OSHA -- is it reportable, and by
// when? 8 CCR 3342(g), with the incident type from 3342(b).
//
// Source: Cal/OSHA Title 8 section 3342 (dir.ca.gov, read 2026-09-18).
//   (g)(1) General acute care, acute psychiatric, and special hospitals report to the Division any
//     incident involving (A) physical force against an employee by a patient or a person accompanying
//     a patient that results in, or has a high likelihood of resulting in, injury, psychological
//     trauma, or stress, whether or not the employee is injured; or (B) the use of a firearm or other
//     dangerous weapon, whether or not anyone is injured.
//   (g)(2) Within 24 hours after the employer knows or with diligent inquiry would have known, if the
//     incident results in injury -- a fatality, inpatient hospitalization over 24 hours other than for
//     observation, loss of any member, or serious permanent disfigurement -- involves a firearm or other
//     dangerous weapon, or presents an urgent or emergent threat (a realistic possibility of death or
//     serious physical harm). (g)(3) All other reports within 72 hours.
//   Section 342 (immediate report of a serious injury, illness, or death) still applies separately.
//   (b) Type 1: no legitimate business at the site; Type 2: patients, visitors, or others with a
//     patient; Type 3: a present or former employee, supervisor, or manager; Type 4: someone with a
//     personal relationship to an employee.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { parseDateTime, addHours, formatDeadline, scopeSentence } from './state-calendar.js';

export const WPV_VERIFIED = '2026-09-18';
export const PERPETRATORS = [
  { value: 'patient', text: 'A patient, or someone accompanying a patient', type: 'Type 2' },
  { value: 'visitor', text: 'Another visitor or client', type: 'Type 2' },
  { value: 'coworker', text: 'A present or former employee, supervisor, or manager', type: 'Type 3' },
  { value: 'stranger', text: 'Someone with no legitimate business at the site', type: 'Type 1' },
  { value: 'personal', text: 'Someone with a personal relationship to the employee', type: 'Type 4' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function caWpvReportClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const who = PERPETRATORS.find((p) => p.value === o.perpetrator);
  if (!who) return { valid: false, message: 'Choose who committed the violence. It sets the incident type and whether (g)(1)(A) applies.' };
  for (const [k, what] of [['force', 'whether physical force was used against an employee'], ['weapon', 'whether a firearm or other dangerous weapon was involved'], ['severe', 'whether there was a death, an admission over 24 hours, a lost member, or serious permanent disfigurement'], ['urgent', 'whether there was a realistic possibility of death or serious physical harm']]) {
    if (o[k] !== 'yes' && o[k] !== 'no') return { valid: false, message: `Answer ${what}.` };
  }
  if (isBlank(o.knownAt)) return { valid: false, message: 'Enter when the hospital knew, or with diligent inquiry would have known, of the incident. The deadline runs from then.' };
  const t = parseDateTime(o.knownAt);
  if (t === null) return { valid: false, message: 'Enter that time as a date and time.' };

  const byPatient = who.value === 'patient' && o.force === 'yes';
  const weapon = o.weapon === 'yes';
  const typeNote = `${who.type} workplace violence (3342(b)).`;
  if (!byPatient && !weapon) {
    return {
      valid: true, reportable: false, abnormal: false,
      bandLabel: 'Not a 3342(g) report',
      band: 'Section 3342(g) requires a report for physical force by a patient or someone with a patient, or for any firearm or dangerous weapon. Neither is entered, so no (g) report is due. A serious injury, illness, or death is still reported immediately under section 342.',
      typeNote,
    };
  }
  const fast = o.severe === 'yes' || weapon || o.urgent === 'yes';
  const due = addHours(t, fast ? 24 : 72);
  const why = [o.severe === 'yes' && 'a qualifying injury', weapon && 'a firearm or dangerous weapon', o.urgent === 'yes' && 'an urgent or emergent threat'].filter(Boolean);
  return {
    valid: true,
    reportable: true,
    dueAt: due.end,
    abnormal: true,
    bandLabel: `Report to Cal/OSHA within ${fast ? 24 : 72} hours`,
    band: `Report to Cal/OSHA by ${formatDeadline(t, due.endWall, 'the hospital knew')}${fast ? `, the 24-hour deadline because of ${why.join(' and ')} (3342(g)(2))` : ', the 72-hour deadline for other reportable incidents (3342(g)(3))'}.`,
    typeNote,
    injuryNote: 'Injury for the 24-hour rule means a death, an inpatient stay over 24 hours other than for observation, the loss of any member, or serious permanent disfigurement. A serious injury, illness, or death is also reported immediately under section 342.',
    caveats: due.caveats,
    postureNote: scopeSentence(WPV_VERIFIED),
  };
}
