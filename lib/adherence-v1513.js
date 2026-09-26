// spec-v1513 tool 2: medication possession ratio, proportion of days covered, and gap days, for one
// patient's fills of one drug.
//
// PDC (CMS 2026 Star Ratings Technical Notes, Attachment L): the days covered by at least one fill, over the
// days in the period; a fill made before the previous supply ran out starts when it ends (overlapping
// fills of the same ingredient are shifted forward). The Part D adherence measures count a patient as
// adherent at a PDC of 80% or more. MPR: the total days supplied over the days in the period, not capped,
// so stockpiling can push it past 100%. Supply that would run past the end of the period is not counted in
// either. Fills are one drug, so every overlap is shifted.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';
import { parseIsoStrict, addCalendarDaysUtc } from './deadline.js';
import { longDate } from './partd-appeals-v1503.js';

const DAY = 86400000;
const date = (s) => { try { return parseIsoStrict(String(s ?? '').trim()); } catch { return null; } };
const pct = (a, b) => Math.round((a / b) * 1000) / 10;

export function parseFills(text) {
  const fills = [];
  const lines = String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const [i, line] of lines.entries()) {
    const m = /^(\d{4}-\d{2}-\d{2})\s*[,;\t ]\s*(\d+(?:\.\d+)?)$/.exec(line);
    if (!m) return { error: `Line ${i + 1} ("${line.slice(0, 40)}"): enter a fill as YYYY-MM-DD, days supply.` };
    const d = date(m[1]);
    const days = Number(m[2]);
    if (!d) return { error: `Line ${i + 1}: ${m[1]} is not a real date.` };
    if (!Number.isInteger(days) || days < 1 || days > 365) return { error: `Line ${i + 1}: enter the days supply as a whole number from 1 to 365.` };
    fills.push({ d, days });
  }
  return { fills: fills.sort((a, b) => a.d - b.d) };
}

export function mprGapDays(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!String(o.fills ?? '').trim()) return { valid: false, message: 'Enter the fills, one per line: fill date, days supply (for example, 2026-01-05, 30).' };
  const p = parseFills(o.fills);
  if (p.error) return { valid: false, message: p.error };
  const { fills } = p;
  const notes = [];
  let start = fills[0].d;
  if (String(o.periodStart ?? '').trim()) {
    start = date(o.periodStart);
    if (!start) return { valid: false, message: 'Enter the period start as YYYY-MM-DD, or leave it blank to start at the first fill.' };
  } else notes.push(`The period starts at the first fill, ${longDate(start)}.`);
  let end = new Date(Date.UTC(start.getUTCFullYear(), 11, 31));
  if (String(o.periodEnd ?? '').trim()) {
    end = date(o.periodEnd);
    if (!end) return { valid: false, message: 'Enter the period end as YYYY-MM-DD, or leave it blank for December 31.' };
  } else notes.push(`The period ends December 31, ${start.getUTCFullYear()}.`);
  if (end < start) return { valid: false, message: 'Enter the period again: it ends before it starts.' };
  let minGap = 0;
  if (String(o.gapDays ?? '').trim()) {
    const g = inputFault([['the gap length to list', o.gapDays, 0, 365, 'days']]);
    if (g) return { valid: false, message: g };
    minGap = Math.floor(Number(o.gapDays));
  }
  const inPeriod = fills.filter((f) => f.d >= start && f.d <= end);
  if (!inPeriod.length) return { valid: false, message: 'None of the fills falls inside the period; check the dates.' };
  const total = Math.round((end - start) / DAY) + 1;
  const covered = new Set();
  let cursor = start;
  let supplied = 0;
  let shifted = 0;
  for (const f of inPeriod) {
    const from = f.d > cursor ? f.d : cursor;
    if (from > f.d) shifted += 1;
    for (let k = 0; k < f.days; k += 1) {
      const day = addCalendarDaysUtc(from, k);
      if (day > end) break;
      covered.add(day.getTime());
    }
    supplied += Math.min(f.days, Math.round((end - f.d) / DAY) + 1);
    cursor = addCalendarDaysUtc(from, f.days);
  }
  const gaps = [];
  let run = null;
  for (let t = start.getTime(); t <= end.getTime(); t += DAY) {
    if (!covered.has(t)) { if (!run) run = [t, t]; else run[1] = t; } else if (run) { gaps.push(run); run = null; }
  }
  if (run) gaps.push(run);
  const listed = gaps.filter(([a, b]) => (b - a) / DAY + 1 > minGap);
  const pdc = pct(covered.size, total);
  const mpr = pct(supplied, total);
  for (const [a, b] of listed) {
    const n = (b - a) / DAY + 1;
    notes.push(`Gap of ${n} day${n === 1 ? '' : 's'}: ${longDate(new Date(a))} to ${longDate(new Date(b))}.`);
  }
  if (!listed.length) notes.push(minGap ? `No gap longer than ${minGap} days.` : 'No gaps: every day of the period is covered.');
  if (shifted) notes.push(`${shifted} fill${shifted === 1 ? ' was' : 's were'} picked up before the previous supply ran out; for PDC each is counted from when the earlier supply ends.`);
  if (mpr > pdc) notes.push('MPR is higher than PDC because it counts every day supplied, including early refills and supply that overlaps; PDC counts each day once.');
  return {
    valid: true,
    pdc,
    mpr,
    band: `PDC ${pdc}% (${covered.size} of ${total} days covered)${pdc >= 80 ? ', at or above' : ', below'} the 80% the Part D adherence measures use; MPR ${mpr}%.`,
    bandLabel: `PDC ${pdc}%, MPR ${mpr}%`,
    abnormal: pdc < 80,
    notes,
    note: 'The fills entered are taken as one drug; the Star measures\' own denominator rules (two fills, a 91-day period, exclusions) are not applied here.',
  };
}

