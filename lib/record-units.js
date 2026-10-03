// spec-v1624 step 1: units for record values. A record writes units in UCUM
// ("mm[Hg]", "10*3/uL", "[lb_av]", "mL/min/{1.73_m2}"); a calculator field in
// house style ("mmHg", "x10^9/L", "lb", "mL/min/1.73m^2"). unitKey() reduces
// both to one spelling, and each concept (data/concepts/) lists the units it
// converts from with a factor: value x factor = the concept's unit. A unit a
// concept does not list is never guessed: the value is shown and not filled.

import { convertUnit } from './query-fill.js';

// Spellings that mean the same magnitude.
const SAME = new Map([
  ['x109/l', 'x103/ul'], ['k/ul', 'x103/ul'], ['103/ul', 'x103/ul'], ['109/l', 'x103/ul'],
  ['meq/l', 'mmol/l'], ['{inr}', '1'], ['inr', '1'], ['', '1'],
  ['years', 'a'], ['year', 'a'], ['yr', 'a'],
]);

export function unitKey(unit) {
  let u = String(unit ?? '').trim().toLowerCase()
    .replace(/µ|μ/g, 'u').replace(/×/g, 'x')
    .replace(/\[([a-z]+)_(av|i|us)\]/g, '$1')       // [lb_av] -> lb, [in_i] -> in
    .replace(/\[hg\]/g, 'hg')                        // mm[Hg] -> mmhg
    .replace(/\{1\.73_m2\}/g, '1.73m2')              // mL/min/{1.73_m2}
    .replace(/\^/g, '').replace(/\*/g, '')           // 10^9, 10*3
    .replace(/\s+/g, '');
  if (/^10[39]\//.test(u)) u = `x${u}`;
  return SAME.get(u) || u;
}

// toConcept(concept, value, unit) -> the value in the concept's unit, or null
// when the unit is not one the concept lists.
export function toConcept(concept, value, unit) {
  if (!Number.isFinite(value)) return null;
  const k = unitKey(unit);
  if (k === unitKey(concept.unit)) return value;
  const a = (concept.acceptUnits || []).find((x) => unitKey(x.unit) === k);
  return a ? value * a.factor : null;
}

// toField(concept, value, fieldUnit) -> a value in the concept's unit written
// in the field's unit, or null. A field with no unit takes the concept's.
export function toField(concept, value, fieldUnit) {
  if (!Number.isFinite(value)) return null;
  if (!fieldUnit) return value;
  const k = unitKey(fieldUnit);
  if (k === unitKey(concept.unit)) return value;
  const a = (concept.acceptUnits || []).find((x) => unitKey(x.unit) === k);
  if (a) return value / a.factor;
  const c = convertUnit(value, concept.unit, fieldUnit);
  return c === null ? null : c;
}
