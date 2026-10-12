// spec-v1635 tool 21: when an IND goes into effect, its annual report windows, and the
// new-investigator notice.
//
// Source: 21 CFR 312.40, 312.33 and 312.30, read on eCFR as current October 8, 2026 (re-read
// October 11, 2026):
//   312.40(b)  "An IND goes into effect: (1) Thirty days after FDA receives the IND, unless FDA
//              notifies the sponsor that the investigations ... are subject to a clinical hold ...;
//              or (2) On earlier notification by FDA that the clinical investigations in the IND
//              may begin."
//   312.33     "A sponsor shall within 60 days of the anniversary date that the IND went into
//              effect, submit a brief report of the progress of the investigation".
//   312.30(c)  "The sponsor shall notify FDA of the new investigator within 30 days of the
//              investigator being added."
// Calendar days. A clinical hold is not modeled: the tool says the 30-day date assumes none.
//
// Pure: the clock is a parameter.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc, addMonthsUtc } from './deadline.js';

const NOTE = 'Calendar days, as the rules state them, with no weekend or holiday extension. The 30-day effective date assumes FDA placed no clinical hold. Whether "within 60 days of the anniversary" may also mean before it is not settled by the rule\'s words; the tool gives the anniversary and the date 60 days after it.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function indAnnualReportDue(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const hasReceived = !blank(o.received); const hasEarlier = !blank(o.mayBegin); const hasInvestigator = !blank(o.investigatorAdded);
  if (!hasReceived && !hasEarlier && !hasInvestigator) return { valid: false, message: 'Enter the date FDA received the IND (or the earlier date FDA said the study may begin), or the date a new investigator was added.' };
  const out = { valid: true, flag: 'ind-dates', abnormal: false }; const notes = []; const bands = [];
  let effective = null;
  if (hasReceived || hasEarlier) {
    const received = hasReceived ? date(o.received) : null; const earlier = hasEarlier ? date(o.mayBegin) : null;
    if (hasReceived && !received) return { valid: false, message: 'Enter the date FDA received the IND as a date.' };
    if (hasEarlier && !earlier) return { valid: false, message: 'Enter the date FDA said the study may begin as a date.' };
    const thirty = received ? addCalendarDaysUtc(received, 30) : null;
    if (earlier && thirty && earlier.getTime() > thirty.getTime()) return { valid: false, message: 'The date FDA said the study may begin is later than 30 days after receipt. The rule covers only an earlier notification; check the dates or leave that field blank.' };
    if (earlier && received && earlier.getTime() < received.getTime()) return { valid: false, message: 'The date FDA said the study may begin is before the date it received the IND. Check the two dates.' };
    effective = earlier || thirty;
    notes.push(earlier ? `In effect on ${say(effective)}: FDA's earlier notification that the investigations may begin (312.40(b)(2)).` : `In effect on ${say(effective)}: 30 days after FDA received the IND on ${say(received)}, unless FDA placed a clinical hold (312.40(b)(1)).`);
    // The next three anniversaries whose 60-day date has not passed.
    const today = now instanceof Date && !Number.isNaN(now.getTime()) ? Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) : effective.getTime();
    const reports = [];
    for (let y = 1; reports.length < 3 && y < 80; y += 1) {
      const anniversary = addMonthsUtc(effective, 12 * y); const due = addCalendarDaysUtc(anniversary, 60);
      if (due.getTime() >= today) reports.push({ year: y, anniversary: fmtUtc(anniversary), due: fmtUtc(due), a: anniversary, d: due });
    }
    out.effective = fmtUtc(effective); out.annualReports = reports.map(({ year, anniversary, due }) => ({ year, anniversary, due }));
    for (const r of reports) notes.push(`Annual report ${r.year}: anniversary ${say(r.a)}; 60 days after it is ${say(r.d)} (312.33).`);
    bands.push(`IND in effect ${say(effective)}; next annual report within 60 days of ${say(reports[0].a)} (by ${say(reports[0].d)})`);
  }
  if (hasInvestigator) {
    const added = date(o.investigatorAdded);
    if (!added) return { valid: false, message: 'Enter the date the new investigator was added as a date.' };
    const notice = addCalendarDaysUtc(added, 30);
    out.investigatorNoticeDue = fmtUtc(notice);
    notes.push(`New investigator added ${say(added)}: notify FDA by ${say(notice)}, within 30 days (312.30(c)).`);
    bands.push(`new-investigator notice by ${say(notice)}`);
  }
  notes.push('21 CFR 312.30, 312.33, 312.40.');
  const band = `${bands.join('; ')}.`;
  return { ...out, band: band[0].toUpperCase() + band.slice(1), bandLabel: effective ? `In effect ${say(effective)}` : `Notice by ${say(parseIsoStrict(out.investigatorNoticeDue))}`, notes, note: NOTE };
}
