// spec-v1637 tool 6: the report clock for a theft or significant loss of controlled substances.
//
// Source: 21 CFR 1301.76(b) and 1301.74(c), read on eCFR as current October 8, 2026 (re-read
// October 12, 2026).
//   1301.76(b)  practitioners and pharmacies: "shall notify the Field Division Office of the
//     Administration in his area, in writing, of the theft or significant loss of any controlled
//     substances within one business day of discovery of such loss or theft. The registrant must
//     also file a complete and accurate DEA Form 106 ... within 45 days after discovery". Then six
//     factors a registrant "should consider, among others" in deciding whether a loss is
//     significant.
//   1301.74(c)  non-practitioners: the same one business day; Form 106 "within 45 calendar days
//     after discovery". "Thefts and significant losses must be reported whether or not the
//     controlled substances are subsequently recovered".
//
// "Business day" is not defined in 21 CFR 1300.01. The tool skips Saturdays, Sundays, federal
// holidays (5 U.S.C. 6103) and any closed days the reader lists, and says so. The 45 days are
// calendar days; 1301.76(b) says "45 days" where 1301.74(c) says "45 calendar days".
// The clock starts at discovery, not at the loss. The tool does not decide significance.
//
// Pure: the clock is a parameter.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc, isBusinessDay, isFederalHoliday } from './deadline.js';

export const REGISTRANTS = [
  { value: 'practitioner-or-pharmacy', text: 'Practitioner or pharmacy (1301.76)' },
  { value: 'non-practitioner-registrant', text: 'Non-practitioner: manufacturer, distributor, importer and others (1301.74)' },
];
export const FACTORS = [
  'The actual quantity of controlled substances lost in relation to the type of business.',
  'The specific controlled substances lost.',
  'Whether the loss can be associated with access by specific individuals, or attributed to unique activities involving the controlled substances.',
  'A pattern of losses over a specific time period, whether the losses appear to be random, and the results of efforts taken to resolve them.',
  'If known, whether the specific controlled substances are likely candidates for diversion.',
  'If known, local trends and other indicators of the diversion potential of the missing controlled substance.',
];
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
const todayUtc = (now) => (now instanceof Date && !Number.isNaN(now.getTime()) ? new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) : null);

export function csTheftLossClock(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const who = REGISTRANTS.find((r) => r.value && r.value === String(o.registrant ?? '').trim());
  if (!who) return { valid: false, message: 'Choose the registrant: a practitioner or pharmacy, or a non-practitioner. Each has its own paragraph.' };
  const found = date(o.discovered);
  if (!found) return { valid: false, message: 'Enter the date the theft or loss was discovered. The clock starts at discovery, not at the loss.' };
  const closed = new Set();
  for (const raw of String(o.closedDays ?? '').split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean)) {
    const d = date(raw);
    if (!d) return { valid: false, message: `Enter each closed day as YYYY-MM-DD. "${raw.slice(0, 20)}" was not read.` };
    closed.add(fmtUtc(d));
  }
  if (closed.size > 30) return { valid: false, message: 'Enter no more than 30 closed days.' };
  let notice = addCalendarDaysUtc(found, 1);
  const skipped = [];
  for (let i = 0; i < 60 && (!isBusinessDay(notice) || closed.has(fmtUtc(notice))); i += 1) {
    skipped.push(`${fmtUtc(notice)} (${closed.has(fmtUtc(notice)) && isBusinessDay(notice) ? 'entered as closed' : isFederalHoliday(notice) ? 'federal holiday' : 'weekend'})`);
    notice = addCalendarDaysUtc(notice, 1);
  }
  const form = addCalendarDaysUtc(found, 45);
  const para = who.value === 'practitioner-or-pharmacy' ? '1301.76(b)' : '1301.74(c)';
  const notes = [
    `Written notice to the DEA Field Division Office: within one business day of discovery, so by ${say(notice)} (21 CFR ${para}).${skipped.length ? ` Days not counted as business days: ${skipped.join(', ')}.` : ''}`,
    `"Business day" is not defined in the regulations. This skips Saturdays, Sundays, federal holidays and the closed days entered.${skipped.length ? ` Read most strictly, the day after discovery is ${say(addCalendarDaysUtc(found, 1))}.` : ''}`,
    `DEA Form 106, complete and accurate, filed online: within 45 ${who.value === 'practitioner-or-pharmacy' ? 'days' : 'calendar days'} after discovery, so by ${say(form)} (${para}). The count is calendar days, with no weekend or holiday extension in the rule.`,
    'A theft is reported whatever its size. A loss is reported when it is significant, and the rule lists six factors to consider, among others; the tool does not decide significance:',
    ...FACTORS.map((f, i) => `(${i + 1}) ${f}`),
  ];
  if (who.value === 'non-practitioner-registrant') notes.push('Thefts and significant losses must be reported whether or not the substances are later recovered or the responsible parties identified (1301.74(c)).');
  const out = { valid: true, noticeDue: fmtUtc(notice), form106Due: fmtUtc(form) };
  let where = 'Report deadlines';
  const today = todayUtc(now);
  if (today) {
    const n1 = Math.round((notice.getTime() - today.getTime()) / 86400000); const n2 = Math.round((form.getTime() - today.getTime()) / 86400000);
    out.abnormal = n1 < 0;
    where = n1 > 0 ? `Notice due in ${n1} day${n1 === 1 ? '' : 's'}` : n1 === 0 ? 'Notice due today' : n2 >= 0 ? `Notice was due ${-n1} day${n1 === -1 ? '' : 's'} ago; Form 106 due in ${n2} day${n2 === 1 ? '' : 's'}` : `Form 106 was due ${-n2} day${n2 === -1 ? '' : 's'} ago`;
    notes.push(`${where}.`);
  }
  notes.push('State boards of pharmacy commonly require their own report, often sooner.');
  return { ...out, flag: out.abnormal ? 'notice-past-due' : 'deadlines', band: `Written notice by ${say(notice)}; DEA Form 106 by ${say(form)}.`, bandLabel: where, notes, note: notes.join(' ') };
}
