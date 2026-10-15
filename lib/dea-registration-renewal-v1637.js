// spec-v1637 tool 2: DEA registration expiration and the renewal window.
//
// Sources, read on eCFR as current October 8, 2026 (re-read October 12, 2026):
//   21 CFR 1301.13(b)  "may apply to be reregistered not more than 60 days before the expiration
//     date ... except that a bulk manufacturer of Schedule I or II controlled substances or an
//     importer of Schedule I or II controlled substances may apply ... no more than 120 days".
//   1301.13(d)  retail pharmacy, hospital/clinic, practitioner, emergency medical services agency
//     or teaching institution: "the last day of the month designated for that group"; the first
//     period "not less than 28 months nor more than 39 months"; then "expires 36 months from the
//     initial expiration date". (eCFR prints paragraph (d) twice, once without emergency medical
//     services agencies; the numbers are the same.)
//   1301.13(c) (re-read October 14, 2026)  a manufacturer, distributor, reverse distributor, researcher,
//     analytical lab, importer, exporter or narcotic treatment program is assigned a month group; "If
//     the business activity is assigned to a group which has an expiration date less than three months
//     from the date of which the business activity is registered, the registration shall not expire
//     until one year from that expiration date; in all other cases, the registration shall expire on
//     the expiration date following the date on which the business activity is registered." The table
//     in 1301.13(e) gives each of those activities a registration period of 1 year (dispensing and EMS
//     agencies 3). So a first period runs from 3 months up to, but not including, 15 months.
//   DEA, "Registration Program Overview & Updates", Supply Chain Conference slides, April 2025 (read
//     October 15, 2026): "If a renewal application is not received within 30 days of the expiration
//     date, the expired DEA number will be retired." That is a presentation, not a rule or the policy
//     page; its date is shown beside the policy page's reinstatement month, as written.
//   1301.36(i)  an applicant who "has applied for reregistration at least 45 days before the date
//     on which the existing registration is due to expire", with no order issued by then: "the
//     existing registration ... shall automatically be extended and continue in effect".
//   DEA Diversion Control Division, registration page (re-read October 12, 2026): "DEA allows the
//     reinstatement of an expired registration for one calendar month after the expiration date.
//     If the registration is not renewed within that calendar month, an application for a new DEA
//     registration will be required. ... federal law prohibits the handling of controlled
//     substances ... for any period of time under an expired registration." That is policy on a
//     web page, not a regulation. The same page says a renewal "submitted in a timely manner prior
//     to expiration" lets the registrant continue until final action; the rule's automatic
//     extension is the 45-day one. Both are shown.
//
// Pure: the clock is a parameter.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc, addMonthsUtc } from './deadline.js';

export const KINDS = [
  { value: 'pharmacy-hospital-practitioner', text: 'Retail pharmacy, hospital or clinic, practitioner, EMS agency or teaching institution' },
  { value: 'bulk-manufacturer-or-importer', text: 'Bulk manufacturer or importer of Schedule I or II' },
  { value: 'annual-registrant', text: 'Other manufacturer, distributor, reverse distributor, researcher, analytical lab, importer, exporter or narcotic treatment program' },
];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const monthEnd = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
const isMonthEnd = (d) => monthEnd(d).getTime() === d.getTime();
const todayUtc = (now) => (now instanceof Date && !Number.isNaN(now.getTime()) ? new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) : null);

