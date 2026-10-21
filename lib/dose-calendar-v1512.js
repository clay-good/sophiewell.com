// spec-v1512 tool 2: loading and maintenance dose calendar.
//
// Dates from the schedule the reader enters as the label states it: dose 1 at week 0 (the start date), up
// to two more loading doses at the weeks given, then maintenance every N weeks after the last loading dose.
// For example, the Remicade label for Crohn's disease: 0, 2 and 6 weeks, then every 8 weeks (DailyMed setid
// a0a046c1-056d-45a9-bfd9-13b47c24f257). An allowed window (reader input, from the protocol) gives each
// dose's earliest and latest date; weekend and federal-holiday dates are flagged. When a dose was actually
// given on another date, later doses are re-anchored from it at the same spacing.
//
// spec-v1635 backfill, cycle mode: when a cycle length is entered the tool lays out treatment cycles
// instead. Cycle 1 day 1 is the start date; each cycle has the treatment days entered (for example
// days 1, 8 and 15 of 28). It answers "what cycle and day is this date", and when a later cycle
// actually started on another date (a delay), that cycle and the ones after it are counted from the
// date entered. Arithmetic on the regimen the reader enters; nothing about the regimen is supplied.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { parseIsoStrict, addCalendarDaysUtc, isBusinessDay, isFederalHoliday, fmtUtc } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';

const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const filled = (v) => String(v ?? '').trim() !== '';

// Cycle mode. `start` is cycle 1 day 1.
function cycleCalendar(o, start) {
  for (const [key, label] of [['loadWeek2', 'loading dose 2'], ['loadWeek3', 'loading dose 3'], ['everyWeeks', 'the maintenance interval'], ['maintenanceDoses', 'the number of maintenance doses'], ['actualDose', 'the dose number given']]) {
    if (filled(o[key])) return { valid: false, message: `A cycle length was entered, so this is a cycle calendar: clear ${label}, which belongs to the loading and maintenance calendar.` };
  }
  const f = inputFault([['the cycle length', o.cycleLength, 1, 365, 'days'], ['the number of cycles', o.cycles, 1, 60, '']]);
  if (f) return { valid: false, message: f };
  const len = Number(o.cycleLength); const count = Number(o.cycles);
  if (!Number.isInteger(len) || !Number.isInteger(count)) return { valid: false, message: 'Enter the cycle length in whole days and the number of cycles as a whole number.' };
  const parts = String(o.treatmentDays ?? '').split(/[\s,;]+/).filter(Boolean);
  if (!parts.length) return { valid: false, message: 'Enter the treatment days within a cycle, separated by commas (for example 1, 8, 15).' };
  const days = [];
  for (const p of parts) {
    const n = Number(p);
    if (!/^\d+$/.test(p) || n < 1 || n > len) return { valid: false, message: `Treatment day "${p}" is not a whole day from 1 to ${len}, the cycle length.` };
    if (days.includes(n)) return { valid: false, message: `Treatment day ${n} is entered twice.` };
    days.push(n);
  }
  days.sort((a, b) => a - b);
  let win = 0;
  if (filled(o.windowDays)) {
    const wf = inputFault([['the allowed window', o.windowDays, 0, 14, 'days']]);
    if (wf) return { valid: false, message: wf };
    win = Math.round(Number(o.windowDays));
  }
  // Day 1 of each cycle: back to back, unless a later cycle actually started on another date.
  const firsts = [start];
  for (let c = 1; c < count; c += 1) firsts.push(addCalendarDaysUtc(firsts[c - 1], len));
  const notes = [];
  if (filled(o.delayedCycle) || filled(o.actualDate)) {
    const df = inputFault([['the number of the cycle that started on another date', o.delayedCycle, 2, count, '']]);
    if (df) return { valid: false, message: df };
    const k = Number(o.delayedCycle);
    const ad = date(o.actualDate);
    if (!Number.isInteger(k)) return { valid: false, message: 'Enter the delayed cycle as a whole cycle number.' };
    if (!ad) return { valid: false, message: `Enter the date cycle ${k} actually started (YYYY-MM-DD).` };
    const planned = firsts[k - 1];
    const shift = Math.round((ad - planned) / 86400000);
    if (ad <= firsts[k - 2]) return { valid: false, message: `Cycle ${k} cannot start on or before day 1 of cycle ${k - 1} (${longDate(firsts[k - 2])}).` };
    for (let c = k - 1; c < count; c += 1) firsts[c] = addCalendarDaysUtc(ad, (c - (k - 1)) * len);
    notes.push(`Cycle ${k} started ${longDate(ad)}, ${shift === 0 ? 'as planned' : `${Math.abs(shift)} day${Math.abs(shift) === 1 ? '' : 's'} ${shift > 0 ? 'later' : 'earlier'} than the planned ${longDate(planned)}`}; it and every later cycle are counted from that date.`);
  }
  const doses = []; const flagged = [];
  for (let c = 0; c < count; c += 1) for (const d of days) doses.push({ label: `Cycle ${c + 1} day ${d}`, at: addCalendarDaysUtc(firsts[c], d - 1), cycle: c + 1, day: d });
  const lines = doses.map((x) => {
    const off = !isBusinessDay(x.at);
    if (off) flagged.push(x.label);
    const flag = off ? ` (${isFederalHoliday(x.at) ? 'federal holiday' : DOW[x.at.getUTCDay()]})` : '';
    const range = win && !(x.cycle === 1 && x.day === days[0] && days[0] === 1) ? `; window ${longDate(addCalendarDaysUtc(x.at, -win))} to ${longDate(addCalendarDaysUtc(x.at, win))}` : '';
    return `${x.label}: ${longDate(x.at)}${flag}${range}.`;
  });
  let asked = null;
  if (filled(o.checkDate)) {
    const cd = date(o.checkDate);
    if (!cd) return { valid: false, message: 'Enter the date to look up as YYYY-MM-DD.' };
    const lastEnd = addCalendarDaysUtc(firsts[count - 1], len - 1);
    if (cd < start) asked = `${longDate(cd)} is before cycle 1 day 1 (${longDate(start)}).`;
    else if (cd > lastEnd) asked = `${longDate(cd)} is after the last day of cycle ${count} (${longDate(lastEnd)}).`;
    else {
      let c = 0;
      while (c + 1 < count && cd >= firsts[c + 1]) c += 1;
      const day = Math.round((cd - firsts[c]) / 86400000) + 1;
      // A delayed start leaves days after the previous cycle's last day that belong to no cycle day.
      asked = day > len
        ? `${longDate(cd)} falls after day ${len} of cycle ${c + 1} and before cycle ${c + 2} started: day ${day} counted from cycle ${c + 1} day 1, in the delay.`
        : `${longDate(cd)} is cycle ${c + 1} day ${day}${days.includes(day) ? ', a treatment day' : ', not a treatment day'}.`;
    }
  }
  notes.unshift(...lines);
  if (!win) notes.push('No allowed window was entered; add the protocol\'s window to see each treatment day\'s earliest and latest date.');
  notes.push('Cycles run back to back from day 1 unless a later start is entered. A delay moves that cycle and every one after it; it does not shorten them.');
  const last = doses[doses.length - 1].at;
  return {
    valid: true, mode: 'cycle',
    dates: doses.map((x) => fmtUtc(x.at)),
    doses: doses.map((x) => ({ label: x.label, date: fmtUtc(x.at) })),
    cycleStarts: firsts.map(fmtUtc),
    band: `${asked ? `${asked} ` : ''}${count} cycle${count === 1 ? '' : 's'} of ${len} days, treatment on day${days.length === 1 ? '' : 's'} ${days.join(', ')}: ${doses.length} treatment days from ${longDate(start)} through ${longDate(last)}.${flagged.length ? ` ${flagged.length} fall${flagged.length === 1 ? 's' : ''} on a weekend or federal holiday.` : ''}`,
    bandLabel: asked ? (/ is cycle (\d+) day (\d+)/.test(asked) ? asked.replace(/^.* is cycle (\d+) day (\d+).*$/, 'Cycle $1 day $2') : 'Not a day of any cycle') : `${doses.length} treatment days to ${fmtUtc(last)}`,
    notes,
    note: 'Dates from the cycle length and treatment days entered; the order and the protocol govern each dose.',
  };
}