// spec-v1513 tool 4: medication synchronization plan. Each medication's next due date is its last fill
// plus its days supply. The sync date is the one entered, or by default the latest next due date, so no
// medication is filled early. Each medication then gets a one-time short fill at its next due date that
// lasts until the sync date (after any full fills needed first), rounded up to whole units so no dose is
// missed; from the sync date on, all refill together. 42 CFR 423.153(b)(4): Part D plans charge a daily
// cost-sharing rate for a supply under a month of a solid oral dose (not antibiotics, or drugs dispensed in
// their original container); other plans set their own rules.
export function parseMeds(text) {
  const meds = [];
  const lines = String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const [i, line] of lines.entries()) {
    const parts = line.split(/\s*[,;\t]\s*/);
    if (parts.length !== 4) return { error: `Line ${i + 1} ("${line.slice(0, 40)}"): enter name, last fill date (YYYY-MM-DD), days supply, units a day.` };
    const [name, d, days, perDay] = parts;
    const last = date(d);
    if (!name) return { error: `Line ${i + 1}: enter the medication name first.` };
    if (!last) return { error: `Line ${i + 1}: ${d} is not a date as YYYY-MM-DD.` };
    const ds = Number(days);
    const pd = Number(perDay);
    if (!Number.isInteger(ds) || ds < 1 || ds > 365) return { error: `Line ${i + 1}: enter the days supply as a whole number from 1 to 365.` };
    if (!Number.isFinite(pd) || pd <= 0 || pd > 100) return { error: `Line ${i + 1}: enter the units taken a day (more than 0).` };
    meds.push({ name, last, days: ds, perDay: pd, due: addCalendarDaysUtc(last, ds) });
  }
  return { meds };
}

export function medSyncPlan(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!String(o.meds ?? '').trim()) return { valid: false, message: 'Enter the medications, one per line: name, last fill date, days supply, units a day (for example, lisinopril 10 mg, 2026-09-20, 30, 1).' };
  const p = parseMeds(o.meds);
  if (p.error) return { valid: false, message: p.error };
  const { meds } = p;
  if (meds.length < 2) return { valid: false, message: 'Enter at least two medications to synchronize.' };
  const latest = meds.reduce((a, m) => (m.due > a ? m.due : a), meds[0].due);
  let anchor = latest;
  const notes = [];
  if (String(o.syncDate ?? '').trim()) {
    const t = date(o.syncDate);
    if (!t) return { valid: false, message: 'Enter the sync date as YYYY-MM-DD, or leave it blank for the earliest practical date.' };
    if (t < latest) return { valid: false, message: `Choose a sync date on or after ${longDate(latest)}, the latest next due date, so no medication is refilled before it is due.` };
    anchor = t;
  } else notes.push(`No sync date was entered, so the earliest practical one is used: ${longDate(latest)}, the latest next due date.`);
  let shortCount = 0;
  for (const m of meds) {
    let gap = Math.round((anchor - m.due) / DAY);
    const full = Math.floor(gap / m.days);
    gap -= full * m.days;
    const pre = full ? `${full} full fill${full > 1 ? 's' : ''} of ${m.days} days from ${longDate(m.due)}, then ` : '';
    const at = addCalendarDaysUtc(m.due, full * m.days);
    if (gap === 0) notes.push(`${m.name}: ${pre ? `${pre.replace(/, then $/, '')}; ` : ''}already due ${longDate(anchor)}, no short fill.`);
    else {
      shortCount += 1;
      const qty = Math.ceil(gap * m.perDay);
      notes.push(`${m.name}: ${pre}a one-time short fill of ${gap} days (${qty} unit${qty === 1 ? '' : 's'}) on ${longDate(at)}.`);
    }
  }
  notes.push('Quantities are rounded up to whole units so no dose is missed.');
  notes.push('Part D plans charge a daily cost-sharing rate for a short fill of a solid oral dose (42 CFR 423.153(b)(4)), except antibiotics and drugs dispensed in their original container; ask other plans how they charge.');
  return {
    valid: true,
    syncDate: anchor.toISOString().slice(0, 10),
    band: `Sync date ${longDate(anchor)}: ${shortCount} medication${shortCount === 1 ? '' : 's'} need${shortCount === 1 ? 's' : ''} a one-time short fill, and from then on all ${meds.length} refill together.`,
    bandLabel: `Sync ${anchor.toISOString().slice(0, 10)}`,
    notes,
    note: 'A plan to show the prescriber and the plan; the prescriptions and the plan\'s rules govern each fill.',
  };
}
