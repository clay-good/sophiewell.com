// spec-v1510 tool 6: annual therapy cost comparison.
//
// For up to three regimens (for example, a reference biologic and two biosimilars): cost per administration
// = units per administration x price per unit; year one = administrations in year one (loading doses
// included) x that cost; later years = maintenance administrations a year x that cost. Every price and its
// source (an ASP quarter, a NADAC date, a contract) is the reader's, and each line repeats the source so a
// P&T committee or payer sees where every number came from.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const money = (x) => `$${x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const r2 = (x) => Math.round(x * 100) / 100;

export function therapyCostCompare(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const regs = [];
  for (const k of [1, 2, 3]) {
    const name = String(o[`name${k}`] ?? '').trim();
    const any = ['price', 'units', 'year1', 'later'].some((f) => String(o[`${f}${k}`] ?? '').trim());
    if (!name && !any) continue;
    if (!name) return { valid: false, message: `Enter a name for regimen ${k}.` };
    const f = inputFault([
      [`the price per unit for ${name}`, o[`price${k}`], 0, 1e7, 'dollars'],
      [`the units per administration for ${name}`, o[`units${k}`], 0.001, 1e6, 'units'],
      [`the administrations in year one for ${name}`, o[`year1${k}`], 0, 400, ''],
      [`the administrations a year after year one for ${name}`, o[`later${k}`], 0, 400, ''],
    ]);
    if (f) return { valid: false, message: f };
    const per = r2(Number(o[`price${k}`]) * Number(o[`units${k}`]));
    const src = String(o[`source${k}`] ?? '').trim();
    regs.push({ name, per, y1: r2(per * Number(o[`year1${k}`])), later: r2(per * Number(o[`later${k}`])), src });
  }
  if (regs.length < 2) return { valid: false, message: 'Enter at least two regimens: a name, the price per unit, units per administration, and administrations in year one and later years.' };
  const notes = regs.map((r) => `${r.name}: ${money(r.per)} per administration; year one ${money(r.y1)}; each later year ${money(r.later)}. Price source: ${r.src || 'not entered'}.`);
  if (regs.some((r) => !r.src)) notes.push('Some prices have no source entered; a comparison is only as current as its prices.');
  const y1 = [...regs].sort((a, b) => a.y1 - b.y1);
  const lt = [...regs].sort((a, b) => a.later - b.later);
  return {
    valid: true,
    regimens: regs,
    band: `Lowest in year one: ${y1[0].name}, ${money(y1[0].y1)} (${money(r2(y1[y1.length - 1].y1 - y1[0].y1))} less than ${y1[y1.length - 1].name}). Lowest in later years: ${lt[0].name}, ${money(lt[0].later)} a year.`,
    bandLabel: y1[0].name,
    notes,
    note: 'Arithmetic on the prices, doses and schedules entered; waste from partial vials is not included (see the dose rounding tool).',
  };
}
