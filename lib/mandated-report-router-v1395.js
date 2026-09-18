// spec-v1395: a mandated report -- to whom, and how fast (NY, NJ, CA, TX).
//
// Sources (read 2026-09-18):
//   NY  Social Services Law 415: suspected child abuse or maltreatment reported "immediately by
//       telephone"; the oral report "followed by a report in writing within forty-eight hours".
//       Public Health Law 2803-d: abuse, mistreatment, or neglect of a nursing-home resident
//       reported to the Department of Health "immediately by telephone and in writing within
//       forty-eight hours".
//   NJ  N.J.S.A. 9:6-8.10: ANY person with reasonable cause reports child abuse "immediately", by
//       telephone or otherwise, to the Division of Child Protection and Permanency.
//       N.J.S.A. 52:27D-409: a health care professional reports abuse, neglect, or exploitation of a
//       vulnerable adult to the county adult protective services provider. The section sets NO time
//       limit; the tile says so rather than inventing one.
//   CA  Penal Code 11166: child abuse by telephone "immediately or as soon as is practicably
//       possible", written follow-up "within 36 hours". Welfare & Institutions Code 15630: elder or
//       dependent adult abuse by telephone or the internet tool immediately, written within two
//       working days; IN A LONG-TERM CARE FACILITY, a verbal report to local law enforcement within
//       TWO HOURS and written reports within 24 hours -- in every case except abuse by a resident
//       with physician-diagnosed dementia and no serious bodily injury, which needs written reports
//       to the ombudsman and law enforcement within 24 hours. Penal Code 11160: an injury from a
//       firearm or assaultive or abusive conduct, by telephone to law enforcement immediately and on
//       the standard form within two working days. That duty is California's alone.
//   TX  Family Code 261.101(b), as amended by S.B. 571 (2025): a professional reports child abuse or
//       neglect not later than the 24TH hour (it was the 48th) and may not delegate the report.
//       Human Resources Code 48.051: abuse, neglect, or exploitation of an elderly person or a
//       person with a disability reported immediately to the department, or, in a facility a state
//       agency operates, licenses, or certifies, to that agency.
//
// THE TRAPS: Texas halved its child-report deadline in 2025; California's long-term-care police
// report is two hours even WITHOUT serious bodily injury.
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { stateOptions, parseDateTime, addHours, formatDeadline, scopeSentence, nextBusinessDay } from './state-calendar.js';

