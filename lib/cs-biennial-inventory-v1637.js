// spec-v1637 tool 3: controlled-substance inventory due date and count method.
//
// Source: 21 CFR 1304.11 and 1304.04, read on eCFR as current October 8, 2026 (re-read
// October 12, 2026).
//   1304.11(a)  "The inventory may be taken either as of opening of business or as of the close of
//     business on the inventory date and it shall be indicated on the inventory."
//   1304.11(c)  "a new inventory of all stocks of controlled substances on hand at least every two
//     years. The biennial inventory may be taken on any date which is within two years of the
//     previous biennial inventory date."
//   1304.11(d)  a newly scheduled substance: "On the effective date of a rule ... every registrant
//     ... who possesses that substance shall take an inventory of all stocks of the substance".
//   1304.11(e)(6)  an opened commercial container: "(i) If the substance is listed in Schedules I
//     or II, make an exact count or measure of the contents; or (ii) If the substance is listed in
//     Schedule III, IV, or V, make an estimated count or measure of the contents, unless the
//     container holds more than 1,000 tablets or capsules in which case he/she must make an exact
//     count".
//   1304.04(a)  every inventory kept "for at least 2 years from the date of such inventory".
//
// The rule does not say whether the second anniversary itself is "within two years"; the tool
// gives the anniversary as the last date and says so.
//
// Pure: the clock is a parameter.

import { parseIsoStrict, fmtUtc, addMonthsUtc } from './deadline.js';
import { inputFault } from './num.js';

export const SCHEDULES = [
  { value: 'schedule-1-or-2', text: 'Schedule I or II' },
  { value: 'schedule-3-4-or-5', text: 'Schedule III, IV or V' },
];
export const CONTAINERS = [
  { value: 'opened-container', text: 'Opened commercial container' },
  { value: 'sealed-container', text: 'Sealed, unopened commercial container' },
];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const todayUtc = (now) => (now instanceof Date && !Number.isNaN(now.getTime()) ? new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) : null);

export function csBiennialInventory(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const last = date(o.lastInventory);
  if (!last) return { valid: false, message: 'Enter the date of the last controlled-substance inventory.' };
  let stateMonths = null;
  if (!blank(o.stateIntervalMonths)) {
    const f = inputFault([['the state inventory interval', o.stateIntervalMonths, 1, 24, 'months']]);
    if (f) return { valid: false, message: f };
    if (!Number.isInteger(Number(o.stateIntervalMonths))) return { valid: false, message: 'Enter the state inventory interval as a whole number of months.' };
    stateMonths = Number(o.stateIntervalMonths);
  }
  const effective = blank(o.newlyScheduledEffective) ? null : date(o.newlyScheduledEffective);
  if (!blank(o.newlyScheduledEffective) && !effective) return { valid: false, message: 'Enter the effective date of the scheduling rule as a real date, or leave it blank.' };
  const schedule = String(o.schedule ?? '').trim(); const container = String(o.container ?? '').trim();
  if (schedule !== '' && !SCHEDULES.some((s) => s.value === schedule)) return { valid: false, message: 'Choose the schedule from the list, or leave it not entered.' };
  if (container !== '' && !CONTAINERS.some((c) => c.value === container)) return { valid: false, message: 'Choose the container from the list, or leave it not entered.' };
  let count = null;
  if (!blank(o.labeledCount)) {
    const f = inputFault([['the number of tablets or capsules the container holds', o.labeledCount, 1, 1e6, '']]);
    if (f) return { valid: false, message: f };
    count = Number(o.labeledCount);
  }

  const federal = addMonthsUtc(last, 24);
  const state = stateMonths === null ? null : addMonthsUtc(last, stateMonths);
  const due = state && state.getTime() < federal.getTime() ? state : federal;
  const keepUntil = addMonthsUtc(last, 24);
  const notes = [`Federal: the next inventory may be taken on any date within two years of the last one, so no later than ${say(federal)} (21 CFR 1304.11(c)). The rule does not say whether the anniversary itself counts; an earlier date is always allowed.`];
  if (state) notes.push(`State interval entered, ${stateMonths} months: ${say(state)}. The earlier of the two dates is ${say(due)}.`);
  else notes.push('No state interval was entered. Many states require an inventory every year; the earlier date governs.');
  notes.push('The inventory must say whether it was taken as of the opening or the close of business that day (1304.11(a)).');
  notes.push(`The last inventory must be kept for at least 2 years from its date: until ${say(keepUntil)} at the earliest (1304.04(a)).`);
  if (effective) notes.push(`A substance newly added to a schedule is inventoried on the effective date of the rule, ${say(effective)}, and in every inventory after it (1304.11(d)).`);
  const out = { valid: true, federalDue: fmtUtc(federal), due: fmtUtc(due), keepUntil: fmtUtc(keepUntil) };
  if (container === 'opened-container') {
    if (schedule === 'schedule-1-or-2') { out.countMethod = 'exact'; notes.push('Opened container, Schedule I or II: an exact count or measure of the contents (1304.11(e)(6)(i)).'); }
    else if (schedule === 'schedule-3-4-or-5') {
      if (count === null) { out.countMethod = 'depends-on-container-size'; notes.push('Opened container, Schedule III, IV or V: an estimated count or measure, unless the container holds more than 1,000 tablets or capsules, in which case an exact count (1304.11(e)(6)(ii)). The container size was not entered.'); }
      else if (count > 1000) { out.countMethod = 'exact'; notes.push(`Opened container, Schedule III, IV or V, holding ${count.toLocaleString('en-US')} tablets or capsules: more than 1,000, so an exact count (1304.11(e)(6)(ii)).`); }
      else { out.countMethod = 'estimate'; notes.push(`Opened container, Schedule III, IV or V, holding ${count.toLocaleString('en-US')} tablets or capsules: not more than 1,000, so an estimated count or measure is allowed (1304.11(e)(6)(ii)).`); }
    } else notes.push('Opened container: the count method depends on the schedule, which was not entered. Schedule I or II is an exact count; Schedule III, IV or V is an estimate unless the container holds more than 1,000 tablets or capsules.');
  } else if (container === 'sealed-container') {
    notes.push('Sealed container: paragraph (e)(6) sets the count method only for a container that has been opened. A sealed one is recorded by its labeled contents and the number of containers (1304.11(e)(1)(iii) and (iv), which (e)(6) applies to dispensers).');
  }
  let where = 'Inventory due date';
  const today = todayUtc(now);
  if (today) {
    const n = Math.round((due.getTime() - today.getTime()) / 86400000);
    where = n > 0 ? `${n} days left` : n === 0 ? 'Due today' : `${-n} days past due`;
    out.daysLeft = n; out.abnormal = n < 0;
    notes.push(n > 0 ? `That is ${n} days from today.` : n === 0 ? 'That is today.' : `That was ${-n} days ago.`);
  }
  return { ...out, flag: out.abnormal ? 'past-due' : 'due-date', band: `Next controlled-substance inventory no later than ${say(due)}.`, bandLabel: where, notes, note: notes.join(' ') };
}
