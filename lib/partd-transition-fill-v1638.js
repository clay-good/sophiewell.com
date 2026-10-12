// spec-v1638 tool 3: is a Part D transition supply owed, and how much?
//
// Source: 42 CFR 423.120(b)(3), read on eCFR as current October 8, 2026 (re-read October 12,
// 2026).
//   (b)(3)  for Part D drugs "not on its Part D plan's formulary (including Part D drugs that are
//     on a sponsor's formulary but require prior authorization or step therapy)".
//   (i)(A)  new enrollees, newly eligible enrollees, those who switch plans, and "Current
//     enrollees remaining in the plan affected by formulary changes"; (i)(B) not "immediate
//     changes as permitted under paragraph (e)(2)".
//   (ii)  "a temporary supply of drugs within the first 90 days of coverage under a new plan",
//     for retail, home infusion, long-term care and mail-order pharmacies.
//   (iii)  "a one-time, temporary supply of at least an approved month's supply of medication,
//     unless the prescription is written by a prescriber for less than an approved month's supply
//     and requires the Part D sponsor to allow multiple fills to provide up to a total of an
//     approved month's supply".
//   (iv)  "written notice ... within 3 business days after adjudication of the temporary fill.
//     For long-term care residents dispensed multiple supplies ... in increments of
//     14-days-or-less ..., within 3 business days after adjudication of the first temporary fill."
// The regulation says "within the first 90 days of coverage"; the tool counts the effective date
// as day 1. The Medicare Prescription Drug Benefit Manual, chapter 6 (2016), which predates the
// current text, adds an emergency supply for long-term care residents outside the 90 days and
// counts a continuing member's 90 days from January 1; neither was re-read at build, and the
// tool states only that the manual has more.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc, isBusinessDay } from './deadline.js';
import { inputFault } from './num.js';

const opt = (value, text) => ({ value, text });
export const STATUS = [
  opt('non-formulary-drug', 'Not on the plan\'s formulary'),
  opt('formulary-with-pa-or-step', 'On the formulary, with prior authorization or step therapy'),
  opt('formulary-no-restriction', 'On the formulary with neither'),
];
export const CHANGE = [opt('not-under-e2', 'No'), opt('formulary-change-under-e2', 'Yes: an immediate change permitted under 423.120(e)(2)')];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
function addBusinessDays(d, n) { let x = d; let left = n; while (left > 0) { x = addCalendarDaysUtc(x, 1); if (isBusinessDay(x)) left -= 1; } return x; }

export function partdTransitionFill(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const status = STATUS.find((s) => s.value === String(o.drugStatus ?? '').trim());
  if (!status) return { valid: false, message: 'Choose the drug\'s status on the plan: a transition supply is for a non-formulary drug or one with prior authorization or step therapy.' };
  const effective = date(o.coverageEffective);
  if (!effective) return { valid: false, message: 'Enter the date coverage under the plan took effect.' };
  const requested = date(o.requested);
  if (!requested) return { valid: false, message: 'Enter the date of the fill request.' };
  if (requested.getTime() < effective.getTime()) return { valid: false, message: 'Enter a fill request date that is not before coverage took effect.' };
  const f = inputFault([['the days in the plan\'s approved month\'s supply', o.monthDays, 1, 100, 'days'], ['the days already supplied under transition for this drug (0 if none)', o.alreadySupplied, 0, 366, 'days']]);
  if (f) return { valid: false, message: f };
  const change = CHANGE.find((c) => c.value === String(o.immediateChange ?? '').trim());
  if (!change) return { valid: false, message: 'Choose whether this is an immediate formulary change permitted under 423.120(e)(2): the transition process does not apply to those.' };
  const month = Number(o.monthDays); const already = Number(o.alreadySupplied);
  const windowEnd = addCalendarDaysUtc(effective, 89);
  const day = Math.round((requested.getTime() - effective.getTime()) / 86400000) + 1;
  const notes = [`Transition window: the first 90 days of coverage, ${say(effective)} through ${say(windowEnd)}, counting the effective date as day 1. The request falls on day ${day}. The window applies at retail, home infusion, long-term care and mail-order pharmacies (42 CFR 423.120(b)(3)(ii)).`];
  const out = { valid: true, windowEnds: fmtUtc(windowEnd), coverageDay: day };
  let reason = null;
  if (status.value === 'formulary-no-restriction') reason = 'the drug is on the formulary with no prior authorization or step therapy, so there is nothing to transition';
  else if (change.value === 'formulary-change-under-e2') reason = 'the transition process does not apply to an immediate formulary change permitted under 423.120(e)(2) (423.120(b)(3)(i)(B))';
  else if (day > 90) reason = `day ${day} is after the first 90 days of coverage`;
  let owed = 0;
  if (reason) notes.push(`No transition supply is owed under the regulation: ${reason}.`);
  else {
    owed = Math.max(0, month - already);
    notes.push(`Owed: a one-time temporary supply of at least the approved month's supply, ${month} days. ${already > 0 ? `${already} days were already supplied under transition, so ${owed} remain${owed === 1 ? 's' : ''}.` : 'None has been supplied yet.'} (423.120(b)(3)(iii)).`);
    if (!blank(o.daysWritten)) {
      const g = inputFault([['the days written on the prescription', o.daysWritten, 1, 366, 'days']]);
      if (g) return { valid: false, message: g };
      const written = Number(o.daysWritten);
      out.daysThisFill = Math.min(written, owed);
      notes.push(written < month ? `The prescription is written for ${written} days, less than the month's supply, so the sponsor must allow multiple fills up to a total of ${month} days; this fill is ${out.daysThisFill} days.` : `The prescription is written for ${written} days; the temporary supply owed is ${owed} days.`);
    }
    if (owed === 0) notes.push('The full approved month\'s supply has already been provided under transition.');
  }
  out.daysOwed = owed;
  if (!blank(o.adjudicated)) {
    const adj = date(o.adjudicated);
    if (!adj) return { valid: false, message: 'Enter the date the temporary fill adjudicated as a real date, or leave it blank.' };
    const notice = addBusinessDays(adj, 3);
    out.noticeDue = fmtUtc(notice);
    notes.push(`Written notice to the enrollee: within 3 business days after the temporary fill adjudicated on ${say(adj)}, so by ${say(notice)} (423.120(b)(3)(iv)). For a long-term care resident dispensed in increments of 14 days or less, the 3 business days run from the first temporary fill. This skips Saturdays, Sundays and federal holidays; the rule does not define a business day.`);
  } else if (!reason) notes.push('Written notice goes to the enrollee within 3 business days after the temporary fill adjudicates (423.120(b)(3)(iv)); enter that date to see the deadline.');
  notes.push('The sponsor also makes reasonable efforts to notify the prescriber, and charges the cost sharing the rule sets for a transition supply (423.120(b)(3)(v), (vi)).');
  notes.push('CMS\'s Prescription Drug Benefit Manual (chapter 6, 2016) has more, including an emergency supply for long-term care residents outside the 90 days and how a continuing member\'s window is counted after a formulary change. It predates the current regulation text and was not read for this result.');
  return { ...out, flag: reason ? 'not-owed' : owed > 0 ? 'transition-supply-owed' : 'already-supplied', abnormal: false, band: reason ? 'No transition supply is owed under the regulation.' : owed > 0 ? `A transition supply of ${owed} days is owed.` : 'The transition supply has already been provided.', bandLabel: reason ? 'Not owed' : `Window ends ${fmtUtc(windowEnd)}`, notes, note: notes.join(' ') };
}