export const MR_VERIFIED = '2026-09-18';
export const MR_STATES = stateOptions(['NY', 'NJ', 'CA', 'TX']);
export const VICTIMS = [
  { value: 'child', text: 'A child (under 18)' },
  { value: 'adult', text: 'An elder or dependent / vulnerable adult, in the community' },
  { value: 'ltc', text: 'A resident of a nursing home or long-term care facility' },
  { value: 'injury', text: 'An injury from a firearm or assaultive conduct (California)' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const DAY = 86400000;
function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
// The end of the second working day after the day the information was received.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function twoWorkingDays(state, wall) {
  const d1 = nextBusinessDay(state, Math.floor(wall / DAY) * DAY);
  const d2 = Date.parse(nextBusinessDay(state, Date.parse(d1 + 'T00:00:00Z')) + 'T00:00:00Z');
  const d = new Date(d2);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function route(o, t) {
  const st = o.state;
  const v = o.victim;
  const steps = [];
  let agency;
  let note = '';
  const at = (h, label) => {
    const e = addHours(t, h);
    return `${label} by ${formatDeadline(t, e.endWall, 'the suspicion')}.`;
  };
  if (st === 'NY') {
    if (v === 'child') { agency = 'the Statewide Central Register (child protective services)'; steps.push('Telephone immediately.', at(48, 'Written report to the local child protective service')); }
    else if (v === 'ltc') { agency = 'the New York State Department of Health'; steps.push('Telephone immediately.', at(48, 'Written report to the Department of Health')); }
    else return null;
  } else if (st === 'NJ') {
    if (v === 'child') { agency = 'the Division of Child Protection and Permanency (state hotline)'; steps.push('Report immediately, by telephone or otherwise. The duty applies to any person, not only professionals.'); }
    else if (v === 'adult') { agency = 'the county adult protective services provider'; steps.push('The section sets no time limit for the report.'); note = 'N.J.S.A. 52:27D-409 makes health care professionals report a vulnerable adult\'s abuse, neglect, or exploitation, and sets no deadline.'; }
    else if (v === 'ltc') return { none: 'New Jersey\'s route for a long-term care resident (the Long-Term Care Ombudsman) is not included yet; it is added once its statute is read. For a vulnerable adult in the community, use that route.' };
    else return null;
  } else if (st === 'CA') {
    if (v === 'child') { agency = 'the county child welfare agency or law enforcement (Penal Code 11165.9)'; steps.push('Telephone immediately or as soon as practicably possible.', at(36, 'Written follow-up report')); }
    else if (v === 'adult') { agency = 'county adult protective services'; steps.push('Telephone, or the confidential internet tool, immediately or as soon as practicably possible.', `Written report within two working days: by the end of ${twoWorkingDays('CA', t)}.`); }
    else if (v === 'ltc') {
      if (o.dementiaResident === 'yes' && o.seriousInjury === 'no') {
        agency = 'the long-term care ombudsman and local law enforcement';
        steps.push(at(24, 'Written report to the ombudsman and local law enforcement'));
        note = 'Abuse by a resident with physician-diagnosed dementia and no serious bodily injury: written reports within 24 hours, no two-hour call.';
      } else if (isBlank(o.dementiaResident) || isBlank(o.seriousInjury)) {
        return { unanswered: 'Answer whether the abuse was by another resident with physician-diagnosed dementia, and whether there was serious bodily injury. Only that combination avoids the two-hour police report.' };
      } else {
        agency = 'local law enforcement, then the ombudsman and the state licensing agency';
        steps.push(at(2, 'Verbal report to local law enforcement'), at(24, 'Written report to the ombudsman, law enforcement, and the licensing agency'));
        note = 'In long-term care the two-hour police report applies with or without serious bodily injury, unless the abuser is a resident with diagnosed dementia and there is no serious bodily injury.';
      }
    } else if (v === 'injury') { agency = 'local law enforcement'; steps.push('Telephone immediately or as soon as practically possible.', `Written report on the standard form within two working days: by the end of ${twoWorkingDays('CA', t)}.`); note = 'Penal Code 11160 covers a wound from a firearm or an injury from assaultive or abusive conduct, including domestic violence. No other state in this tool has this duty.'; }
  } else if (st === 'TX') {
    if (v === 'child') {
      agency = 'the Department of Family and Protective Services (or law enforcement)';
      steps.push(at(24, 'Report (you may not delegate it to anyone else)'));
      note = 'Texas cut the professional\'s deadline from the 48th hour to the 24th (S.B. 571, 2025).';
    } else if (v === 'adult') { agency = 'the Department of Family and Protective Services (Adult Protective Services)'; steps.push('Report immediately.'); }
    else if (v === 'ltc') { agency = 'the state agency that licenses the facility (Health and Human Services Commission for a nursing facility)'; steps.push('Report immediately to the licensing agency.'); }
    else return null;
  }
  return { agency, steps, note };
}

export function mandatedReportRouter(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.state) || !MR_STATES.some((s) => s.value === o.state)) return { valid: false, message: 'Choose the state. Each routes mandated reports differently.' };
  if (isBlank(o.victim) || !VICTIMS.some((x) => x.value === o.victim)) return { valid: false, message: 'Choose who the report is about.' };
  if (isBlank(o.suspected)) return { valid: false, message: 'Enter when you first had reasonable cause to suspect. The deadlines run from that moment, and without it none is printed.' };
  const t = parseDateTime(o.suspected);
  if (t === null) return { valid: false, message: 'Enter the time of the suspicion as a date and time.' };

  const r = route(o, t);
  if (r && r.none) {
    return { valid: true, applies: false, abnormal: false, bandLabel: 'Not included yet', band: r.none, steps: [], note: null, postureNote: scopeSentence(MR_VERIFIED) };
  }
  if (r === null) {
    const why = o.victim === 'injury'
      ? 'The duty to report injuries from firearms or assaultive conduct is California\'s alone among these four states.'
      : 'No mandated-report rule for this case is in the sections this tool reads for this state. Follow your facility\'s policy, and use the child or long-term care route if one fits.';
    return { valid: true, applies: false, abnormal: false, bandLabel: 'No separate rule', band: why, steps: [], note: null, postureNote: scopeSentence(MR_VERIFIED) };
  }
  if (r.unanswered) return { valid: false, message: r.unanswered };
  return {
    valid: true,
    applies: true,
    agency: r.agency,
    abnormal: true,
    bandLabel: `Report to ${r.agency}`,
    band: `Report to ${r.agency}. ${r.steps.join(' ')}`,
    steps: r.steps,
    note: r.note || null,
    postureNote: scopeSentence(MR_VERIFIED),
  };
}
