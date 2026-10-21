// spec-v1657 tool 1: nursing hours per patient day (HPPD) and skill mix.
//
// Arithmetic identity, no source number: HPPD = nursing hours ÷ patient days, in total and for each
// category; skill mix = a category's hours ÷ all nursing hours. Against a target the unit uses, the
// difference in hours = (actual HPPD − target HPPD) × patient days. The same word means different
// things across facilities, so the result names which hours (worked or paid) and which patient days
// (midnight census or an adjusted count) it divided. No benchmark ships; legal minimums are in the
// state staffing tiles.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const r2 = (n) => Math.round(n * 100) / 100;
const loc = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const HOURS = { worked: 'worked (productive) hours', paid: 'paid hours' };
const DAYS = { midnight: 'midnight-census patient days', adjusted: 'adjusted patient days' };

export function nursingHppd(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the patient days', o.patientDays, null, 1e7, '']]);
  if (f) return { valid: false, message: f };
  const cats = [['RN', o.rnHours], ['LPN/LVN', o.lpnHours], ['Nurse aide', o.aideHours]];
  if (cats.every(([, v]) => blank(v))) return { valid: false, message: 'Enter the nursing hours for at least one category: RN, LPN/LVN or nurse aide.' };
  for (const [name, v] of cats) {
    if (blank(v)) continue;
    const g = inputFault([[`the ${name} hours`, v, 0, 1e8, '']]);
    if (g) return { valid: false, message: g };
  }
  const days = Number(o.patientDays);
  const used = cats.filter(([, v]) => !blank(v)).map(([name, v]) => [name, Number(v)]);
  const total = used.reduce((s, [, h]) => s + h, 0);
  if (total === 0) return { valid: false, message: 'The nursing hours add up to zero. Enter the hours worked or paid.' };
  const hppd = total / days;
  const what = `${HOURS[o.hoursBasis] || 'hours'} over ${DAYS[o.daysBasis] || 'patient days'}`;
  const notes = used.map(([name, h]) => `${name}: ${r2(h / days)} hours per patient day, ${r2((h / total) * 100)}% of nursing hours.`);
  if (!HOURS[o.hoursBasis] || !DAYS[o.daysBasis]) {
    notes.push('Choose whether the hours are worked or paid, and whether the patient days are midnight census or adjusted. The division is the same, but the number means something different, and two units can only be compared on the same definitions.');
  }
  let band = `${r2(hppd)} nursing hours per patient day (${what}: ${loc(total)} ÷ ${loc(days)}).`;
  if (!blank(o.targetHppd)) {
    const g = inputFault([['the target HPPD', o.targetHppd, null, 48, '']]);
    if (g) return { valid: false, message: g };
    const t = Number(o.targetHppd);
    const diff = (hppd - t) * days;
    band += ` Against a target of ${t}: ${diff >= 0 ? `${loc(diff)} hours over` : `${loc(-diff)} hours under`} for the period.`;
  }
  return {
    valid: true, hppd: r2(hppd), totalHours: r2(total), abnormal: false,
    band, bandLabel: `${r2(hppd)} HPPD`, notes,
    note: 'No benchmark is built in. A legal minimum, where a state sets one, is in the state staffing tools.',
  };
}
