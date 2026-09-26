// spec-v1511 tool 6: iPLEDGE REMS dispense window (isotretinoin).
//
// iPLEDGE REMS Pharmacist Guide and Guide for Patients Who Can Get Pregnant (most recent modification March
// 2023): for a patient who can get pregnant, Day 1 is the date the pregnancy test specimen was collected and
// the window closes at 11:59 pm Eastern Time on Day 7 ("add 6 to the date of your pregnancy test"); for a
// patient who cannot, a prescription more than 30 days after the office visit is not authorized. No more than
// a 30-day supply, no automatic refills, and a blister pack of 10 is not broken. A patient who can get
// pregnant and misses the FIRST prescription's window must wait at least 19 days before starting again.
// FDA approved a modification on February 9, 2026, implemented November 15, 2026 (FDA iPLEDGE REMS page):
// no waiting period before a repeat pregnancy test after a missed first window, and at the prescriber's
// option, pregnancy tests outside a medical setting during and after treatment.
//
// Pure: no DOM, no clock (the caller passes `now`).

import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';
import { todayUtc } from './pa/date.js';
import { longDate } from './partd-appeals-v1503.js';

const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };
export const MODIFIED_FROM = '2026-11-15';
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

export function ipledgeWindow(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const can = o.canGetPregnant === 'yes' ? true : o.canGetPregnant === 'no' ? false : null;
  if (can === null) return { valid: false, message: 'Choose whether the patient can get pregnant: the window differs.' };
  const start = date(o.startDate);
  if (!start) return { valid: false, message: can ? 'Enter the date the pregnancy test specimen was collected (YYYY-MM-DD).' : 'Enter the date of the office visit (YYYY-MM-DD).' };
  const notes = [];
  let check = null;
  if (String(o.checkDate ?? '').trim()) {
    check = date(o.checkDate);
    if (!check) return { valid: false, message: 'Enter the date to check as YYYY-MM-DD, or leave it blank for today.' };
  } else { check = todayUtc(now); notes.push(`A date to check was not entered, so today, ${longDate(check)}, is used.`); }
  const last = addCalendarDaysUtc(start, can ? 6 : 30);
  const modified = check >= parseIsoStrict(MODIFIED_FROM);
  const open = check >= start && check <= last;
  let band;
  let label;
  if (can) {
    band = `Do not dispense after ${longDate(last)}, 11:59 pm Eastern Time: Day 1 is the specimen collection on ${longDate(start)}, and Day 7 is the last day.`;
  } else {
    band = `Do not dispense after ${longDate(last)}: 30 days after the office visit on ${longDate(start)}.`;
  }
  if (check < start) { band += ' The date checked comes before the window opens.'; label = 'Not yet open'; }
  else if (open) { const left = Math.round((last - check) / 86400000); band += ` On ${longDate(check)} the window is open${left ? ` for ${left} more day${left === 1 ? '' : 's'}` : ', its last day'}.`; label = `Open to ${last.toISOString().slice(0, 10)}`; }
  else {
    label = 'Window closed';
    band += ` On ${longDate(check)} the window has closed; the authorization must be reversed and the product returned to stock.`;
    if (can) {
      const first = o.firstPrescription === 'yes';
      if (first && !modified) notes.push('This was the first prescription: under the REMS in effect before November 15, 2026, the patient must wait at least 19 days before starting the process again.');
      else if (first) notes.push('This was the first prescription: from November 15, 2026, a repeat pregnancy test may be done right away, with no waiting period (FDA-approved modification of February 9, 2026).');
      else if (o.firstPrescription === 'no') notes.push('A new pregnancy test starts a new 7-day window.');
      else notes.push('Whether this was the first prescription was not entered: after a missed first window the REMS before November 15, 2026 required a wait of at least 19 days; otherwise a new pregnancy test starts a new 7-day window.');
    }
  }
  notes.push('No more than a 30-day supply, no automatic refills, and isotretinoin blister packs of 10 are not broken.');
  if (can) notes.push(modified ? 'From November 15, 2026, the prescriber may allow pregnancy tests outside a medical setting (for example, at home) during and after treatment; tests before treatment are still done in a medical setting.' : 'Before November 15, 2026, monthly pregnancy tests are done by a certified laboratory.');
  return { valid: true, lastDay: last.toISOString().slice(0, 10), band, bandLabel: label, abnormal: label === 'Window closed', notes, note: 'The iPLEDGE REMS website computes the authoritative "Do Not Dispense To Patient After" date; this shows its arithmetic.' };
}
