// spec-v1624 step 2 / spec-v1613 §3: which value from a record fills each
// concept. Pure: observations + the concept map + `now` -> the chosen value
// per concept, and every value not chosen with the reason.
//
//   - The most recent value wins, with its date.
//   - Two results at the same most-recent time that disagree fill neither.
//   - Older than the concept's recency window: filled, with a dated note.
//   - Older than five years: never filled.
//   - A unit the concept does not list: never filled; shown with its unit.
//   - Age comes from the birth date on `now`; sex from administrative gender
//     (F or M only). BMI and eGFR are derived when the record reports none:
//     BMI from the most recent weight and height, eGFR by CKD-EPI 2021 from
//     creatinine, age and sex.

import { toConcept } from './record-units.js';
import { egfrCkdEpi2021 } from './clinical.js';

const DAY = 86400000;
const MAX_AGE_DAYS = 5 * 365.25;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (iso) => { const d = new Date(`${iso}T00:00:00Z`); return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`; };
const round = (v, n = 2) => Math.round(v * 10 ** n) / 10 ** n;

export function ageOn(birthDate, now) {
  const b = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(b.getTime())) return null;
  let age = now.getUTCFullYear() - b.getUTCFullYear();
  if (now.getUTCMonth() < b.getUTCMonth() || (now.getUTCMonth() === b.getUTCMonth() && now.getUTCDate() < b.getUTCDate())) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

// pick({ observations, birthDate, sex }, concepts, now) ->
//   { values: { [concept]: { value, unit, at, code, system, note?, derivedFrom? } },
//     notChosen: [{ concept, code, value, unit, at, reason }] }
export function pick(record, concepts, now = new Date()) {
  const byCode = new Map();
  for (const c of concepts) for (const k of c.codes) byCode.set(`${k.system}|${k.code}`, c);
  const values = {};
  const notChosen = [];
  const candidates = new Map(); // concept id -> [{ value, at, ... }]
  for (const o of record.observations || []) {
    const c = byCode.get(`${o.system}|${o.code}`);
    if (!c) continue;
    const base = { concept: c.id, code: o.code, system: o.system, value: o.value, unit: o.unit, at: o.at };
    if (!o.at) { notChosen.push({ ...base, reason: 'It has no date.' }); continue; }
    const v = toConcept(c, o.value, o.unit);
    if (v === null) { notChosen.push({ ...base, reason: `Its unit (${o.unit || 'none'}) is not one this value converts from.` }); continue; }
    const ageDays = (now - new Date(`${o.at}T00:00:00Z`)) / DAY;
    if (ageDays > MAX_AGE_DAYS) { notChosen.push({ ...base, reason: 'It is more than five years old.' }); continue; }
    if (!candidates.has(c.id)) candidates.set(c.id, []);
    candidates.get(c.id).push({ ...base, canonical: v, ageDays, concept: c });
  }
  for (const [id, list] of candidates) {
    list.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
    const latest = list.filter((x) => x.at === list[0].at);
    const distinct = new Set(latest.map((x) => round(x.canonical, 4)));
    for (const x of list.slice(latest.length)) notChosen.push({ concept: id, code: x.code, value: x.value, unit: x.unit, at: x.at, reason: `A more recent value (${longDate(list[0].at)}) is used.` });
    if (distinct.size > 1) {
      for (const x of latest) notChosen.push({ concept: id, code: x.code, value: x.value, unit: x.unit, at: x.at, reason: 'Two results at the same time disagree, so neither is used.' });
      continue;
    }
    const x = latest[0];
    const out = { value: round(x.canonical), unit: x.concept.unit, at: x.at, code: x.code, system: x.system };
    if (x.ageDays > x.concept.recencyDays) out.note = `From ${longDate(x.at)}, ${Math.round(x.ageDays / 30.44)} months ago.`;
    values[id] = out;
  }
  const age = record.birthDate ? ageOn(record.birthDate, now) : null;
  if (age !== null) values.age = { value: age, unit: 'years', from: 'birth date' };
  if (record.sex === 'F' || record.sex === 'M') values.sex = { value: record.sex, from: 'administrative gender' };
  // Derived values, only when none is reported.
  if (!values.bmi && values['body-weight'] && values['body-height']) {
    const h = values['body-height'].value / 100;
    values.bmi = { value: round(values['body-weight'].value / (h * h), 1), unit: 'kg/m2', at: values['body-weight'].at, derivedFrom: ['body-weight', 'body-height'] };
  }
  if (!values.egfr && values.creatinine && values.age && values.sex) {
    try {
      const e = egfrCkdEpi2021({ scr: values.creatinine.value, age: values.age.value, sex: values.sex.value });
      if (Number.isFinite(e)) values.egfr = { value: Math.round(e), unit: 'mL/min/1.73m2', at: values.creatinine.at, derivedFrom: ['creatinine', 'age', 'sex'] };
    } catch { /* out of range for the equation: no derived eGFR */ }
  }
  return { values, notChosen };
}
