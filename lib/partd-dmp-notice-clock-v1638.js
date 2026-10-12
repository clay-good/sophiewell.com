// spec-v1638 tool 9: Part D drug management program notice and limitation dates.
//
// Source: 42 CFR 423.153(f), read on eCFR as current October 8, 2026 (re-read October 12, 2026).
//   (f)(5)(ii)(C)(4)  the initial notice asks the beneficiary to submit information "within 30
//     days of the date of this initial notice".
//   (f)(8)(i)  the second notice or alternate second notice goes out "on a date that is not less
//     than 30 days after the date of the initial notice ... and not more than the earlier of the
//     following two dates: (A) Within 3 days of the date the sponsor makes the relevant
//     determination. (B) Sixty days after the date of the initial notice".
//   (f)(8)(ii)  for a beneficiary "determined ... to be exempt, the sponsor must provide the
//     alternate second notice within 3 days of the date the sponsor makes the relevant
//     determination, even if such determination is made less than 30 days from the date of the
//     initial notice".
//   (f)(4)(ii)(A)  prescribers "not responsive after 3 attempts by the sponsor to contact them
//     within 10 business days" satisfies the duty to seek their agreement; (B) a prescriber
//     limitation may not be imposed if no prescriber was responsive.
//   (f)(14)(ii)  the identification ends at "the end of a one year period calculated from the
//     effective date of the limitation", or two years where it was extended.
//   (f)(15)(ii)(D)  information to CMS "no later than 7 days from the date of the initial notice
//     or second notice ... or ... of a termination date".
// Every clock here is in days, not business days, except the 10 business days of prescriber
// outreach. A determination that the member is not exempt made earlier than day 27 leaves no
// date that meets both limits in (f)(8)(i); the tool flags that and prints no notice date for it.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc, addMonthsUtc, isBusinessDay } from './deadline.js';

const opt = (value, text) => ({ value, text });
export const FOUND = [opt('found-exempt', 'The member was found exempt'), opt('found-not-exempt', 'Not exempt')];
export const EXTENDED = [opt('limitation-extended', 'Extended to a second year'), opt('limitation-not-extended', 'Not extended')];
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }
function addBusinessDays(d, n) { let x = d; let left = n; while (left > 0) { x = addCalendarDaysUtc(x, 1); if (isBusinessDay(x)) left -= 1; } return x; }
const earlier = (a, b) => (a.getTime() <= b.getTime() ? a : b);

