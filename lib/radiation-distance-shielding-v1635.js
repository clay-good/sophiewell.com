// spec-v1635 tool 34: dose rate at another distance, and behind lead.
//
//   Inverse square (a point source):  rate2 = rate1 x (d1 / d2)^2
//   Shielding with a typed half-value layer:  factor = 0.5^(thickness / half-value layer)
//   Shielding from a label table: the factor printed for the thickest listed lead that the shield
//   reaches. The tables give five points and the tool does not interpolate between them.
// Label tables, re-read on DailyMed October 11, 2026, each on a label row (spec-v1628 section 1):
//   Technelite, Table 2 (Tc-99m in lead): 0.023 cm, 0.5; 0.09 cm, 10^-1; 0.18 cm, 10^-2; 0.27 cm,
//   10^-3; 0.33 cm, 10^-4.
//   Cardiogen-82, Table 4 (Rb-82 in lead): 0.7 cm, 0.5; 2.3 cm, 10^-1; 4.7 cm, 10^-2; 7.0 cm, 10^-3;
//   9.3 cm, 10^-4.
// The inverse-square relation is the point-source geometry the NRC's Regulatory Guide 8.39 uses in
// its Equation 1. Point source, narrow beam: this is not a shielding design.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

const TABLES = {
  'tc-99m': { name: 'Tc-99m', label: { name: 'Technelite', setId: '3ae14c6b-3daf-4dd1-bbdb-e990fe8100e4' }, rows: [[0.023, 0.5], [0.09, 1e-1], [0.18, 1e-2], [0.27, 1e-3], [0.33, 1e-4]] },
  'rb-82': { name: 'Rb-82', label: { name: 'Cardiogen-82', setId: 'ee95aa18-9f2f-40eb-9b4c-583bea6f36bf' }, rows: [[0.7, 0.5], [2.3, 1e-1], [4.7, 1e-2], [7.0, 1e-3], [9.3, 1e-4]] },
};
export const SHIELDS = [
  { value: 'tc-99m', text: 'Tc-99m (Technelite label table)' },
  { value: 'rb-82', text: 'Rb-82 (Cardiogen-82 label table)' },
  { value: 'typed', text: 'Another source (type the half-value layer)' },
];
const NOTE = 'A point source and a narrow beam: real sources have size, rooms scatter, and thick shields build up dose, so measured rates behind a shield or close to a source can be higher than these. An estimate for planning a survey, not a shielding design and not a substitute for the survey.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => (x === 0 ? '0' : Number(x.toPrecision(3)).toLocaleString('en-US', { maximumSignificantDigits: 3 }));

export function radiationDistanceShielding(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the measured dose rate', o.rate, 0, 1e9, '']]);
  if (f) return { valid: false, message: f };
  let rate = Number(o.rate); const notes = []; const out = { valid: true }; const steps = [];
  const hasDistance = !blank(o.distance) || !blank(o.newDistance);
  const hasShield = !blank(o.shield) || !blank(o.thicknessCm) || !blank(o.halfValueLayerCm);
  if (!hasDistance && !hasShield && blank(o.doseLimit)) return { valid: false, message: 'Enter the two distances, a lead shield, or a dose to find the stay time for.' };
  if (hasDistance) {
    const df = inputFault([['the distance of the measurement', o.distance, null, 1e5, ''], ['the new distance', o.newDistance, null, 1e5, '']]);
    if (df) return { valid: false, message: `${df} Both distances are needed, in the same unit.` };
    const k = (Number(o.distance) / Number(o.newDistance)) ** 2;
    notes.push(`Distance: ${sig(rate)} × (${Number(o.distance)} ÷ ${Number(o.newDistance)})² = ${sig(rate * k)}.`);
    rate *= k; out.rateAtNewDistance = Number(rate.toPrecision(6)); steps.push('at the new distance');
  }
  if (hasShield) {
    const kind = SHIELDS.find((s) => s.value === String(o.shield ?? '').trim());
    if (!kind) return { valid: false, message: 'Choose the source for the lead shield: a label table, or a typed half-value layer.' };
    const tf = inputFault([['the lead thickness', o.thicknessCm, 0, 100, 'cm']]);
    if (tf) return { valid: false, message: tf };
    const t = Number(o.thicknessCm); let factor;
    if (kind.value === 'typed') {
      const hf = inputFault([['the half-value layer', o.halfValueLayerCm, null, 100, 'cm']]);
      if (hf) return { valid: false, message: hf };
      factor = 0.5 ** (t / Number(o.halfValueLayerCm));
      notes.push(`Shield: 0.5^(${t} ÷ ${Number(o.halfValueLayerCm)}) = a factor of ${sig(factor)}.`);
    } else {
      const src = TABLES[kind.value]; const lr = labelRow(src.label.setId, now, table);
      out.labelUrl = lr.url;
      if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The ${src.label.name} attenuation table is withheld: ${lr.why}. Type a half-value layer from the label in hand instead.`, bandLabel: 'Withheld', notes: [], note: NOTE };
      const row = [...src.rows].reverse().find(([cm]) => t >= cm - 1e-12);
      factor = row ? row[1] : 1;
      const next = src.rows.find(([cm]) => cm > t + 1e-12);
      notes.push(row
        ? `Shield: ${t} cm of lead reaches the ${src.label.name} table's ${row[0]} cm row for ${src.name}, a factor of ${row[1]}.${Math.abs(t - row[0]) < 1e-12 ? '' : next ? ` The next row is ${next[0]} cm (${next[1]}); the tool does not interpolate, so the true factor is between the two.` : ' That is the last row of the table, and no further reduction is credited.'}`
        : `Shield: ${t} cm of lead is thinner than the first row of the ${src.label.name} table (${src.rows[0][0]} cm, a factor of 0.5), so no reduction is credited.`);
      notes.push(`Label: ${lr.edition}.`);
    }
    rate *= factor; out.shieldFactor = factor; out.rateBehindShield = Number(rate.toPrecision(6)); steps.push('behind the shield');
  }
  out.rate = Number(rate.toPrecision(6));
  let band = `Estimated dose rate ${steps.length ? steps.join(' and ') : 'as measured'}: ${sig(rate)} per hour, in the unit entered.`;
  if (!blank(o.doseLimit)) {
    const lf = inputFault([['the dose to stay under', o.doseLimit, null, 1e9, '']]);
    if (lf) return { valid: false, message: lf };
    if (rate > 0) { const hours = Number(o.doseLimit) / rate; out.stayTimeHours = Number(hours.toPrecision(6)); notes.push(`Stay time: ${Number(o.doseLimit)} ÷ ${sig(rate)} per hour = ${hours >= 1 ? `${sig(hours)} hours` : `${sig(hours * 60)} minutes`}.`); band += ` Stay time to ${Number(o.doseLimit)}: ${hours >= 1 ? `${sig(hours)} hours` : `${sig(hours * 60)} minutes`}.`; }
  }
  return { ...out, flag: 'estimate', abnormal: false, band, bandLabel: `${sig(rate)} per hour`, notes, note: NOTE };
}
