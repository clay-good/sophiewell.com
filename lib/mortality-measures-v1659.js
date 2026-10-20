// spec-v1659 tool 2: mortality frequency measures.
//
// Source: CDC, Principles of Epidemiology in Public Health Practice, 3rd ed., Lesson 3 §3, "Mortality
// frequency measures" (archive.cdc.gov), read October 19, 2026: Table 3.4's numerators, denominators and
// usual multipliers, and the notes on which measures are proportions and which are ratios. Examples:
// 2,419,921 ÷ 290,809,777 × 100,000 = 832.1 (crude, US 2003); 108,256 → 37.2 per 100,000 (accidents);
// 3 ÷ 555 = 0.5% (hepatitis A case fatality); 11,228 ÷ 143,497 = 0.078246 (diphtheria death-to-case; the
// page prints 0.0783, which is 0.0782 to four places). The page's infant mortality example, 28,025 ÷
// 4,089,950, prints 6.951 per 1,000; the division gives 6.852.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

// [value, label, numerator, denominator, usual multiplier, note]
export const MEASURES = [
  ['crude', 'Crude mortality rate', 'deaths from all causes', 'the mid-interval population', 100000, null],
  ['cause-specific', 'Cause-specific mortality rate', 'deaths from the cause', 'the mid-interval population', 100000, null],
  ['group-specific', 'Age-, sex- or race-specific mortality rate', 'deaths in the group', 'the mid-interval population of the group', 100000, null],
  ['infant', 'Infant mortality rate', 'deaths under 1 year', 'live births in the same period', 1000, 'A ratio and not a proportion: some deaths are of children born the year before, who are not in the births.'],
  ['neonatal', 'Neonatal mortality rate', 'deaths under 28 days', 'live births in the same period', 1000, null],
  ['postneonatal', 'Postneonatal mortality rate', 'deaths from 28 days to under 1 year', 'live births in the same period', 1000, null],
  ['maternal', 'Maternal mortality rate', 'pregnancy-related deaths, during pregnancy or within 42 days of its end, not from accidental or incidental causes', 'live births in the same period', 100000, 'Technically a ratio: the numerator is not a subset of the live births.'],
  ['case-fatality', 'Case-fatality rate', 'deaths among the incident cases', 'the incident cases', 100, 'A proportion, so it is a percentage of the cases; it is not a rate over time.'],
  ['proportionate', 'Proportionate mortality', 'deaths from the cause', 'deaths from all causes', 100, 'Not a mortality rate: the denominator is deaths, not the population.'],
  ['death-to-case', 'Death-to-case ratio', 'deaths from the disease in the period', 'new cases in the same period', 100, 'A ratio and not necessarily a proportion: some deaths may be of people who fell ill in an earlier period.'],
];
const loc = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 3 });
const r = (n) => Math.round(n * 1000) / 1000;

export function mortalityMeasures(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const m = MEASURES.find((x) => x[0] === o.measure);
  if (!m) return { valid: false, message: 'Choose the measure.' };
  const [id, label, num, den, usual, nature] = m;
  const f = inputFault([[`the ${num}`, o.numerator, 0, 1e10, ''], [den, o.denominator, null, 1e11, '']]);
  if (f) return { valid: false, message: f };
  let k = usual;
  if (String(o.multiplier ?? '').trim() !== '') {
    if (!['100', '1000', '10000', '100000'].includes(String(o.multiplier))) return { valid: false, message: 'Choose the multiplier: per 100, 1,000, 10,000 or 100,000.' };
    k = Number(o.multiplier);
  }
  const n = Number(o.numerator);
  const d = Number(o.denominator);
  if (['case-fatality', 'proportionate'].includes(id) && n > d) return { valid: false, message: 'The numerator is larger than the denominator, which this measure cannot be. Check the counts.' };
  const v = (n / d) * k;
  const per = k === 100 ? (id === 'death-to-case' ? ' per 100' : '%') : ` per ${loc(k)}`;
  return {
    valid: true, value: r(v), abnormal: false,
    band: `${label}: ${r(v)}${per} (${loc(n)} ${num} ÷ ${loc(d)} × ${loc(k)}).`,
    bandLabel: `${r(v)}${per}`,
    notes: [`Numerator: ${num}. Denominator: ${den}.`, ...(nature ? [nature] : []), ...(String(o.multiplier ?? '').trim() === '' ? [`Choose a multiplier to change it; until then the measure's usual one, per ${loc(usual)}, is used.`] : [])],
    note: 'Definitions from CDC, Principles of Epidemiology, Lesson 3 §3, Table 3.4.',
  };
}
