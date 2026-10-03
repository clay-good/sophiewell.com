// spec-v1540 §4.1: the weight-band and age-band engine for the field-health program.
//
// Nearly every WHO dose in the program is a band table ("5 to less than 15 kg: 1 tablet"). The rules,
// written once:
//   - Bands are half-open, lo <= x < hi. A chart whose top band is closed ("14-19 kg") sets
//     `closedTop: true`, and the top band then includes its upper edge and the answer states that edge.
//   - Off the chart is refused with the chart's range: never extrapolated, never the nearest band.
//   - Blank is refused: an empty weight is not zero and never lands in the smallest band.
//   - Weight beats age. Age is the fallback when no weight is entered, and the answer says which was used;
//     when both are entered and fall in different bands, weight is used and the difference is said.
//   - The output is the band's own dose. The achieved mg/kg may be shown beside it, flagged outside the
//     source's target range; a "better" continuous dose is never computed.
//
// A table: { unit: 'kg' | 'months' | ..., closedTop?: boolean, bands: [{ lo, hi, dose, ...anything }] },
// bands in ascending order, each hi equal to the next lo (gaps in a source are written as a band whose dose
// is null, so a value in the gap is refused by name rather than falling through).
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

// findBand(table, value) -> { band } | { off: 'below' | 'above' | 'gap', range }
export function findBand(table, value) {
  const bands = table.bands;
  const first = bands[0];
  const last = bands[bands.length - 1];
  const range = { lo: first.lo, hi: last.hi ?? null, closedTop: Boolean(table.closedTop) };
  if (value < first.lo) return { off: 'below', range };
  for (let i = 0; i < bands.length; i += 1) {
    const b = bands[i];
    const top = i === bands.length - 1;
    const inside = b.hi === undefined || b.hi === null
      ? value >= b.lo
      : value >= b.lo && (value < b.hi || (top && table.closedTop && value === b.hi));
    if (inside) return b.dose === null || b.dose === undefined ? { off: 'gap', range, band: b } : { band: b };
  }
  return { off: 'above', range };
}

const fmt = (n) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000));
const rangeText = (r, unit) => (r.hi === null ? `${fmt(r.lo)} ${unit} and above` : `${fmt(r.lo)} to ${r.closedTop ? '' : 'less than '}${fmt(r.hi)} ${unit}`);
export const bandText = (b, unit, top, closedTop) => (b.hi === undefined || b.hi === null
  ? `${fmt(b.lo)} ${unit} or more`
  : `${fmt(b.lo)} to ${top && closedTop ? '' : 'less than '}${fmt(b.hi)} ${unit}`);

// bandDose({ weight, age }, { weightTable, ageTable, weightLabel, ageLabel, minWeight, maxWeight, maxAge })
//   -> { valid: false, message } | { valid: true, band, by: 'weight' | 'age', notes }
// `weight` and `age` are the raw field values. Either table may be absent.
export function bandDose(input, spec) {
  const o = input && typeof input === 'object' ? input : {};
  const hasW = String(o.weight ?? '').trim() !== '';
  const hasA = String(o.age ?? '').trim() !== '';
  const notes = [];
  if (!hasW && !(hasA && spec.ageTable)) {
    return { valid: false, message: spec.ageTable ? `Enter the ${spec.weightLabel || 'weight'} or, if it is not known, the ${spec.ageLabel || 'age'}.` : `Enter the ${spec.weightLabel || 'weight'}.` };
  }
  let byWeight = null;
  if (hasW) {
    const wt = spec.weightTable;
    const f = inputFault([[`the ${spec.weightLabel || 'weight'}`, o.weight, 0, spec.maxWeight ?? 500, wt.unit]]);
    if (f) return { valid: false, message: f };
    byWeight = findBand(wt, Number(o.weight));
    if (byWeight.off) return offChart(byWeight, wt, spec.weightLabel || 'weight', o.weight);
  }
  let byAge = null;
  if (hasA && spec.ageTable) {
    const at = spec.ageTable;
    const f = inputFault([[`the ${spec.ageLabel || 'age'}`, o.age, 0, spec.maxAge ?? 1200, at.unit]]);
    if (f) return { valid: false, message: f };
    byAge = findBand(at, Number(o.age));
    if (byAge.off && !byWeight) return offChart(byAge, at, spec.ageLabel || 'age', o.age);
  }
  if (byWeight) {
    if (byAge && !byAge.off && byAge.band.dose !== byWeight.band.dose) {
      notes.push(`The ${spec.ageLabel || 'age'} falls in a different band (${byAge.band.dose}); the ${spec.weightLabel || 'weight'} is used, as the chart instructs.`);
    }
    return { valid: true, band: byWeight.band, by: 'weight', notes };
  }
  notes.push(`No ${spec.weightLabel || 'weight'} was entered, so the ${spec.ageLabel || 'age'} band is used. Weigh when you can: the chart uses weight first.`);
  return { valid: true, band: byAge.band, by: 'age', notes };
}

function offChart(found, table, label, raw) {
  const where = rangeText(found.range, table.unit);
  if (found.off === 'gap') return { valid: false, message: `${raw} ${table.unit} falls in a gap of this chart (${bandText(found.band, table.unit)}): it gives no dose there. Follow your national protocol.` };
  return { valid: false, message: `${raw} ${table.unit} is outside this chart, which covers ${where}. It gives no dose ${found.off === 'below' ? 'below' : 'above'} that range.` };
}

// achievedPerKg(doseMg, weightKg, [lo, hi]) -> { perKg, outside } -- for showing beside a band dose only.
export function achievedPerKg(doseMg, weightKg, target) {
  const perKg = Math.round((doseMg / weightKg) * 10) / 10;
  const outside = Array.isArray(target) ? perKg < target[0] || perKg > target[1] : false;
  return { perKg, outside };
}
