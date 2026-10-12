// spec-v1638 tool 20: a monthly medication regimen review tracker for a nursing facility.
//
// Source: 42 CFR 483.45(c), read on eCFR as current October 8, 2026 (re-read October 12, 2026).
//   (c)(1)  "The drug regimen of each resident must be reviewed at least once a month by a
//     licensed pharmacist."
//   (c)(4)  the pharmacist reports irregularities to the attending physician, the medical director
//     and the director of nursing, "and these reports must be acted upon"; (iii) the attending
//     physician documents that the irregularity "has been reviewed and what, if any, action has
//     been taken".
//   (c)(5)  the facility's policies set "time frames for the different steps in the process".
// The rule sets no number of days for the physician's response: it has the facility set its own.
// The tool asks for that number and invents none. "Once a month" is read as once in each calendar
// month, and the result says that is the reading used. Short-stay residents are not exempt.
//
// Pure: no DOM, no clock, no network. "Today" is the as-of date the reader enters.

import { rowsOf } from './csv-rows.js';
import { parseIsoStrict, fmtUtc } from './deadline.js';
import { inputFault } from './num.js';

const MAX_ROWS = 2000;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const clean = (v) => String(v === undefined || v === null ? '' : v).trim();
function date(v) { try { return parseIsoStrict(clean(v)); } catch { return null; } }
const monthKey = (d) => d.getUTCFullYear() * 12 + d.getUTCMonth();
const monthName = (k) => new Date(Date.UTC(Math.floor(k / 12), k % 12, 1)).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long' });
const days = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);

export function ltcMrrTracker(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const asOf = date(o.asOf);
  if (!asOf) return { valid: false, message: 'Enter the as-of date: the day the list is being checked. The tool reads no clock.' };
  const rows = rowsOf(String(o.residents ?? '')).filter((r) => r.some((c) => clean(c) !== ''));
  if (!rows.length) return { valid: false, message: 'Enter the residents, one per line: resident, admission date, date of the last pharmacist review, date an irregularity report was sent, date the physician documented a response. The last three may be blank.' };
  if (rows.length > MAX_ROWS) return { valid: false, message: `Enter no more than ${MAX_ROWS.toLocaleString('en-US')} residents.` };
  let frame = null;
  if (!blank(o.responseDays)) {
    const f = inputFault([['the facility\'s own time frame for the physician\'s response', o.responseDays, 1, 365, 'days']]);
    if (f) return { valid: false, message: f };
    frame = Number(o.responseDays);
  }
  const unread = []; const missed = []; const pending = []; const open = [];
  let counted = 0;
  rows.forEach((cells, i) => {
    const [name = '', admittedRaw = '', reviewRaw = '', reportRaw = '', responseRaw = ''] = cells.map(clean);
    if (i === 0 && /^(resident|name|patient)\b/i.test(name) && !date(admittedRaw)) return;
    const line = `Row ${i + 1}`;
    if (!name) { unread.push(`${line}: no resident.`); return; }
    const admitted = date(admittedRaw);
    if (!admitted) { unread.push(`${line} (${name}): the admission date is not a date written as YYYY-MM-DD.`); return; }
    if (admitted.getTime() > asOf.getTime()) { unread.push(`${line} (${name}): admitted after the as-of date.`); return; }
    const opt = {};
    for (const [k, raw] of [['review', reviewRaw], ['report', reportRaw], ['response', responseRaw]]) {
      if (raw === '') { opt[k] = null; continue; }
      opt[k] = date(raw);
      if (!opt[k]) { opt.bad = `${line} (${name}): "${raw.slice(0, 20)}" is not a date written as YYYY-MM-DD.`; break; }
    }
    if (opt.bad) { unread.push(opt.bad); return; }
    counted += 1;
    const now = monthKey(asOf);
    // Calendar months of the stay, before the current one, with no review on record.
    const from = opt.review ? monthKey(opt.review) + 1 : monthKey(admitted);
    const gap = [];
    for (let k = Math.max(from, monthKey(admitted)); k < now; k += 1) gap.push(monthName(k));
    const since = opt.review ? days(asOf, opt.review) : days(asOf, admitted);
    if (gap.length) missed.push({ name, months: gap, daysSince: since, never: !opt.review });
    const thisMonth = opt.review && monthKey(opt.review) === now;
    if (!thisMonth) pending.push({ name, daysSince: since, never: !opt.review });
    if (opt.report && !opt.response) {
      const waiting = days(asOf, opt.report);
      open.push({ name, sent: fmtUtc(opt.report), daysWaiting: waiting, overdue: frame === null ? null : waiting > frame });
    }
  });
  if (!counted) return { valid: false, message: `Enter at least one resident row that can be read. ${unread.slice(0, 3).join(' ')}` };
  missed.sort((a, b) => b.daysSince - a.daysSince); pending.sort((a, b) => b.daysSince - a.daysSince); open.sort((a, b) => b.daysWaiting - a.daysWaiting);
  const notes = [`${counted} resident${counted === 1 ? '' : 's'} as of ${asOf.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}. "At least once a month" is read here as once in each calendar month.`];
  for (const m of missed) notes.push(`${m.name}: no review on record for ${m.months.join(', ')}; ${m.daysSince} days since ${m.never ? 'admission, with no review recorded' : 'the last review'}.`);
  if (!missed.length) notes.push('No resident has a past calendar month of the stay without a review on record, going by the last review date entered.');
  const stillDue = pending.filter((p) => !missed.some((m) => m.name === p.name));
  if (stillDue.length) notes.push(`Not yet reviewed in ${monthName(monthKey(asOf))}, which has not ended: ${stillDue.map((p) => `${p.name} (${p.daysSince} days since ${p.never ? 'admission' : 'the last review'})`).join('; ')}.`);
  for (const r of open) notes.push(`${r.name}: irregularity report sent ${r.sent}, no physician response documented after ${r.daysWaiting} days${r.overdue === null ? '' : r.overdue ? `, past the facility's ${frame}-day time frame` : `, inside the facility's ${frame}-day time frame`}.`);
  if (open.length && frame === null) notes.push('No facility time frame was entered, so no open report is called overdue. The rule sets no number of days; it has the facility set its own in policy (42 CFR 483.45(c)(5)).');
  if (unread.length) notes.push(`${unread.length} row${unread.length === 1 ? '' : 's'} could not be read: ${unread.slice(0, 15).join(' ')}`);
  notes.push('Only the last review date is entered, so a month missed before it is not seen. Every resident needs a review at least once a month, short stay or long (483.45(c)(1)); the attending physician documents that each irregularity was reviewed and what action, if any, was taken (483.45(c)(4)(iii)).');
  const overdueReports = open.filter((r) => r.overdue).length;
  return { valid: true, residents: counted, missed, notYetThisMonth: stillDue, openReports: open, unread, flag: missed.length || overdueReports ? 'reviews-or-responses-overdue' : 'nothing-overdue', abnormal: missed.length > 0 || overdueReports > 0,
    band: `${missed.length} resident${missed.length === 1 ? '' : 's'} with a missed month; ${open.length} open irregularity report${open.length === 1 ? '' : 's'}.`,
    bandLabel: missed.length ? `Longest gap ${missed[0].daysSince} days` : stillDue.length ? `${stillDue.length} not yet reviewed this month` : 'Every resident reviewed this month', notes, note: notes.join(' ') };
}
