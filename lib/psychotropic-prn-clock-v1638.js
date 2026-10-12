// spec-v1638 tool 21: the 14-day limit on a PRN psychotropic order in a nursing facility.
//
// Sources, re-read October 12, 2026:
//   42 CFR 483.45(e)(3)-(5) (eCFR as current October 8, 2026): "(4) PRN orders for psychotropic
//     drugs are limited to 14 days. Except as provided in 483.45(e)(5), if the attending physician
//     or prescribing practitioner believes that it is appropriate for the PRN order to be extended
//     beyond 14 days, he or she should document their rationale in the resident's medical record
//     and indicate the duration for the PRN order. (5) PRN orders for anti-psychotic drugs are
//     limited to 14 days and cannot be renewed unless the attending physician or prescribing
//     practitioner evaluates the resident for the appropriateness of that medication."
//   CMS State Operations Manual, Appendix PP, "PRN Medication Use" table (read in the Rev. 225
//     edition CMS serves): other psychotropics, 14 days, "Order may be extended beyond 14 days",
//     with the rationale documented and "a specific duration"; antipsychotics, 14 days, exception
//     "None", and a new order only after the prescriber first evaluates the resident.
//
// Whether the first day counts is not stated. The tool counts the start date as day 1, the
// stricter reading, so the last day is the start date plus 13, and says so.
//
// Pure: the clock is a parameter.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc } from './deadline.js';
import { inputFault } from './num.js';

export const KINDS = [
  { value: 'antipsychotic-prn', text: 'An antipsychotic' },
  { value: 'other-psychotropic-prn', text: 'Another psychotropic (antidepressant, anti-anxiety, hypnotic and others)' },
];
export const RATIONALE = [
  { value: 'rationale-with-duration-documented', text: 'The prescriber documented a rationale and a specific duration' },
  { value: 'no-documented-extension', text: 'No documented extension' },
];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function psychotropicPrnClock(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const kind = KINDS.find((k) => k.value === String(o.kind ?? '').trim());
  if (!kind) return { valid: false, message: 'Choose whether the PRN order is for an antipsychotic or another psychotropic: the rule treats them differently.' };
  const start = date(o.started);
  if (!start) return { valid: false, message: 'Enter the date the PRN order started.' };
  const fourteen = addCalendarDaysUtc(start, 13);
  const notes = [`A PRN psychotropic order is limited to 14 days. Counting ${say(start)} as day 1, the last day is ${say(fourteen)} (42 CFR 483.45(e)(4)). The rule does not say whether the first day counts; this is the stricter reading.`];
  let last = fourteen; let flag = 'fourteen-day-limit';
  const out = { valid: true, fourteenDayEnd: fmtUtc(fourteen) };
  if (kind.value === 'antipsychotic-prn') {
    notes.push('An antipsychotic PRN order cannot be extended, and cannot be renewed unless the attending physician or prescribing practitioner evaluates the resident for the appropriateness of that medication (483.45(e)(5)). Each new order is again limited to 14 days.');
    notes.push('CMS: the evaluation means the attending physician or prescribing practitioner directly examining the resident and documenting whether the PRN antipsychotic is still needed, its benefit, and whether the resident\'s distress has improved; a report from staff to the prescriber is not an evaluation.');
    if (!blank(o.evaluated)) {
      const ev = date(o.evaluated);
      if (!ev) return { valid: false, message: 'Enter the date the prescriber evaluated the resident as a real date, or leave it blank.' };
      out.evaluated = fmtUtc(ev);
      notes.push(ev.getTime() >= start.getTime() ? `An evaluation is recorded for ${say(ev)}. A new order written after it would run 14 days from its own start date; enter that order's start date to see its last day.` : `The evaluation entered, ${say(ev)}, is before this order started, so it belongs to this order, not to a renewal.`);
    } else notes.push('No evaluation date was entered.');
  } else {
    const rat = RATIONALE.find((r) => r.value === String(o.extension ?? '').trim());
    if (!rat) return { valid: false, message: 'Choose whether the prescriber documented a rationale and a specific duration: without both, the order ends at 14 days.' };
    if (rat.value === 'rationale-with-duration-documented') {
      const f = inputFault([['the documented duration of the order', o.durationDays, 1, 365, 'days']]);
      if (f) return { valid: false, message: f };
      if (!Number.isInteger(Number(o.durationDays))) return { valid: false, message: 'Enter the documented duration as a whole number of days.' };
      const days = Number(o.durationDays);
      last = addCalendarDaysUtc(start, days - 1); flag = days > 14 ? 'extended-by-documentation' : 'fourteen-day-limit';
      notes.push(days > 14 ? `The prescriber documented a rationale and a duration of ${days} days, so the order runs to ${say(last)} (483.45(e)(4)). The record must hold both the rationale and the duration.` : `The documented duration, ${days} days, is not beyond 14, so the order ends ${say(last)}.`);
    } else notes.push('With no documented rationale and duration, the order may not run beyond 14 days (483.45(e)(4)).');
    notes.push('The order itself must be for a diagnosed specific condition documented in the record (483.45(e)(3)).');
  }
  out.lastDay = fmtUtc(last);
  let where = `Through ${fmtUtc(last)}`;
  if (now instanceof Date && !Number.isNaN(now.getTime())) {
    const n = Math.round((last.getTime() - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
    out.daysLeft = n; out.abnormal = n < 0;
    where = n > 0 ? `${n} day${n === 1 ? '' : 's'} left` : n === 0 ? 'Last day is today' : `Ended ${-n} day${n === -1 ? '' : 's'} ago`;
    notes.push(n > 0 ? `That is ${n} day${n === 1 ? '' : 's'} from today.` : n === 0 ? 'That is today.' : `That was ${-n} day${n === -1 ? '' : 's'} ago.`);
  }
  notes.push('This is the federal nursing-facility rule. State rules and the facility\'s policy can be stricter.');
  return { ...out, flag: out.abnormal ? 'order-has-run-out' : flag, band: `The PRN order's last day is ${say(last)}.`, bandLabel: where, notes, note: notes.join(' ') };
}
