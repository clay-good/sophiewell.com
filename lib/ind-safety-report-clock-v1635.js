// spec-v1635 tool 19: IND safety report deadlines.
//
// Source: 21 CFR 312.32 and 312.64, read on eCFR as current October 8, 2026 (re-read October 11, 2026):
//   312.32(c)(1)   an IND safety report "as soon as possible, but in no case later than 15 calendar
//                  days after the sponsor determines that the information qualifies for reporting".
//   312.32(c)(2)   an unexpected fatal or life-threatening suspected adverse reaction "as soon as
//                  possible but in no case later than 7 calendar days after the sponsor's initial
//                  receipt of the information".
//   312.32(c)(1)(v) additional data FDA asks for "no later than 15 calendar days after receiving the
//                  request".
//   312.32(d)(3)   an event later found reportable: "no later than 15 calendar days after the
//                  determination is made" (the same count from the determination).
//   312.64(b)      an investigator "must immediately report to the sponsor any serious adverse
//                  event, whether or not considered drug related". No day count: the tool prints the
//                  word and counts nothing.
// The definitions of serious, life-threatening, unexpected and suspected adverse reaction are in
// 312.32(a) and are carried as a checklist. eCFR links an amendment published September 22, 2026
// that is not yet in effect; this follows the text in force on the day it was read.
//
// Pure: the clock is a parameter.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc } from './deadline.js';

export const ROLES = [
  { value: 'sponsor', text: 'Sponsor or sponsor-investigator' },
  { value: 'investigator', text: 'Investigator' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
const CHECKLIST = [
  'Serious (312.32(a)): death, a life-threatening adverse event, inpatient hospitalization or prolongation of one, a persistent or significant incapacity or substantial disruption of the ability to conduct normal life functions, a congenital anomaly or birth defect, or an important medical event by medical judgment, in the view of either the investigator or the sponsor.',
  'Life-threatening: its occurrence places the subject at immediate risk of death; not an event that might have caused death had it been more severe.',
  'Unexpected: not listed in the investigator brochure, or not at the specificity or severity observed.',
  'Suspected adverse reaction: an adverse event for which there is a reasonable possibility that the drug caused it, meaning evidence to suggest a causal relationship.',
];
const NOTE = 'The dates are the outer limits in the rule, which says "as soon as possible" first, and they are calendar days with no weekend or holiday extension. FDA may require, or agree to, a different format or frequency (312.32(c)(3)). The tool does not decide whether an event is serious, unexpected or a suspected adverse reaction; the sponsor\'s determination is an input. Postmarketing reports are a different rule.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
function left(due, now) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) return '';
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const n = Math.round((due.getTime() - today) / 86400000);
  return n > 0 ? ` That is ${n} day${n === 1 ? '' : 's'} from today.` : n === 0 ? ' That is today.' : ` That was ${-n} day${n === -1 ? '' : 's'} ago.`;
}

export function indSafetyReportClock(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const role = ROLES.find((r) => r.value === String(o.role ?? '').trim());
  if (!role) return { valid: false, message: 'Choose who is reporting: the sponsor (or sponsor-investigator), or an investigator. The rules differ.' };
  if (role.value === 'investigator') {
    return { valid: true, flag: 'investigator-immediately', abnormal: false, band: 'An investigator must immediately report any serious adverse event to the sponsor, whether or not it is considered drug related (21 CFR 312.64(b)). The rule gives no number of days.', bandLabel: 'Immediately', notes: ['The report must include an assessment of whether there is a reasonable possibility that the drug caused the event.', 'Study endpoints that are serious adverse events are reported as the protocol says, unless there is evidence suggesting a causal relationship.', CHECKLIST[0], '21 CFR 312.64(b).'], note: NOTE };
  }
  const fatal = YES_NO.find((y) => y.value === String(o.fatalOrLifeThreatening ?? '').trim());
  if (!fatal) return { valid: false, message: 'Choose whether this is an unexpected fatal or life-threatening suspected adverse reaction: it has a second, 7-day deadline.' };
  const determined = date(o.determined);
  if (!determined) return { valid: false, message: 'Enter the date the sponsor determined that the information qualifies for reporting.' };
  const dates = []; const notes = [];
  const fifteen = addCalendarDaysUtc(determined, 15);
  dates.push({ report: 'IND safety report', due: fmtUtc(fifteen), paragraph: '312.32(c)(1)' });
  notes.push(`IND safety report: no later than ${say(fifteen)}, 15 calendar days after the determination on ${say(determined)} (312.32(c)(1)). The same count applies to an event first judged not reportable and later found to be (312.32(d)(3)).`);
  let first = fifteen; let firstName = 'IND safety report';
  if (fatal.value === 'yes') {
    const received = date(o.received);
    if (!received) return { valid: false, message: 'Enter the date the sponsor first received the information: the 7-day deadline for a fatal or life-threatening reaction runs from it.' };
    if (received.getTime() > determined.getTime()) return { valid: false, message: 'The information was received after the date it was determined to qualify. Check the two dates.' };
    const seven = addCalendarDaysUtc(received, 7);
    dates.unshift({ report: '7-day notification', due: fmtUtc(seven), paragraph: '312.32(c)(2)' });
    notes.unshift(`Unexpected fatal or life-threatening suspected adverse reaction: notify FDA no later than ${say(seven)}, 7 calendar days after initial receipt on ${say(received)} (312.32(c)(2)).`);
    if (seven.getTime() <= fifteen.getTime()) { first = seven; firstName = '7-day notification'; }
  }
  if (!blank(o.fdaRequest)) {
    const req = date(o.fdaRequest);
    if (!req) return { valid: false, message: 'Enter the date of the FDA request as a date, or leave it blank.' };
    const more = addCalendarDaysUtc(req, 15);
    dates.push({ report: 'Additional data FDA requested', due: fmtUtc(more), paragraph: '312.32(c)(1)(v)' });
    notes.push(`Additional data FDA requested on ${say(req)}: no later than ${say(more)}, 15 calendar days after receiving the request (312.32(c)(1)(v)).`);
  }
  notes.push('Relevant follow-up information is submitted as soon as it is available, marked as a follow-up IND safety report (312.32(d)(2)); the rule gives it no day count.', ...CHECKLIST, '21 CFR 312.32.');
  const today = now instanceof Date && !Number.isNaN(now.getTime()) ? Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) : null;
  return { valid: true, flag: fatal.value === 'yes' ? 'seven-and-fifteen-day' : 'fifteen-day', abnormal: today !== null && first.getTime() < today, dates, band: `${firstName} due no later than ${say(first)}.${left(first, now)}${dates.length > 1 ? ` ${dates.length} deadlines in all.` : ''}`, bandLabel: `Due ${say(first)}`, notes, note: NOTE };
}
