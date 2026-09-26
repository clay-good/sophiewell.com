// spec-v1511 tool 7: lenalidomide REMS fill window. Lenalidomide only: the thalidomide and pomalidomide
// programs have their own documents and are not assumed to match.
//
// Lenalidomide REMS Pharmacy Guide (Bristol-Myers Squibb, 12/22): an authorization number is valid for 7 days
// from the date of the last pregnancy test for a female patient of reproductive potential, and 30 days from
// the date it is issued for all other patients; a confirmation number is valid for 24 hours, and for a female
// of reproductive potential the drug ships the same day or is handed over within 24 hours; no more than a
// 4-week (28-day) supply; no refills; a subsequent prescription only when 7 or fewer days of therapy remain.
// Pregnancy tests weekly during the first 4 weeks of use, then every 4 weeks (regular or no cycles) or every
// 2 weeks (irregular cycles). "7 days from" is counted here as the 7 calendar days after the test date; the
// REMS system's expiry controls.
//
// Pure: no DOM, no clock (the caller passes `now`).

import { inputFault } from './num.js';
import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';
import { todayUtc } from './pa/date.js';
import { longDate } from './partd-appeals-v1503.js';

const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };
export const CATEGORIES = [
  { value: 'frp', text: 'Female of reproductive potential' },
  { value: 'other', text: 'Any other patient (male, or female not of reproductive potential)' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const CYCLES = [{ value: 'regular', text: 'Regular cycles, or none' }, { value: 'irregular', text: 'Irregular cycles' }];

export function imidRemsFillWindow(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const cat = CATEGORIES.some((c) => c.value === o.category) ? o.category : null;
  if (!cat) return { valid: false, message: 'Choose the patient risk category written on the prescription.' };
  const anchor = date(o.anchorDate);
  if (!anchor) return { valid: false, message: cat === 'frp' ? 'Enter the date of the last pregnancy test (YYYY-MM-DD).' : 'Enter the date the authorization number was issued (YYYY-MM-DD).' };
  let check;
  const notes = [];
  if (String(o.checkDate ?? '').trim()) { check = date(o.checkDate); if (!check) return { valid: false, message: 'Enter the date to check as YYYY-MM-DD, or leave it blank for today.' }; } else { check = todayUtc(now); notes.push(`A date to check was not entered, so today, ${longDate(check)}, is used.`); }
  const last = addCalendarDaysUtc(anchor, cat === 'frp' ? 7 : 30);
  const blockers = [];
  if (check > last) blockers.push(`the authorization expired after ${longDate(last)} (${cat === 'frp' ? '7 days from the last pregnancy test' : '30 days from issue'})`);
  if (check < anchor) blockers.push('the date checked is before the authorization date');
  const subsequent = o.subsequent === 'yes';
  if (subsequent) {
    const f = inputFault([['the days of therapy remaining', o.daysLeft, 0, 28, 'days']]);
    if (f) return { valid: false, message: f };
    if (Number(o.daysLeft) > 7) blockers.push(`${o.daysLeft} days of therapy remain; a new fill needs 7 or fewer`);
  } else if (o.subsequent !== 'no') notes.push('Whether this is a subsequent prescription was not entered; a subsequent fill also needs 7 or fewer days of therapy remaining.');
  notes.push(`Dispense no more than a 28-day supply, with no refills; get a confirmation number and dispense within 24 hours of it${cat === 'frp' ? ' (for this patient, ship the same day or hand over within 24 hours)' : ''}.`);
  if (cat === 'frp') {
    const start = date(o.therapyStart);
    if (start) {
      const weeks = Math.floor((check - start) / (7 * 86400000));
      const every = weeks < 4 ? 7 : o.cycles === 'irregular' ? 14 : 28;
      notes.push(`Pregnancy tests: ${weeks < 4 ? 'weekly during the first 4 weeks of use' : `every ${every === 14 ? '2' : '4'} weeks after the first 4 (${o.cycles === 'irregular' ? 'irregular cycles' : 'regular cycles or none'})`}; the next is due by ${longDate(addCalendarDaysUtc(anchor, every))}.`);
      if (weeks >= 4 && o.cycles !== 'regular' && o.cycles !== 'irregular') notes.push('The cycle pattern was not entered, so every 4 weeks is shown; irregular cycles need a test every 2 weeks.');
    } else notes.push('Enter the therapy start date to see the next pregnancy test due: weekly for the first 4 weeks, then every 4 weeks (every 2 with irregular cycles).');
  }
  const ok = blockers.length === 0;
  return {
    valid: true,
    allowed: ok,
    lastDay: last.toISOString().slice(0, 10),
    band: ok ? `A fill is allowed on ${longDate(check)}; the authorization is good through ${longDate(last)}.` : `Do not dispense on ${longDate(check)}: ${blockers.join('; ')}.`,
    bandLabel: ok ? `Allowed through ${last.toISOString().slice(0, 10)}` : 'Not allowed',
    abnormal: !ok,
    notes,
    note: 'From the Lenalidomide REMS Pharmacy Guide; the REMS system\'s authorization and confirmation numbers control.',
  };
}
