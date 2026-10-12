// spec-v1636 tool 17: defined daily doses per 100 bed-days and per 1,000 patient-days.
//
// Source: WHO Collaborating Centre for Drug Statistics Methodology, "Use of ATC/DDD"
// (atcddd.fhi.no): drug use in hospitals is presented as DDDs per 100 bed-days. The DDD of each
// agent is the Centre's; its copyright notice does not allow the values to be copied and
// redistributed, so none ship here. The reader enters the DDD from the Centre's index, with the
// index year.
//
//   DDDs = grams used / DDD in grams.
//   DDDs per 100 bed-days = DDDs / bed-days x 100 (the WHO presentation).
//   DDDs per 1,000 patient-days = DDDs / patient-days x 1,000 (the same arithmetic on another base).
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const NOTE = 'Arithmetic on the grams, DDD and bed-days entered. The DDD is a unit of measurement set by the WHO Collaborating Centre, not a recommended dose; a DDD rate measures consumption and says nothing about whether use was appropriate.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');

export function dddRate(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the grams used', o.gramsUsed, 0, 100000000, 'g'], ['the DDD', o.ddd, null, 100000, 'g'], ['the bed-days or patient-days', o.bedDays, null, 100000000, '']]);
  if (f) return { valid: false, message: `${f}${/DDD/.test(f) ? ' Look it up in the WHO ATC/DDD index; the value is not supplied here.' : ''}` };
  let year = null;
  if (!blank(o.indexYear)) {
    const yf = inputFault([['the index year', o.indexYear, 1990, 2100, '']]);
    if (yf) return { valid: false, message: yf };
    year = Number(o.indexYear);
    if (!Number.isInteger(year)) return { valid: false, message: 'Enter the index year as a whole year.' };
  }
  const grams = Number(o.gramsUsed); const ddd = Number(o.ddd); const bed = Number(o.bedDays);
  const ddds = grams / ddd; const per100 = ddds / bed * 100; const per1000 = ddds / bed * 1000;
  const notes = [
    `DDDs = ${grams.toLocaleString('en-US')} g ÷ ${ddd} g = ${n2(ddds)}.`,
    `Per 100 bed-days: ${n2(ddds)} ÷ ${bed.toLocaleString('en-US')} × 100 = ${n2(per100)}. This is the presentation the WHO Centre describes for hospitals.`,
    `Per 1,000 patient-days: ${n2(ddds)} ÷ ${bed.toLocaleString('en-US')} × 1,000 = ${n2(per1000)}. The same arithmetic on another base.`,
    year === null ? 'The index year of the DDD was not entered. DDDs are revised from time to time, so a rate is comparable only with rates that used the same DDD.' : `DDD of ${ddd} g, as entered from the ${year} index. DDDs are revised from time to time, so a rate is comparable only with rates that used the same DDD.`,
    'The DDD depends on the route for some agents (oral and parenteral values can differ). Use the value for the route counted.',
    'The WHO Centre notes that the definition of a bed-day differs between hospitals and countries; say which one was used when the rate is reported.',
  ];
  return { valid: true, flag: 'rates', abnormal: false, ddds: Number(ddds.toFixed(2)), per100BedDays: Number(per100.toFixed(2)), per1000PatientDays: Number(per1000.toFixed(2)), band: `${n2(ddds)} DDDs: ${n2(per100)} per 100 bed-days, ${n2(per1000)} per 1,000 patient-days.`, bandLabel: `${n2(per100)} per 100 bed-days`, notes, note: NOTE };
}
