// spec-v1389: the California 72-hour hold for a minor.
//
// Source: Cal. Welfare & Institutions Code 5585.50 (leginfo text read 2026-09-18). A minor who, as
// a result of mental disorder, is a danger to others or to self, or gravely disabled, when
// authorization for voluntary treatment is not available, may be placed in a county-designated
// facility "for 72-hour treatment and evaluation of minors." "The facility shall make every effort
// to notify the minor's parent or legal guardian as soon as possible after the minor is detained."
//
// The minor's hold is its own section. The tile refuses 18 and over and points to the adult 5150.
// The parent notice has no fixed number of hours, so the tile does not invent one: it asks whether
// the notice has been made and when, and says "as soon as possible".
//
// Pure: no DOM, no clock, no network. Times are local wall-clock 'YYYY-MM-DDTHH:MM'.

import { parseDateTime, addHours, elapsedHours, formatDeadline, scopeSentence } from './state-calendar.js';
import { CRITERIA } from './ca-5150-hold-timeline-v1389.js';

export const CA5585_VERIFIED = '2026-09-18';
export const CA5585_NOTE = 'Cal. Welfare & Institutions Code 5585.50: a minor who is a danger to others or self, or gravely disabled, as a result of mental disorder, when voluntary treatment cannot be authorized, may be held 72 hours for treatment and evaluation in a county-designated facility for minors. The facility makes every effort to notify the parent or legal guardian as soon as possible after the minor is detained.';

export { CRITERIA };

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function ca5585MinorHold(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.age)) return { valid: false, message: 'Enter the age. This hold is for minors only.' };
  const age = Number(String(o.age).trim());
  if (!Number.isFinite(age) || age < 0 || age > 120) return { valid: false, message: 'Enter the age in years, from 0 to 120.' };
  if (age >= 18) {
    return { valid: false, message: 'At 18 or older this is not the minor hold. Use the California 5150 hold timeline instead (Welfare & Institutions Code 5150).' };
  }
  if (isBlank(o.criterion) || !CRITERIA.some((c) => c.value === o.criterion)) {
    return { valid: false, message: 'Choose the criterion: danger to self, danger to others, or grave disability.' };
  }
  if (isBlank(o.detained)) return { valid: false, message: 'Enter the time the minor was detained. Without it no deadline is printed.' };
  const d = parseDateTime(o.detained);
  if (d === null) return { valid: false, message: 'Enter the detention time as a date and time.' };

  const h72 = addHours(d, 72);
  const deadlines = [{ label: 'The minor hold ends (72 hours)', at: h72.end, text: formatDeadline(d, h72.endWall, 'detention') }];
  let parent;
  let abnormal = false;
  if (isBlank(o.parentNotified)) {
    parent = 'Parent or legal guardian notice: not yet recorded. The facility makes every effort to notify as soon as possible after the minor is detained.';
    abnormal = true;
  } else {
    const p = parseDateTime(o.parentNotified);
    if (p === null) return { valid: false, message: 'Enter the time the parent or guardian was notified as a date and time, or leave it blank.' };
    if (p < d) return { valid: false, message: 'The notice is recorded before the detention. Check the two times.' };
    const e = elapsedHours(d, p);
    parent = `Parent or legal guardian notified ${Math.round(e * 10) / 10} h after detention. The section asks for every effort to notify as soon as possible and sets no fixed number of hours.`;
  }

  return {
    valid: true,
    abnormal,
    bandLabel: `The minor hold ends ${h72.end.replace('T', ' ')}`,
    band: `The 72-hour minor hold under 5585.50 ends ${formatDeadline(d, h72.endWall, 'detention')}.`,
    deadlines,
    parent,
    caveats: h72.caveats,
    postureNote: scopeSentence(CA5585_VERIFIED),
    note: CA5585_NOTE,
  };
}
