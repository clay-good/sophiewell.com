// spec-v1637 tool 14: which federal authority covers a controlled-substance prescription issued by
// telemedicine without an in-person evaluation by the prescriber.
//
// Source: 21 CFR 1306.51, 1306.52 and 1307.41, read on eCFR as current October 8, 2026 (re-read
// October 12, 2026).
//   1306.51(b)  Schedule III to V products FDA-approved for opioid use disorder, by an interactive
//     telecommunications system including audio-only. (b)(2) "for a period not to exceed six
//     calendar months beginning on the date the first prescription is issued"; more only after an
//     in-person evaluation or as otherwise authorized by 21 U.S.C. 829(e). (b)(1) PDMP review
//     before prescribing. (b)(3) PDMP unavailable: "a seven-day supply", another review before the
//     next, and each "counts toward the time limit". (b)(4) "The pharmacist shall verify the
//     identity of the patient prior to filling".
//   1306.52  a Department of Veterans Affairs employee or contractor prescribing to a VA patient
//     "who has previously received, at any time, an in-person medical evaluation by any VA
//     practitioner"; if the VA record or the state PDMP is unavailable, "the VA practitioner must
//     limit the prescription to a 7-day supply". No time limit is stated.
//   1307.41  "This section is in effect until the end of the day December 31, 2026." "During the
//     period May 12, 2023, through December 31, 2026, a DEA-registered practitioner is authorized
//     to prescribe schedule II-V controlled substances via telemedicine ... without having
//     conducted an in-person medical evaluation". Extended four times, last at 90 FR 61306.
//
// DATED RULE. For a prescription dated after December 31, 2026 the tool does not answer under
// 1307.41: it says the section it read had expired by then and asks for the rule in force.
// "Six calendar months beginning on" a date is read to end the day before the same date six
// months later, the stricter reading, and the result says so.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc, addMonthsUtc } from './deadline.js';

