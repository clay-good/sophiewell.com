// spec-v1637 tool 16: controlled-substance disposal deadlines.
//
// Source: 21 CFR part 1317 and 1304.21(e), read on eCFR as current October 8, 2026 (re-read
// October 12, 2026).
//   1317.15(d)  "A reverse distributor shall destroy or cause the destruction of any controlled
//     substance received for the purpose of destruction no later than 30 calendar days after
//     receipt."
//   1317.80(a)  a long-term care facility transferring a resident's drugs into a collection
//     receptacle: "such disposal shall occur immediately, but no longer than three business days
//     after the discontinuation of use by the ultimate user. Discontinuation of use includes a
//     permanent discontinuation of use as directed by the prescriber, as a result of the
//     resident's transfer from the long-term care facility, or as a result of death."
//   1317.80(d)  "Upon removal, sealed inner liners may only be stored at the long-term care
//     facility for up to three business days in a securely locked, substantially constructed
//     cabinet or a securely locked room with controlled access".
//   1317.95(d)  on-site destruction: two employees handle or observe the handling, and two
//     personally witness the destruction, until the substance is non-retrievable.
//   1304.21(e)  a record of destruction on DEA Form 41 with "the name and signature of the two
//     employees who witnessed the destruction".
//
// "Business day" is not defined in 21 CFR 1300.01. The tool skips Saturdays, Sundays and federal
// holidays, says so, and gives the plain third calendar day beside it as the stricter reading.
//
// Pure: the clock is a parameter.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc, isBusinessDay } from './deadline.js';

export const WHO = [
  { value: 'reverse-distributor-receipt', text: 'Reverse distributor: drugs received for destruction' },
  { value: 'ltc-resident-stopped', text: 'Long-term care facility: a resident stopped using the drug' },
  { value: 'ltc-inner-liner-removed', text: 'Long-term care facility: a sealed inner liner was removed from the receptacle' },
];
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
function addBusinessDays(d, n) { let x = d; let left = n; while (left > 0) { x = addCalendarDaysUtc(x, 1); if (isBusinessDay(x)) left -= 1; } return x; }

export function csDisposalClock(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const who = WHO.find((w) => w.value === String(o.who ?? '').trim());
  if (!who) return { valid: false, message: 'Choose who is disposing and what started the clock.' };
  const trigger = date(o.trigger);
  if (!trigger) return { valid: false, message: who.value === 'reverse-distributor-receipt' ? 'Enter the date the drugs were received.' : who.value === 'ltc-resident-stopped' ? 'Enter the date the resident stopped using the drug.' : 'Enter the date the inner liner was removed.' };
  const notes = [];
  let due; const out = { valid: true };
  if (who.value === 'reverse-distributor-receipt') {
    due = addCalendarDaysUtc(trigger, 30);
    notes.push(`Received ${say(trigger)}: destroy, or cause the destruction, no later than ${say(due)}, 30 calendar days after receipt (21 CFR 1317.15(d)).`);
  } else {
    due = addBusinessDays(trigger, 3);
    const strict = addCalendarDaysUtc(trigger, 3);
    out.strictReading = fmtUtc(strict);
    notes.push(who.value === 'ltc-resident-stopped'
      ? `Use stopped ${say(trigger)}: transfer into the collection receptacle immediately, and no longer than three business days after, so by ${say(due)} (21 CFR 1317.80(a)). Stopping includes a prescriber's permanent discontinuation, the resident's transfer out, and death.`
      : `Liner removed ${say(trigger)}: it may be stored at the facility for up to three business days, so until ${say(due)}, in a securely locked, substantially constructed cabinet or a securely locked room with controlled access (21 CFR 1317.80(d)).`);
    notes.push(`"Business day" is not defined in the regulations. This skips Saturdays, Sundays and federal holidays.${strict.getTime() !== due.getTime() ? ` Read most strictly, three days is ${say(strict)}.` : ''}`);
  }
  out.due = fmtUtc(due);
  let where = 'Disposal deadline';
  if (now instanceof Date && !Number.isNaN(now.getTime())) {
    const n = Math.round((due.getTime() - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    out.daysLeft = n; out.abnormal = n < 0;
    where = n > 0 ? `${n} day${n === 1 ? '' : 's'} left` : n === 0 ? 'Due today' : `${-n} day${n === -1 ? '' : 's'} past due`;
    notes.push(n > 0 ? `That is ${n} day${n === 1 ? '' : 's'} from today.` : n === 0 ? 'That is today.' : `That was ${-n} day${n === -1 ? '' : 's'} ago.`);
  }
  notes.push('On-site destruction: two employees of the registrant handle or observe the handling of the substance, and two personally witness its destruction, until it is non-retrievable (1317.95(d)). The record of destruction is a DEA Form 41 carrying the name and signature of the two employees who witnessed it (1304.21(e)).');
  notes.push('State law can be stricter.');
  return { ...out, flag: out.abnormal ? 'past-due' : 'deadline', band: `${who.value === 'ltc-inner-liner-removed' ? 'Store no later than' : who.value === 'ltc-resident-stopped' ? 'Place in the receptacle by' : 'Destroy by'} ${say(due)}.`, bandLabel: where, notes, note: notes.join(' ') };
}