export function partdDmpNoticeClock(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const initial = date(o.initialNotice);
  if (!initial) return { valid: false, message: 'Enter the date of the initial notice.' };
  const opt2 = {};
  for (const [k, label] of [['determination', 'the determination date'], ['secondNoticeSent', 'the date the second notice was sent'], ['limitationEffective', 'the effective date of the limitation']]) {
    if (blank(o[k])) { opt2[k] = null; continue; }
    opt2[k] = date(o[k]);
    if (!opt2[k]) return { valid: false, message: `Enter ${label} as a real date, or leave it blank.` };
  }
  const day30 = addCalendarDaysUtc(initial, 30); const day60 = addCalendarDaysUtc(initial, 60);
  const notes = [`Initial notice ${say(initial)}. The member's 30 days to send information run through ${say(day30)} (42 CFR 423.153(f)(5)(ii)(C)(4)).`];
  const out = { valid: true, responsePeriodEnds: fmtUtc(day30), secondNoticeEarliest: fmtUtc(day30), secondNoticeLatest: fmtUtc(day60) };
  const problems = [];
  let earliest = day30; let latest = day60; let conflict = false;
  if (opt2.determination) {
    if (opt2.determination.getTime() < initial.getTime()) return { valid: false, message: 'Enter a determination date that is not before the initial notice.' };
    const found = FOUND.find((f) => f.value === String(o.found ?? '').trim());
    if (!found) return { valid: false, message: 'Choose whether the member was found exempt: an exempt member\'s notice is due within 3 days of the determination, even inside the first 30 days.' };
    const plus3 = addCalendarDaysUtc(opt2.determination, 3);
    if (found.value === 'found-exempt') {
      earliest = opt2.determination; latest = plus3;
      out.secondNoticeEarliest = fmtUtc(earliest); out.secondNoticeLatest = fmtUtc(latest);
      notes.push(`Found exempt on ${say(opt2.determination)}: the alternate second notice is due within 3 days of that determination, by ${say(plus3)}, even though it may fall inside the first 30 days (423.153(f)(8)(ii)).`);
    } else {
      latest = earlier(plus3, day60);
      if (latest.getTime() < day30.getTime()) {
        conflict = true; problems.push('no date meets both limits');
        out.secondNoticeEarliest = null; out.secondNoticeLatest = null;
        notes.push(`Determination ${say(opt2.determination)}: 3 days after it is ${say(plus3)}, which is before the 30th day after the initial notice, ${say(day30)}. No date is both "not less than 30 days after the initial notice" and "within 3 days of the determination" (423.153(f)(8)(i)). The rule does not resolve this for a member who is not exempt, and no notice date is given here.`);
      } else {
        out.secondNoticeLatest = fmtUtc(latest);
        notes.push(`Determination ${say(opt2.determination)}: the second notice goes out no earlier than ${say(day30)} and no later than ${say(latest)}, the earlier of 3 days after the determination (${say(plus3)}) and 60 days after the initial notice (${say(day60)}) (423.153(f)(8)(i)).`);
      }
    }
  } else notes.push(`No determination date was entered. The second notice goes out no earlier than ${say(day30)}, and no later than 3 days after the determination or ${say(day60)} (60 days after the initial notice), whichever is earlier (423.153(f)(8)(i)).`);
  if (opt2.secondNoticeSent && !conflict) {
    const sent = opt2.secondNoticeSent;
    const early = sent.getTime() < earliest.getTime(); const late = sent.getTime() > latest.getTime();
    out.secondNoticeInWindow = !early && !late;
    if (early) problems.push('second notice sent too early');
    if (late) problems.push('second notice sent too late');
    notes.push(`Second notice sent ${say(sent)}: ${early ? `before the earliest date, ${say(earliest)}` : late ? `after the latest date, ${say(latest)}` : 'inside the window'}.`);
  }
  const attempts = [];
  for (const raw of String(o.outreachAttempts ?? '').split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean)) {
    const d = date(raw);
    if (!d) return { valid: false, message: `Enter each prescriber outreach attempt as YYYY-MM-DD. "${raw.slice(0, 20)}" was not read.` };
    attempts.push(d);
  }
  if (attempts.length) {
    attempts.sort((a, b) => a.getTime() - b.getTime());
    const windowEnd = addBusinessDays(attempts[0], 10);
    const inWindow = attempts.filter((d) => d.getTime() <= windowEnd.getTime()).length;
    out.outreachAttemptsInWindow = inWindow;
    notes.push(`Prescriber outreach: ${inWindow} attempt${inWindow === 1 ? '' : 's'} within 10 business days of the first on ${say(attempts[0])} (through ${say(windowEnd)}). ${inWindow >= 3 ? 'Three attempts in 10 business days with no response meets the requirement to seek prescriber agreement' : 'Three attempts within 10 business days are needed before unresponsive prescribers count as having been asked'} (423.153(f)(4)(ii)(A)). A prescriber limitation still cannot be imposed if no prescriber responded (423.153(f)(4)(ii)(B)).`);
  }
  if (opt2.limitationEffective) {
    const ext = EXTENDED.find((e) => e.value === String(o.extended ?? '').trim());
    if (!ext) return { valid: false, message: 'Choose whether the limitation was extended to a second year.' };
    const end = addMonthsUtc(opt2.limitationEffective, ext.value === 'limitation-extended' ? 24 : 12);
    out.limitationEnds = fmtUtc(end);
    notes.push(`Limitation effective ${say(opt2.limitationEffective)}: it ends ${say(end)}, ${ext.value === 'limitation-extended' ? 'two years' : 'one year'} from its effective date, or sooner on a later determination or successful appeal (423.153(f)(14)). An extension needs a clinical basis, prescriber agreement and another notice.`);
  }
  notes.push('The sponsor reports to CMS no later than 7 days from the initial notice, from the second notice, and from a termination date (423.153(f)(15)(ii)(D)). All of these are calendar days; only the prescriber outreach is in business days.');
  return { ...out, problems, flag: conflict ? 'no-date-meets-both-limits' : problems.length ? 'notice-outside-its-window' : 'dates', abnormal: problems.length > 0, band: conflict ? 'No second-notice date meets both limits for this determination.' : `Second notice between ${say(earliest)} and ${say(latest)}.`, bandLabel: problems.length ? problems.join('; ') : 'Notice window', notes, note: notes.join(' ') };
}
