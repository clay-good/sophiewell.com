// spec-v1635 tool 14: capecitabine dose in whole tablets, as the Xeloda label states it.
//
// Source: Xeloda (capecitabine) label, DailyMed set id e702d84d-..., version 32, re-read October 11,
// 2026:
//   2.1, 2.2  starting doses include 1,250 mg/m2 and 1,000 mg/m2 twice daily for the first 14 days of
//        each 21-day cycle, and 825 mg/m2 twice daily with radiation.
//   2.7  "Reduce the dose of XELODA by 25% for patients with creatinine clearance (CLcr) of 30 to 50
//        mL/min as determined by Cockcroft-Gault equation. A dosage has not been established in
//        patients with severe renal impairment (CLcr <30 mL/min)".
//   2.8  "Round the recommended dosage for patients to the nearest 150 mg dose to provide whole
//        XELODA tablets."
// Tablets are 150 mg and 500 mg. The current label has no body-surface-area tablet table, only the
// rounding rule, and it does not say which way a dose exactly halfway between two multiples of 150 mg
// goes: both are shown. A multiple of 150 mg can use 500 mg tablets only three at a time (1,500 mg),
// so the tablet counts can be large; the tool reports that as it is.
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'Xeloda', setId: 'e702d84d-7162-4751-bf37-d724cc7e45a5' };
export const LEVELS = [
  { value: '1250', text: '1,250 mg/m² twice daily' },
  { value: '1000', text: '1,000 mg/m² twice daily' },
  { value: '825', text: '825 mg/m² twice daily (with radiation)' },
  { value: 'typed', text: 'Another dose level (type it)' },
];
export const PERCENTS = [{ value: '100', text: '100% (no reduction)' }, { value: '75', text: '75%' }, { value: '50', text: '50%' }];
const NOTE = 'The label\'s arithmetic for a dose the prescriber has chosen: it does not choose the dose level or the percent reduction, which the label ties to the indication and to the grade of toxicity. Creatinine clearance is by Cockcroft-Gault, as the label says.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n0 = (x) => Math.round(x).toLocaleString('en-US');

// The fewest tablets of 500 mg and 150 mg that make a multiple of 150 mg exactly.
function tablets(dose) {
  let best = null;
  for (let a = 0; 500 * a <= dose; a += 3) {
    const b = (dose - 500 * a) / 150;
    if (Number.isInteger(b) && (!best || a + b < best.t500 + best.t150)) best = { t500: a, t150: b };
  }
  return best;
}
const mix = (t) => [t.t500 ? `${t.t500} × 500 mg` : null, t.t150 ? `${t.t150} × 150 mg` : null].filter(Boolean).join(' and ');

export function capecitabineTabletDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const lvl = LEVELS.find((l) => l.value === String(o.level ?? '').trim());
  if (!lvl) return { valid: false, message: 'Choose the dose level per dose (mg/m² twice daily), or "another dose level".' };
  let level = Number(lvl.value);
  if (lvl.value === 'typed') { const tf = inputFault([['the dose level', o.typedLevel, null, 3000, 'mg/m² per dose']]); if (tf) return { valid: false, message: tf }; level = Number(o.typedLevel); }
  const f = inputFault([['the body surface area', o.bsa, 0.2, 3.5, 'm²'], ['the creatinine clearance', o.crcl, 0, 300, 'mL/min']]);
  if (f) return { valid: false, message: f };
  const pct = PERCENTS.find((p) => p.value === String(o.percent ?? '').trim());
  if (!pct) return { valid: false, message: 'Choose the percent of the dose for this cycle: 100, 75 or 50.' };
  let daysOn = null;
  if (!blank(o.daysOn)) { const df = inputFault([['the days of treatment in the cycle', o.daysOn, null, 60, '']]); if (df) return { valid: false, message: df }; daysOn = Number(o.daysOn); if (!Number.isInteger(daysOn)) return { valid: false, message: 'Enter the days of treatment as a whole number.' }; }
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The Xeloda label rules are withheld: ${lr.why}. Read the rounding and renal rules from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const tail = `Label: ${lr.edition}.`;
  const crcl = Number(o.crcl);
  if (crcl < 30) return { valid: true, flag: 'not-established', abnormal: true, labelUrl: lr.url, band: `Creatinine clearance ${crcl} mL/min is below 30: the label says a dosage has not been established in severe renal impairment. No dose is given.`, bandLabel: 'Not established', notes: [tail], note: NOTE };
  const renal = crcl <= 50;
  const calc = level * Number(o.bsa) * (Number(pct.value) / 100) * (renal ? 0.75 : 1);
  const lowDose = Math.floor(calc / 150 + 1e-9) * 150; const rem = calc - lowDose;
  const tie = Math.abs(rem - 75) < 1e-6;
  const picks = tie ? [lowDose, lowDose + 150] : [rem < 75 ? lowDose : lowDose + 150];
  if (picks[0] === 0 && !tie) return { valid: true, flag: 'below-one-tablet', abnormal: true, labelUrl: lr.url, band: `The calculated dose, ${n0(calc)} mg, rounds to less than one 150 mg tablet.`, bandLabel: 'Below one tablet', notes: [tail], note: NOTE };
  const options = picks.filter((d) => d > 0).map((d) => { const t = tablets(d); return { doseMg: d, t500: t.t500, t150: t.t150, percentChange: Number((((d - calc) / calc) * 100).toFixed(1)), ...(daysOn === null ? {} : { cycle500: t.t500 * 2 * daysOn, cycle150: t.t150 * 2 * daysOn }) }; });
  const notes = [`Calculated: ${n0(level)} mg/m² × ${Number(o.bsa)} m²${pct.value === '100' ? '' : ` × ${pct.value}%`}${renal ? ' × 75% (creatinine clearance 30 to 50 mL/min)' : ''} = ${n0(calc)} mg per dose, twice daily.`];
  for (const x of options) notes.push(`${n0(x.doseMg)} mg per dose (${x.percentChange >= 0 ? '+' : ''}${x.percentChange}% from calculated): ${mix(x)} each morning and each evening.${daysOn === null ? '' : ` For ${daysOn} days: ${[x.cycle500 ? `${x.cycle500} × 500 mg` : null, x.cycle150 ? `${x.cycle150} × 150 mg` : null].filter(Boolean).join(' and ')} tablets.`}`);
  if (tie) notes.push('The calculated dose is exactly halfway between two multiples of 150 mg. The label does not say which way to round, so both are shown.');
  if (daysOn === null) notes.push('Enter the days of treatment in the cycle (for example 14) for the tablets per cycle.');
  notes.push('A multiple of 150 mg can include 500 mg tablets only in threes (1,500 mg), so the count of 150 mg tablets can be large. The label gives the rounding rule and no tablet table.', tail);
  const first = options[0];
  return { valid: true, flag: tie ? 'halfway' : renal ? 'renal-reduced' : 'rounded', abnormal: tie, labelUrl: lr.url, calculatedMg: Number(calc.toFixed(1)), renalReduction: renal, options, band: tie ? `Capecitabine ${n0(options[0].doseMg)} mg or ${n0(options[1].doseMg)} mg per dose twice daily: the calculated ${n0(calc)} mg is exactly halfway, and the label does not say which way to round.` : `Capecitabine ${n0(first.doseMg)} mg per dose twice daily (${mix(first)}), rounded from ${n0(calc)} mg to the nearest 150 mg.`, bandLabel: tie ? `${n0(options[0].doseMg)} or ${n0(options[1].doseMg)} mg` : `${n0(first.doseMg)} mg twice daily`, notes, note: NOTE };
}
