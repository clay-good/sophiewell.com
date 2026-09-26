// spec-v1502 tool 3: when an authorization runs out -- by its end date or by its units, whichever
// comes first -- and the date to submit the renewal.
//
// Arithmetic on the approval's own terms; nothing here is a payer rule. The next administration that
// the approval no longer covers is the date a new approval is needed, so the renewal is due the lead
// time before that date.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { parseIsoStrict, addCalendarDaysUtc, fmtUtc } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';

const POSTURE = 'This is arithmetic on the approval\'s terms, not a coverage decision. The approval letter controls.';
const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };

export function authRunout(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const start = date(o.startDate);
  const end = date(o.endDate);
  if (!start) return { valid: false, message: 'Enter the date the approval starts (YYYY-MM-DD).' };
  if (!end) return { valid: false, message: 'Enter the date the approval ends (YYYY-MM-DD).' };
  if (end < start) return { valid: false, message: 'Enter the dates again: the approval cannot end before it starts.' };
  const fault = inputFault([
    ['the units or visits approved', o.approved, 0, 100000, ''],
    ['the units or visits used so far (0 if none)', o.used, 0, 100000, ''],
    ['the units given at each administration', o.perDose, null, 100000, ''],
    ['the days between administrations', o.intervalDays, null, 3650, ''],
  ]);
  if (fault) return { valid: false, message: fault };
  const approved = Number(o.approved);
  const used = Number(o.used);
  const per = Number(o.perDose);
  const every = Number(o.intervalDays);
  if (!Number.isInteger(every)) return { valid: false, message: 'Enter the days between administrations as a whole number.' };
  if (used > approved) return { valid: false, message: 'Enter the units again: more have been used than were approved.' };
  const next = date(o.nextDose);
  if (!next) return { valid: false, message: 'Enter the date of the next scheduled administration (YYYY-MM-DD).' };
  const notes = [];
  let lead = 14;
  if (String(o.leadDays ?? '').trim() === '') notes.push('A lead time was not entered, so 14 days is used.');
  else {
    const lf = inputFault([['the renewal lead time', o.leadDays, 0, 365, 'days']]);
    if (lf) return { valid: false, message: lf };
    lead = Math.round(Number(o.leadDays));
  }
  const left = approved - used;
  const doses = Math.floor(left / per + 1e-9);
  const firstUncovered = addCalendarDaysUtc(next, doses * every);
  // The first scheduled administration after the end date.
  let afterEnd = next;
  while (afterEnd <= end) afterEnd = addCalendarDaysUtc(afterEnd, every);
  const unitsFirst = firstUncovered < afterEnd;
  const needBy = unitsFirst ? firstUncovered : afterEnd;
  const submit = addCalendarDaysUtc(needBy, -lead);
  const doseText = `${doses} more administration${doses === 1 ? '' : 's'}`;
  let band;
  const together = firstUncovered.getTime() === afterEnd.getTime();
  if (together) {
    band = `The ${left} unit${left === 1 ? '' : 's'} left cover ${doseText}, and the approval ends ${longDate(end)}: both run out together, so the administration on ${longDate(needBy)} needs a new approval. Submit the renewal by ${longDate(submit)}.`;
  } else if (unitsFirst) {
    band = `The approval ends ${longDate(end)}, but the ${left} unit${left === 1 ? '' : 's'} left cover ${doseText} at ${per} per administration every ${every} days, so the administration on ${longDate(firstUncovered)} needs a new approval. Submit the renewal by ${longDate(submit)}.`;
  } else {
    band = `The units left cover ${doseText}, but the approval ends ${longDate(end)} first; the next administration, on ${longDate(afterEnd)}, needs a new approval. Submit the renewal by ${longDate(submit)}.`;
  }
  if (left - doses * per > 1e-9) notes.push(`${Math.round((left - doses * per) * 1000) / 1000} unit(s) remain that are too few for a full administration.`);
  if (submit < start) notes.push('The renewal date falls before the approval began: the approval is already too short for this schedule.');
  notes.push('The renewal date is the lead time before the first administration the approval does not cover.');
  return {
    valid: true,
    needBy: fmtUtc(needBy),
    submitBy: fmtUtc(submit),
    limitedBy: together ? 'both' : unitsFirst ? 'units' : 'end date',
    band,
    bandLabel: `Submit renewal by ${fmtUtc(submit)}`,
    notes,
    note: POSTURE,
  };
}