export function doseCalendar(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const start = date(o.startDate);
  if (!start) return { valid: false, message: 'Enter the date of the first dose (YYYY-MM-DD).' };
  if (filled(o.cycleLength)) return cycleCalendar(o, start);
  for (const [key, label] of [['treatmentDays', 'the treatment days'], ['cycles', 'the number of cycles'], ['checkDate', 'the date to look up'], ['delayedCycle', 'the delayed cycle']]) {
    if (filled(o[key])) return { valid: false, message: `Enter the cycle length in days to use ${label}: without it this is the loading and maintenance calendar.` };
  }
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
  // The actual date replaces that dose's scheduled one (dose 1 too), and must come after the dose before it.
  if (anchorIdx > 0 && anchorDate.getTime() <= dates[anchorIdx - 1].getTime()) return { valid: false, message: `Dose ${anchorIdx + 1} is dated on or before dose ${anchorIdx} (${longDate(dates[anchorIdx - 1])}). Check the date and the dose number.` };
  if (anchorIdx === 0 && anchorDate.getTime() < start.getTime()) return { valid: false, message: 'Dose 1 is dated before the start date. Check the two dates.' };
  dates[anchorIdx] = anchorDate;
  const flagged = [];
  const kindOf = (i) => (i < weeks.length ? `Loading dose ${i + 1}` : `Maintenance dose ${i - weeks.length + 1}`);
  const lines = dates.map((d, i) => {
    const kind = kindOf(i);
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
    doses: dates.map((d, i) => ({ label: kindOf(i), date: fmtUtc(d) })),
    band: `${dates.length} doses from ${longDate(start)} through ${longDate(last)}: loading at week${weeks.length > 1 ? 's' : ''} ${weeks.join(', ')}, then every ${every} weeks.${flagged.length ? ` Dose${flagged.length > 1 ? 's' : ''} ${flagged.join(', ')} fall${flagged.length > 1 ? '' : 's'} on a weekend or federal holiday.` : ''}`,
    bandLabel: `${dates.length} doses to ${fmtUtc(last)}`,
    notes,
    note: 'Dates from the schedule entered; the order and the label govern each dose.',
  };
}

// toIcs(doses) -> an iCalendar file (RFC 5545) with one all-day event per dose, named only by its place in the
// schedule ("Loading dose 2"). No clock: DTSTAMP is the first dose's date and each UID is derived from the dose,
// so the same schedule always gives the same file.
export function toIcs(doses) {
  const ymd = (s) => s.replace(/-/g, '');
  const next = (s) => fmtUtc(addCalendarDaysUtc(parseIsoStrict(s), 1)).replace(/-/g, '');
  const stamp = `${ymd(doses[0].date)}T000000Z`;
  const events = doses.map((d, i) => [
    'BEGIN:VEVENT',
    `UID:dose-${i + 1}-${ymd(d.date)}@sophiewell.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(d.date)}`,
    `DTEND;VALUE=DATE:${next(d.date)}`,
    `SUMMARY:${d.label}`,
    'END:VEVENT',
  ].join('\r\n'));
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//sophiewell.com//dose-calendar//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n') + '\r\n';
}