const opt = (value, text) => ({ value, text });
export const SCHEDULES = [opt('schedule-2', 'Schedule II'), opt('schedule-3-to-5', 'Schedule III, IV or V')];
export const PURPOSES = [opt('oud-labeled-product', 'Opioid use disorder, with a product FDA-approved for it (such as buprenorphine)'), opt('any-other-purpose', 'Anything else')];
export const IN_PERSON = [opt('no-inperson-evaluation', 'The prescriber has not evaluated the patient in person'), opt('inperson-evaluation-done', 'The prescriber has evaluated the patient in person')];
export const PDMP = [opt('pdmp-reviewed', 'The state drug-monitoring database was reviewed'), opt('pdmp-unavailable', 'It could not be reviewed')];
export const VA = [opt('not-a-va-prescriber', 'Not a Department of Veterans Affairs prescriber'), opt('va-prescriber-with-va-patient-evaluated', 'A VA prescriber, and the VA patient has had an in-person evaluation by any VA practitioner')];
const TEMP_FROM = Date.UTC(2023, 4, 12); const TEMP_THROUGH = Date.UTC(2026, 11, 31);
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function oudTelemedicineRxWindow(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const need = (list, v, msg) => list.find((x) => x.value === String(v ?? '').trim()) || { fault: msg };
  const rx = date(o.prescribedOn);
  if (!rx) return { valid: false, message: 'Enter the date of the prescription.' };
  const seen = need(IN_PERSON, o.inPerson, 'Choose whether the prescriber has evaluated the patient in person: with one, none of these telemedicine rules is needed.');
  if (seen.fault) return { valid: false, message: seen.fault };
  if (seen.value === 'inperson-evaluation-done') {
    const notes = ['The prescriber has conducted an in-person medical evaluation, so the prescription does not depend on 21 CFR 1306.51, 1306.52 or 1307.41. Those sections are for prescribing without one. The other requirements of part 1306 still apply.'];
    return { valid: true, flag: 'inperson-evaluation-done', covered: true, authorities: [], band: 'No telemedicine exception is needed: the prescriber has evaluated the patient in person.', bandLabel: 'In-person evaluation done', notes, note: notes.join(' ') };
  }
  const schedule = need(SCHEDULES, o.schedule, 'Choose the schedule.');
  if (schedule.fault) return { valid: false, message: schedule.fault };
  const purpose = need(PURPOSES, o.purpose, 'Choose whether the prescription treats opioid use disorder with an FDA-approved product.');
  if (purpose.fault) return { valid: false, message: purpose.fault };
  const va = need(VA, o.va, 'Choose whether this is a Department of Veterans Affairs prescriber and patient.');
  if (va.fault) return { valid: false, message: va.fault };
  const oud = purpose.value === 'oud-labeled-product' && schedule.value === 'schedule-3-to-5';
  let pdmp = null;
  if (oud || va.value !== 'not-a-va-prescriber') {
    pdmp = need(PDMP, o.pdmp, 'Choose whether the state drug-monitoring database could be reviewed: if not, the supply is limited to seven days.');
    if (pdmp.fault) return { valid: false, message: pdmp.fault };
  }
  const first = blank(o.firstTelemedicineRx) ? null : date(o.firstTelemedicineRx);
  if (!blank(o.firstTelemedicineRx) && !first) return { valid: false, message: 'Enter the date of the first telemedicine prescription to this patient as a real date, or leave it blank.' };
  if (first && first.getTime() > rx.getTime()) return { valid: false, message: 'Enter a first telemedicine prescription date that is not after this prescription.' };

  const notes = []; const authorities = []; const out = { valid: true };
  if (oud) {
    const start = first || rx;
    const last = addCalendarDaysUtc(addMonthsUtc(start, 6), -1);
    out.oudWindowEnds = fmtUtc(last);
    const inside = rx.getTime() <= last.getTime();
    if (inside) authorities.push('21 CFR 1306.51');
    notes.push(`Opioid use disorder, Schedule III to V (21 CFR 1306.51): prescriptions may be issued for a period not to exceed six calendar months beginning on the date the first prescription is issued. ${first ? `The first was ${say(first)}` : 'No earlier date was entered, so this prescription is taken as the first'}; six calendar months beginning that day end ${say(last)}, reading the period to end the day before the same date six months later. This prescription is ${inside ? 'inside' : 'after'} it.${inside ? '' : ' After the six months, more prescriptions need an in-person evaluation or another lawful telemedicine route (1306.51(b)(2)).'}`);
    if (inside) {
      notes.push(pdmp.value === 'pdmp-unavailable' ? 'The drug-monitoring database could not be reviewed: the prescriber may prescribe a seven-day supply, must attempt another review before the next seven-day supply, and records each attempt; those days count toward the six months (1306.51(b)(3)).' : 'The prescriber reviews the drug-monitoring database before prescribing and records the date and time of the review (1306.51(b)(1)).');
      notes.push('The pharmacist verifies the patient\'s identity before filling, with a state or federal photographic identification card or other form of identification (1306.51(b)(4)).');
    }
  } else if (purpose.value === 'oud-labeled-product') notes.push('21 CFR 1306.51 covers Schedule III to V products approved for opioid use disorder; it does not cover a Schedule II drug.');
  if (va.value !== 'not-a-va-prescriber') {
    authorities.push('21 CFR 1306.52');
    notes.push(`Department of Veterans Affairs (21 CFR 1306.52): a VA employee or contractor may prescribe by telemedicine to a VA patient who has at any time had an in-person medical evaluation by any VA practitioner. No time limit is stated. ${pdmp.value === 'pdmp-unavailable' ? 'With the VA record or the state database unavailable, the prescription is limited to a 7-day supply until the review can be done (1306.52(b)(1)); where the state has no such program, the VA database review is enough and the supply may run longer (1306.52(b)(2)).' : 'The prescriber reviews the VA record and the state drug-monitoring database first (1306.52(b)).'}`);
  }
  const t = rx.getTime();
  if (t >= TEMP_FROM && t <= TEMP_THROUGH) {
    authorities.push('21 CFR 1307.41');
    notes.push('Temporary rule (21 CFR 1307.41): from May 12, 2023 through December 31, 2026 a DEA-registered practitioner may prescribe Schedule II to V controlled substances by telemedicine without an in-person evaluation, for a legitimate medical purpose, by an interactive telecommunications system, within the practitioner\'s registration, and consistent with part 1306. The section expires at the end of December 31, 2026.');
  } else if (t > TEMP_THROUGH) {
    notes.push(`Temporary rule (21 CFR 1307.41): as read on October 12, 2026 it expires at the end of December 31, 2026, before this prescription's date of ${say(rx)}. It has been extended four times; this tool does not know whether it was extended again. Check the rule in force on that date before relying on it.`);
    out.temporaryRuleExpiredAsRead = true;
  } else notes.push('Temporary rule (21 CFR 1307.41): it begins May 12, 2023, after this prescription\'s date.');
  notes.push('State law can be stricter than each of these.');
  const covered = authorities.length > 0;
  return { ...out, covered, authorities, flag: covered ? 'covered' : out.temporaryRuleExpiredAsRead ? 'check-the-rule-in-force' : 'no-authority-found', abnormal: !covered,
    band: covered ? `Covered on ${say(rx)} by ${authorities.join(' and ')}.` : `No authority read here covers a telemedicine prescription dated ${say(rx)} without an in-person evaluation.`,
    bandLabel: covered ? `${authorities.length} authorit${authorities.length === 1 ? 'y' : 'ies'}` : out.temporaryRuleExpiredAsRead ? 'Check the rule in force' : 'Not covered', notes, note: notes.join(' ') };
}
