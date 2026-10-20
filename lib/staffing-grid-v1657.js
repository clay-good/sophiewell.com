// spec-v1657 tool 12: a shift staffing grid from census and a target HPPD.
//
// Arithmetic identity: staff hours per shift = target HPPD × census × (shift hours ÷ 24); staff per
// shift = those hours ÷ shift hours, shown unrounded and rounded up; RNs = staff × RN share, rounded up.
// A legal minimum ratio, where one applies, is a floor whatever the grid says.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const r1 = (n) => Math.round(n * 10) / 10;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
// Ceil after trimming float noise, so 2.0000000001 is 2.
const up = (n) => Math.ceil(Math.round(n * 1e6) / 1e6);

export function staffingGrid(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([
    ['the target HPPD', o.targetHppd, null, 48, ''],
    ['the shift length', o.shiftHours, 1, 24, 'hours'],
    ['the lowest census', o.censusFrom, 1, 500, ''],
    ['the highest census', o.censusTo, 1, 500, ''],
  ]);
  if (f) return { valid: false, message: f };
  const from = Number(o.censusFrom);
  const to = Number(o.censusTo);
  if (!Number.isInteger(from) || !Number.isInteger(to)) return { valid: false, message: 'Enter the census range in whole patients.' };
  if (to < from) return { valid: false, message: 'The highest census is below the lowest. Check the range.' };
  let step = 1;
  if (!blank(o.step)) {
    const g = inputFault([['the census step', o.step, 1, 100, '']]);
    if (g) return { valid: false, message: g };
    step = Number(o.step);
    if (!Number.isInteger(step)) return { valid: false, message: 'Enter the census step as a whole number.' };
  }
  if (Math.floor((to - from) / step) + 1 > 60) return { valid: false, message: 'That range makes more than 60 rows. Narrow it or use a larger step.' };
  let share = null;
  if (!blank(o.rnShare)) {
    const g = inputFault([['the RN share', o.rnShare, 0, 100, 'percent']]);
    if (g) return { valid: false, message: g };
    share = Number(o.rnShare) / 100;
  }
  const t = Number(o.targetHppd);
  const sh = Number(o.shiftHours);
  const rows = [];
  for (let c = from; c <= to; c += step) {
    const hours = t * c * (sh / 24);
    const staff = hours / sh;
    rows.push({ census: c, hours: r1(hours), staff: r1(staff), staffRounded: up(staff), rn: share === null ? null : up(up(staff) * share) });
  }
  const lines = rows.map((r) => `Census ${r.census}: ${r.hours} staff hours per shift, ${r.staffRounded} staff (${r.staff})${r.rn === null ? '' : `, ${r.rn} RN`}.`);
  const first = rows[0];
  return {
    valid: true, rows, abnormal: false,
    band: `At ${t} HPPD and ${sh}-hour shifts, census ${first.census} needs ${first.staffRounded} staff per shift (${first.staff} before rounding up)${rows.length > 1 ? `, up to ${rows[rows.length - 1].staffRounded} at census ${rows[rows.length - 1].census}` : ''}.`,
    bandLabel: `${rows.length} rows`,
    notes: lines,
    note: 'Staff per shift = target HPPD × census ÷ 24, rounded up. A state minimum ratio, where one applies, is the floor whatever this grid shows.',
  };
}
