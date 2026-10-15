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
// as day 1.
//
// Medicare Prescription Drug Benefit Manual, chapter 6 (Rev. 18, January 15, 2016), still the edition
// CMS posts, re-read October 14, 2026:
//   30.4.5  for current enrollees affected by negative formulary changes in the upcoming year, a sponsor
//     that has not transitioned them before the new contract year is "expected to provide a transition
//     supply of the requested prescription drug beginning January 1"; a sponsor with objective
//     evidence that a meaningful transition occurred (an adjudicated exception, or a paid claim for a
//     formulary alternative) need not. The manual gives no other length, so a continuing member's 90
//     days are counted from January 1 and labeled as manual guidance.
//   30.4.6  for an LTC facility resident outside the 90-day transition period, "the sponsor must still
//     provide an emergency supply of non-formulary Part D drugs while an exception or prior
//     authorization request is being processed. These emergency supplies ... must be for at least 31
//     days of medication, regardless of dispensing increments, unless the prescription is written by a
//     prescriber for less than 31 days." "A sponsor is not expected to provide more than a one-time
//     31-day emergency fill of a particular drug per LTC stay." Multiple 14-day-or-less supplies of a
//     brand drug may make up the 31 days.
//   30.4.4.2 still says an LTC transition supply is 91 to 98 days; the regulation's "approved month's
//     supply" replaced that, and the tool follows the regulation.
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
export const MEMBER = [
  opt('new-coverage', 'New to the plan (new, newly eligible, or switched plans)'),
  opt('continuing-new-year', 'Continuing member whose drug changed on the formulary for the new contract year'),
];
export const YES_NO = [opt('yes', 'Yes'), opt('no', 'No')];
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
  // spec-v1638 tool 3, manual 30.4.5: a continuing member's window starts January 1 of the new year.
  const member = MEMBER.find((m) => m.value === String(o.memberType ?? '').trim()) || null;
  const continuing = member && member.value === 'continuing-new-year';
  if (continuing && !(effective.getUTCMonth() === 0 && effective.getUTCDate() === 1)) return { valid: false, message: 'For a continuing member whose drug changed for the new contract year, enter January 1 of that year as the start date.' };
  const windowEnd = addCalendarDaysUtc(effective, 89);
  const day = Math.round((requested.getTime() - effective.getTime()) / 86400000) + 1;
  const notes = [`Transition window: the first 90 days of coverage, ${say(effective)} through ${say(windowEnd)}, counting the effective date as day 1. The request falls on day ${day}. The window applies at retail, home infusion, long-term care and mail-order pharmacies (42 CFR 423.120(b)(3)(ii)).`];
  if (continuing) notes.push('For a continuing member, the rule covers current enrollees affected by formulary changes, and CMS\'s manual has the supply provided "beginning January 1"; the 90 days from January 1 are the manual\'s guidance, not the rule\'s text. No supply is expected where the plan already moved the member to a formulary alternative or decided an exception before January 1 (chapter 6, 30.4.5).');
  const out = { valid: true, windowEnds: fmtUtc(windowEnd), coverageDay: day };
  let reason = null;
  if (status.value === 'formulary-no-restriction') reason = 'the drug is on the formulary with no prior authorization or step therapy, so there is nothing to transition';
  else if (change.value === 'formulary-change-under-e2') reason = 'the transition process does not apply to an immediate formulary change permitted under 423.120(e)(2) (423.120(b)(3)(i)(B))';
  else if (day > 90) reason = `day ${day} is after the first 90 days of coverage`;
  let owed = 0;
  // spec-v1638 tool 3, manual 30.4.6: past the 90 days, a long-term care resident's emergency supply.
  const ltc = String(o.ltcResident ?? '').trim();
  let emergency = null;
  if (reason && day > 90 && status.value !== 'formulary-no-restriction' && change.value !== 'formulary-change-under-e2') {
    if (ltc === 'yes') {
      const prior = String(o.priorEmergency ?? '').trim();
      if (prior !== 'yes' && prior !== 'no') return { valid: false, message: 'Choose whether an emergency supply of this drug was already given during this long-term care stay: the manual expects one per drug per stay.' };
      if (prior === 'yes') emergency = { days: 0, text: 'An emergency supply of this drug was already given during this long-term care stay; the manual does not expect another in the same stay (chapter 6, 30.4.6).' };
      else {
        let days = 31;
        let text = 'Outside the 90 days, a long-term care resident still gets an emergency supply of at least 31 days of a non-formulary drug while an exception or prior authorization request is processed, regardless of dispensing increments; several 14-day-or-less supplies of a brand drug may make up the 31 days. This is CMS manual guidance, not the regulation (chapter 6, 30.4.6).';
        if (!blank(o.daysWritten)) {
          const g = inputFault([['the days written on the prescription', o.daysWritten, 1, 366, 'days']]);
          if (g) return { valid: false, message: g };
          if (Number(o.daysWritten) < 31) { days = Number(o.daysWritten); text += ` The prescription is written for ${days} days, less than 31, so that is the emergency supply.`; }
        }
        emergency = { days, text };
      }
    } else if (ltc === 'no') notes.push('Not a long-term care resident, so the manual\'s emergency supply for residents outside the 90 days does not apply.');
    else notes.push('Whether the member lives in a long-term care facility was not entered: a resident outside the 90 days may still be owed a 31-day emergency supply under CMS\'s manual.');
  }
  if (emergency) {
    notes.push(`No transition supply is owed under the regulation: ${reason}.`);
    notes.push(emergency.text);
    out.emergencyDays = emergency.days;
  } else if (reason) notes.push(`No transition supply is owed under the regulation: ${reason}.`);
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
  const flag = emergency ? (emergency.days > 0 ? 'ltc-emergency-supply' : 'ltc-emergency-already-given') : reason ? 'not-owed' : owed > 0 ? 'transition-supply-owed' : 'already-supplied';
  const band = emergency
    ? (emergency.days > 0 ? `No transition supply, but a long-term care emergency supply of ${emergency.days} days (CMS manual).` : 'No transition supply, and this stay\'s emergency supply was already given.')
    : reason ? 'No transition supply is owed under the regulation.' : owed > 0 ? `A transition supply of ${owed} days is owed.` : 'The transition supply has already been provided.';
  const bandLabel = emergency ? (emergency.days > 0 ? 'LTC emergency supply' : 'Not owed') : reason ? 'Not owed' : `Window ends ${fmtUtc(windowEnd)}`;
  return { ...out, flag, abnormal: false, band, bandLabel, notes, note: 'CMS\'s manual (chapter 6, Rev. 18, 2016) still gives a long-term care transition supply of 91 to 98 days; the regulation\'s "approved month\'s supply" replaced it, and this follows the regulation.' };
}
