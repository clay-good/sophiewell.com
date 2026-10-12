// spec-v1638 tool 15: the Medicare DMEPOS refill contact and delivery window.
//
// Source: 42 CFR 410.38(d)(4), read on eCFR as current October 8, 2026 (re-read October 12, 2026).
//   (ii)(A) "Contact and affirmative response must be within 30 calendar days from the expected
//     end of the current supply", and "should be obtained as close to the expected end of the
//     current supply as possible."
//   (iii)  "The date of service for DMEPOS items provided on a recurring basis must be no earlier
//     than 10 calendar days before the expected end of the current supply."
//   (i)  Date of service: the date of delivery, or for shipped items the shipping date (the date
//     the label is created or the date the item is retrieved for delivery).
// The expected end of the current supply is the reader's entry, or the last date of service plus
// the quantity divided by daily use (a part day is dropped, the earlier date). The rule does not
// define how to compute it.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc } from './deadline.js';
import { inputFault } from './num.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function dmeposRefillWindow(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let end = null; const notes = [];
  if (!blank(o.expectedEnd)) {
    end = date(o.expectedEnd);
    if (!end) return { valid: false, message: 'Enter the expected end of the current supply as a real date, or leave it blank and enter the last delivery, the quantity and the daily use.' };
    notes.push(`Expected end of the current supply, as entered: ${say(end)}.`);
  } else {
    const last = date(o.lastService);
    if (!last) return { valid: false, message: 'Enter the date of the last delivery or shipment, or the expected end of the current supply.' };
    const f = inputFault([['the quantity delivered', o.quantity, null, 1e6, ''], ['the daily use', o.dailyUse, null, 1e5, '']]);
    if (f) return { valid: false, message: f };
    const days = Math.floor(Number(o.quantity) / Number(o.dailyUse) + 1e-9);
    if (!(days <= 3660)) return { valid: false, message: 'Enter a quantity and a daily use that give a supply of ten years or less; check the daily use.' };
    end = addCalendarDaysUtc(last, days);
    notes.push(`Expected end of the current supply: ${Number(o.quantity)} / ${Number(o.dailyUse)} a day is ${days} days from the last date of service, ${say(last)}: ${say(end)}. A part day is dropped.`);
  }
  const contactFrom = addCalendarDaysUtc(end, -30); const serviceFrom = addCalendarDaysUtc(end, -10);
  notes.push(`Contact with the beneficiary and the affirmative response: within 30 calendar days of the expected end, so on or after ${say(contactFrom)}, and as close to the end as possible (42 CFR 410.38(d)(4)(ii)(A)).`);
  notes.push(`Date of service of the refill: no earlier than 10 calendar days before the expected end, so on or after ${say(serviceFrom)} (410.38(d)(4)(iii)). For a shipped item the date of service is the shipping date: the day the label is created or the item is picked up.`);
  const out = { valid: true, expectedEnd: fmtUtc(end), earliestContact: fmtUtc(contactFrom), earliestService: fmtUtc(serviceFrom) };
  const problems = [];
  if (!blank(o.contacted)) {
    const c = date(o.contacted);
    if (!c) return { valid: false, message: 'Enter the contact date as a real date, or leave it blank.' };
    out.contactInWindow = c.getTime() >= contactFrom.getTime();
    if (!out.contactInWindow) problems.push('contact too early');
    notes.push(`Contact on ${say(c)}: ${out.contactInWindow ? 'inside the 30 days' : `more than 30 days before the expected end, ${Math.round((contactFrom.getTime() - c.getTime()) / 86400000)} day(s) too early`}.`);
  }
  if (!blank(o.plannedService)) {
    const p = date(o.plannedService);
    if (!p) return { valid: false, message: 'Enter the planned delivery or shipping date as a real date, or leave it blank.' };
    out.serviceInWindow = p.getTime() >= serviceFrom.getTime();
    if (!out.serviceInWindow) problems.push('date of service too early');
    notes.push(`Delivery or shipping on ${say(p)}: ${out.serviceInWindow ? 'not earlier than 10 days before the expected end' : `earlier than 10 days before the expected end, ${Math.round((serviceFrom.getTime() - p.getTime()) / 86400000)} day(s) too early`}.`);
  }
  if (blank(o.contacted) && blank(o.plannedService)) notes.push('No contact date or planned date of service was entered, so none was checked.');
  notes.push('The supplier documents the contact: for shipped items the beneficiary\'s name, the date of contact, the item requested and the affirmative response, before dispensing; for an item picked up at a retail store, the signed delivery slip or the itemized receipt (410.38(d)(4)(ii)(B)). Medicare contractors\' policies add detail this does not cover.');
  return { ...out, problems, flag: problems.length ? 'outside-the-window' : 'window', abnormal: problems.length > 0, band: `Contact from ${say(contactFrom)}; date of service from ${say(serviceFrom)}.`, bandLabel: problems.length ? problems.join('; ') : `Supply expected to end ${fmtUtc(end)}`, notes, note: notes.join(' ') };
}
