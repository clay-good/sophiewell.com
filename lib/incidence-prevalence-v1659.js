// spec-v1659 tool 1: incidence proportion, incidence rate and prevalence.
//
// Source: CDC, Principles of Epidemiology in Public Health Practice, 3rd ed., Lesson 3 §2, "Morbidity
// frequency measures" (archive.cdc.gov), read October 19, 2026. Incidence proportion (risk) = new cases ÷
// the population at the start; incidence rate = new cases ÷ person-time; prevalence = all cases ÷ the
// population, at a point or over a period. Examples: 100 ÷ 189 = 52.9% (risk); 16 ÷ 6,400 person-years =
// 2.5 per 1,000 person-years; point prevalence 7 ÷ 18; period prevalence 10 ÷ 20; 468 ÷ 1,150 = 40.7%.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const MEASURES = [
  { value: 'proportion', text: 'Incidence proportion (risk)' },
  { value: 'rate', text: 'Incidence rate (per person-time)' },
  { value: 'point-prevalence', text: 'Point prevalence' },
  { value: 'period-prevalence', text: 'Period prevalence' },
];
export const MULTIPLIERS = ['100', '1000', '10000', '100000'];
const loc = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 3 });
const r = (n) => Math.round(n * 1000) / 1000;

export function incidencePrevalence(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const m = MEASURES.find((x) => x.value === o.measure);
  if (!m) return { valid: false, message: 'Choose the measure.' };
  if (!MULTIPLIERS.includes(String(o.multiplier))) return { valid: false, message: 'Choose the multiplier: per 100, 1,000, 10,000 or 100,000.' };
  const k = Number(o.multiplier);
  const denomLabel = { proportion: 'the population at the start of the period', rate: 'the person-time observed', 'point-prevalence': 'the population at that point', 'period-prevalence': 'the population during the period' }[m.value];
  const numLabel = m.value.endsWith('prevalence') ? 'the people with the condition' : 'the new cases';
  const f = inputFault([[numLabel, o.cases, 0, 1e10, ''], [denomLabel, o.denominator, null, 1e12, '']]);
  if (f) return { valid: false, message: f };
  const c = Number(o.cases);
  const d = Number(o.denominator);
  let unit = '';
  if (m.value === 'rate') {
    if (!['person-years', 'person-months', 'person-days'].includes(o.timeUnit)) return { valid: false, message: 'Choose the unit of person-time: years, months or days.' };
    unit = ` ${o.timeUnit}`;
  } else if (c > d) {
    return { valid: false, message: `More ${m.value.endsWith('prevalence') ? 'people with the condition' : 'new cases'} than people in the population. Check the counts.` };
  }
  const v = (c / d) * k;
  const per = k === 100 ? '%' : ` per ${loc(k)}${unit}`;
  const notes = [m.value === 'rate'
    ? 'A rate has a time unit: it counts cases per unit of person-time, and the same cases give a different number per person-month than per person-year.'
    : m.value === 'proportion'
      ? 'An incidence proportion is a proportion between 0 and 1 over a stated period; say the period beside it.'
      : 'Prevalence counts existing and new cases together, so it rises with how long the condition lasts as well as how often it starts.'];
  return {
    valid: true, value: r(v), abnormal: false,
    band: `${m.text}: ${r(v)}${per} (${loc(c)} ÷ ${loc(d)}${unit} × ${loc(k)}).`,
    bandLabel: `${r(v)}${per}`,
    notes,
    note: 'Definitions from CDC, Principles of Epidemiology, Lesson 3 §2.',
  };
}