export function deaRegistrationRenewal(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const kind = KINDS.find((k) => k.value && k.value === String(o.kind ?? '').trim());
  if (!kind) return { valid: false, message: 'Choose the kind of registrant: the earliest renewal date differs (60 days, or 120 for a bulk manufacturer or importer of Schedule I or II).' };
  const expires = date(o.expires);
  if (!expires) return { valid: false, message: 'Enter the expiration date on the registration certificate.' };
  const submitted = blank(o.submitted) ? null : date(o.submitted);
  if (!blank(o.submitted) && !submitted) return { valid: false, message: 'Enter the date the renewal application was submitted as a real date, or leave it blank.' };
  const registered = blank(o.registered) ? null : date(o.registered);
  if (!blank(o.registered) && !registered) return { valid: false, message: 'Enter the date of first registration as a real date, or leave it blank.' };
  if (registered && registered.getTime() >= expires.getTime()) return { valid: false, message: 'Enter a first registration date that is before the expiration date.' };

  const lead = kind.value === 'bulk-manufacturer-or-importer' ? 120 : 60; // 1301.13(b): 60 days for everyone else
  const earliest = addCalendarDaysUtc(expires, -lead);
  const mark45 = addCalendarDaysUtc(expires, -45);
  const reinstateEnd = monthEnd(addMonthsUtc(new Date(Date.UTC(expires.getUTCFullYear(), expires.getUTCMonth(), 1)), 1));
  const notes = [
    `Earliest renewal application: ${say(earliest)}, ${lead} days before expiration (21 CFR 1301.13(b)).`,
    `Apply by ${say(mark45)}, 45 days before expiration, and the registration continues automatically past ${say(expires)} until DEA acts on the application (1301.36(i)).`,
    `Expiration: ${say(expires)}.`,
    `DEA's policy page allows reinstatement of an expired registration for one calendar month after the expiration date, here through ${say(reinstateEnd)}; after that a new application is required. This is policy on DEA's web page, not a regulation.`,
    'No controlled substance may be handled on an expired registration for any period of time (the same page).',
    `DEA's 2025 Supply Chain Conference slides say that if no renewal is received within 30 days of the expiration date, the expired DEA number is retired: here after ${say(addCalendarDaysUtc(expires, 30))}. That is a presentation, not the policy page, and the two dates are shown as written.`,
  ];
  if (!isMonthEnd(expires)) notes.push(`${say(expires)} is not the last day of a month. Under 1301.13(d) a registration expires on the last day of its assigned month; check the certificate.`);
  const out = { valid: true, earliestApplication: fmtUtc(earliest), fortyFiveDayMark: fmtUtc(mark45), expires: fmtUtc(expires), reinstatementEnds: fmtUtc(reinstateEnd), numberRetiredAfterPerSlides: fmtUtc(addCalendarDaysUtc(expires, 30)) };
  if (kind.value === 'pharmacy-hospital-practitioner') {
    const next = monthEnd(addMonthsUtc(new Date(Date.UTC(expires.getUTCFullYear(), expires.getUTCMonth(), 1)), 36));
    out.nextExpiration = fmtUtc(next);
    notes.push(`After the first period, a registration in this group expires 36 months from the prior expiration: the next would be ${say(next)} (1301.13(d)).`);
    if (registered) {
      const months = (expires.getUTCFullYear() - registered.getUTCFullYear()) * 12 + (expires.getUTCMonth() - registered.getUTCMonth()) - (expires.getUTCDate() < registered.getUTCDate() ? 1 : 0);
      out.firstPeriodMonths = months;
      notes.push(`From first registration on ${say(registered)} to this expiration is ${months} whole months. The rule sets a first period of not less than 28 nor more than 39 months${months < 28 || months > 39 ? '; this is outside it, so this is likely not the first period, or a date is wrong' : ''}.`);
    }
  } else {
    // 1301.13(c) and the 1-year period in the 1301.13(e) table.
    const next = monthEnd(addMonthsUtc(new Date(Date.UTC(expires.getUTCFullYear(), expires.getUTCMonth(), 1)), 12));
    out.nextExpiration = fmtUtc(next);
    notes.push(`This group registers for 1 year (the table in 1301.13(e)): the next expiration would be ${say(next)}.`);
    if (registered) {
      const months = (expires.getUTCFullYear() - registered.getUTCFullYear()) * 12 + (expires.getUTCMonth() - registered.getUTCMonth()) - (expires.getUTCDate() < registered.getUTCDate() ? 1 : 0);
      out.firstPeriodMonths = months;
      notes.push(`From first registration on ${say(registered)} to this expiration is ${months} whole months. Under 1301.13(c) a first period is at least 3 months and less than 15 (a group month under 3 months away runs one more year)${months < 3 || months >= 15 ? '; this is outside it, so this is likely not the first period, or a date is wrong' : ''}.`);
    }
  }
  let flag = 'dates';
  if (submitted) {
    if (submitted.getTime() < earliest.getTime()) { flag = 'submitted-too-early'; notes.push(`An application on ${say(submitted)} is before the earliest date the rule allows.`); }
    else if (submitted.getTime() <= mark45.getTime()) { flag = 'automatic-extension'; notes.push(`An application on ${say(submitted)} is at least 45 days before expiration, so the automatic extension in 1301.36(i) applies if DEA has not acted by ${say(expires)}.`); }
    else if (submitted.getTime() <= expires.getTime()) { flag = 'inside-45-days'; notes.push(`An application on ${say(submitted)} is before expiration but inside the last 45 days. The rule's automatic extension does not cover it; 1301.36(i) says the Administrator may extend such a registration, and DEA's page says a renewal submitted in a timely manner before expiration lets the registrant continue until final action. The two statements are shown as written.`); }
    else if (submitted.getTime() <= reinstateEnd.getTime()) { flag = 'reinstatement-month'; notes.push(`An application on ${say(submitted)} is after expiration and inside the reinstatement month in DEA's policy.`); }
    else { flag = 'new-application'; notes.push(`An application on ${say(submitted)} is after the reinstatement month; DEA's page says a new application is required.`); }
  }
  let where = '';
  const today = todayUtc(now);
  if (today) {
    const n = Math.round((expires.getTime() - today.getTime()) / 86400000);
    where = today.getTime() < earliest.getTime() ? `Today is before the renewal window, which opens in ${Math.round((earliest.getTime() - today.getTime()) / 86400000)} days.`
      : today.getTime() <= mark45.getTime() ? `Today is inside the renewal window with the 45-day mark still ahead; expiration is in ${n} days.`
        : today.getTime() <= expires.getTime() ? `Today is inside the last 45 days; expiration is ${n === 0 ? 'today' : `in ${n} days`}.`
          : today.getTime() <= reinstateEnd.getTime() ? `The registration expired ${-n} days ago; today is inside the reinstatement month.`
            : `The registration expired ${-n} days ago and the reinstatement month has ended.`;
    notes.push(where);
    out.abnormal = today.getTime() > mark45.getTime();
  }
  notes.push('This is the federal rule. A state license or controlled-substance registration has its own dates.');
  return { ...out, flag, band: `Renew between ${say(earliest)} and ${say(mark45)}; the registration expires ${say(expires)}.`, bandLabel: where ? where.split(';')[0].replace(/\.$/, '') : 'Renewal dates', notes, note: notes.join(' ') };
}
