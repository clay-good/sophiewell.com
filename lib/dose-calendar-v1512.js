// spec-v1512 tool 2: loading and maintenance dose calendar.
//
// Dates from the schedule the reader enters as the label states it: dose 1 at week 0 (the start date), up
// to two more loading doses at the weeks given, then maintenance every N weeks after the last loading dose.
// For example, the Remicade label for Crohn's disease: 0, 2 and 6 weeks, then every 8 weeks (DailyMed setid
// a0a046c1-056d-45a9-bfd9-13b47c24f257). An allowed window (reader input, from the protocol) gives each
// dose's earliest and latest date; weekend and federal-holiday dates are flagged. When a dose was actually
// given on another date, later doses are re-anchored from it at the same spacing.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { parseIsoStrict, addCalendarDaysUtc, isBusinessDay, isFederalHoliday, fmtUtc } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';

const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function doseCalendar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const start = date(o.startDate);
  if (!start) return { valid: false, message: 'Enter the date of the first dose (YYYY-MM-DD).' };
  const f = inputFault([['the maintenance interval', o.everyWeeks, 1, 52, 'weeks']]);
  if (f) return { valid: false, message: f };
  const every = Number(o.everyWeeks);
  if (!Number.isInteger(every)) return { valid: false, message: 'Enter the maintenance interval as whole weeks.' };
  const weeks = [0];
  for (const k of [2, 3]) {
    const w = String(o[`loadWeek${k}`] ?? '').trim();
    if (!w) continue;
    const wf = inputFault([[`the week of loading dose ${k}`, w, 1, 52, 'weeks']]);
    if (wf) return { valid: false, message: wf };
    const n = Number(w);
    if (!Number.isInteger(n) || n <= weeks[weeks.length - 1]) return { valid: false, message: `Enter loading dose ${k}'s week as a whole number after the previous dose's week.` };
    weeks.push(n);
  }
  const notes = [];
  const has2 = Boolean(String(o.loadWeek2 ?? '').trim());
  const has3 = Boolean(String(o.loadWeek3 ?? '').trim());
  if (!has2 && !has3) notes.push(`No further loading doses were entered: maintenance starts ${every} weeks after the first dose.`);
  else if (!has2) notes.push(`Loading dose 2 was not entered, so the week-${weeks[1]} dose is taken as the second.`);
  else if (!has3) notes.push('A third loading dose was not entered.');
  let count = 6;
  if (String(o.maintenanceDoses ?? '').trim()) {
    const cf = inputFault([['the number of maintenance doses to show', o.maintenanceDoses, 1, 26, '']]);
    if (cf) return { valid: false, message: cf };
    count = Math.round(Number(o.maintenanceDoses));
  } else notes.push('The number of maintenance doses was not entered, so 6 are shown.');
  let win = 0;
  if (String(o.windowDays ?? '').trim()) {
    const wf = inputFault([['the allowed window', o.windowDays, 0, 14, 'days']]);
    if (wf) return { valid: false, message: wf };
    win = Math.round(Number(o.windowDays));
  }
  // Gaps in days between consecutive doses: loading gaps, then maintenance gaps.
  const gaps = [];
  for (let i = 1; i < weeks.length; i += 1) gaps.push((weeks[i] - weeks[i - 1]) * 7);
  for (let i = 0; i < count; i += 1) gaps.push(every * 7);
  let anchorIdx = 0;
  let anchorDate = start;
  if (String(o.actualDate ?? '').trim() || String(o.actualDose ?? '').trim()) {
    const ad = date(o.actualDate);
    if (!ad) return { valid: false, message: 'Enter the date the dose was actually given (YYYY-MM-DD), with its dose number.' };
    const df = inputFault([['the dose number given on that date', o.actualDose, 1, gaps.length + 1, '']]);
    if (df) return { valid: false, message: df };
    anchorIdx = Math.round(Number(o.actualDose)) - 1;
    anchorDate = ad;
    notes.push(`Doses after dose ${anchorIdx + 1} are counted from ${longDate(ad)}, when it was actually given.`);
  }
  const dates = [start];
  for (let i = 0; i < gaps.length; i += 1) {
    const base = i === anchorIdx ? anchorDate : dates[i];
    dates.push(addCalendarDaysUtc(base, gaps[i]));
  }
  if (anchorIdx > 0) dates[anchorIdx] = anchorDate;
  const flagged = [];
  const lines = dates.map((d, i) => {
    const kind = i < weeks.length ? `Loading dose ${i + 1}` : `Maintenance dose ${i - weeks.length + 1}`;
    const off = !isBusinessDay(d);
    if (off) flagged.push(i + 1);
    const flag = off ? ` (${isFederalHoliday(d) ? 'federal holiday' : DOW[d.getUTCDay()]})` : '';
    const range = win && i > 0 && i !== anchorIdx ? `; window ${longDate(addCalendarDaysUtc(d, -win))} to ${longDate(addCalendarDaysUtc(d, win))}` : '';
    return `${kind}: ${longDate(d)}${flag}${range}.`;
  });
  notes.unshift(...lines);
  if (!win) notes.push('No allowed window was entered; add the protocol\'s window (for example, 3 days) to see each dose\'s earliest and latest date.');
  const last = dates[dates.length - 1];
  return {
    valid: true,
    dates: dates.map(fmtUtc),
    band: `${dates.length} doses from ${longDate(start)} through ${longDate(last)}: loading at week${weeks.length > 1 ? 's' : ''} ${weeks.join(', ')}, then every ${every} weeks.${flagged.length ? ` Dose${flagged.length > 1 ? 's' : ''} ${flagged.join(', ')} fall${flagged.length > 1 ? '' : 's'} on a weekend or federal holiday.` : ''}`,
    bandLabel: `${dates.length} doses to ${fmtUtc(last)}`,
    notes,
    note: 'Dates from the schedule entered; the order and the label govern each dose.',
  };
}
