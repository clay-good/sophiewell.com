// spec-v1639 tool 3: an oral suspension course: volume, bottles and the discard date.
//
// Source: arithmetic on the prescription. The "discard after N days" figure and the bottle sizes
// are on each product's label and are the reader's entries; no product is preset, because
// products differ and no suspension label was read for this.
//   volume needed = dose mL x doses per day x days
//   bottles = the fewest bottles of one size that cover it
//   discard date = date mixed + N days
// The course's day 1 is taken as the day the bottle is mixed.
//
// Pure: no DOM, no clock, no network.

import { parseIsoStrict, fmtUtc, addCalendarDaysUtc } from './deadline.js';
import { inputFault } from './num.js';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const r1 = (n) => Math.round(n * 10) / 10;
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
function date(v) { try { return parseIsoStrict(String(v ?? '').trim()); } catch { return null; } }

export function oralSuspensionCourse(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  let doseMl;
  const notes = [];
  if (!blank(o.doseMl)) {
    const f = inputFault([['the dose', o.doseMl, null, 500, 'mL']]);
    if (f) return { valid: false, message: f };
    doseMl = Number(o.doseMl);
  } else if (!blank(o.doseMg) || !blank(o.mgPer5Ml)) {
    const f = inputFault([['the dose', o.doseMg, null, 100000, 'mg'], ['the label strength, mg in each 5 mL', o.mgPer5Ml, null, 100000, 'mg']]);
    if (f) return { valid: false, message: f };
    doseMl = (Number(o.doseMg) / Number(o.mgPer5Ml)) * 5;
    notes.push(`Dose: ${Number(o.doseMg)} mg at ${Number(o.mgPer5Ml)} mg per 5 mL is ${r1(doseMl)} mL${Number.isInteger(doseMl * 10) ? '' : ' (shown to one decimal; the unrounded figure is used below)'}.`);
  } else return { valid: false, message: 'Enter the dose in mL, or the dose in mg with the label\'s mg per 5 mL.' };
  const f = inputFault([['the doses per day', o.dosesPerDay, null, 24, ''], ['the days of therapy', o.days, null, 366, 'days']]);
  if (f) return { valid: false, message: f };
  const perDay = doseMl * Number(o.dosesPerDay); const days = Number(o.days);
  const needed = perDay * days;
  notes.push(`Volume needed: ${r1(doseMl)} mL x ${Number(o.dosesPerDay)} a day x ${days} days = ${r1(needed)} mL.`);
  const out = { valid: true, doseMl: r1(doseMl), volumeNeededMl: r1(needed) };
  let bottleMl = null;
  if (!blank(o.bottleMl)) {
    const g = inputFault([['the bottle size after mixing', o.bottleMl, null, 5000, 'mL']]);
    if (g) return { valid: false, message: g };
    bottleMl = Number(o.bottleMl);
    out.bottles = Math.ceil(needed / bottleMl - 1e-9);
    out.leftoverMl = r1(out.bottles * bottleMl - needed);
    notes.push(`In ${bottleMl} mL bottles: ${out.bottles} bottle${out.bottles === 1 ? '' : 's'}, with ${out.leftoverMl} mL left over. This counts the labeled volume and allows nothing for loss in measuring.`);
  } else notes.push('No bottle size was entered, so no bottle count is shown.');
  let outlasts = false;
  if (!blank(o.mixedOn) || !blank(o.discardAfterDays)) {
    const mixed = date(o.mixedOn);
    if (!mixed) return { valid: false, message: 'Enter the date the bottle was mixed.' };
    const g = inputFault([['the label\'s discard-after figure', o.discardAfterDays, null, 365, 'days']]);
    if (g) return { valid: false, message: g };
    const n = Number(o.discardAfterDays);
    if (!Number.isInteger(n)) return { valid: false, message: 'Enter the label\'s discard-after figure as a whole number of days.' };
    const discard = addCalendarDaysUtc(mixed, n);
    const lastDose = addCalendarDaysUtc(mixed, Math.ceil(days) - 1);
    out.discardDate = fmtUtc(discard); out.lastDoseDate = fmtUtc(lastDose);
    notes.push(`Mixed ${say(mixed)}, discard after ${n} days: discard on ${say(discard)}. Taking the day it was mixed as day 1, the course's last day is ${say(lastDose)}.`);
    // The bottle is used on days 1 to N; the discard date (mixed + N) is the first day it is not used.
    if (lastDose.getTime() >= discard.getTime()) {
      outlasts = true;
      const after = Math.round((lastDose.getTime() - discard.getTime()) / 86400000) + 1;
      out.daysAfterDiscard = after;
      notes.push(`The course outlasts the first bottle by ${after} day${after === 1 ? '' : 's'}: those doses need a second bottle, mixed on or before ${say(discard)}.${bottleMl !== null ? ` A first bottle holds ${r1(Math.min(bottleMl, perDay * n))} mL of the ${r1(perDay * n)} mL that ${n} days use.` : ''}`);
    } else notes.push('The course ends before the discard date.');
  } else notes.push('No mixing date or discard-after figure was entered, so no discard date is shown.');
  notes.push('The discard-after figure, the storage directions and the water to add are on each product\'s label; none is supplied here.');
  return { ...out, flag: outlasts ? 'course-outlasts-the-bottle' : 'course', abnormal: outlasts, band: `${r1(needed)} mL needed${out.bottles !== undefined ? `: ${out.bottles} bottle${out.bottles === 1 ? '' : 's'} of ${bottleMl} mL` : ''}.`, bandLabel: outlasts ? 'Course outlasts the first bottle' : out.discardDate ? `Discard ${out.discardDate}` : 'Volume for the course', notes, note: notes.join(' ') };
}
