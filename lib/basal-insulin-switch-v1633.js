// spec-v1633 tool 8: basal insulin switch, the starting dose the target product's label gives.
//
// Four label rows (spec-v1628 section 1), each re-read on October 11, 2026, section 2.4 of each:
//   Lantus (version 35): "Once-daily TOUJEO ... to once-daily LANTUS ... 80% of the TOUJEO dosage";
//     "Once-daily NPH insulin to once-daily LANTUS ... the same as the dosage of NPH"; "Twice-daily
//     NPH insulin to once-daily LANTUS ... 80% of the total NPH dosage".
//   Basaglar (version 35): from "another insulin glargine product, 100 units/mL ... the same"; from
//     "a once-daily insulin glargine product, 300 units/mL ... 80%"; "from twice-daily NPH insulin
//     ... 80% of the total daily NPH dosage"; otherwise "a change in the dose of the basal insulin
//     may be required" (no figure).
//   Toujeo (version 25): "currently on once-daily long or intermediate-acting insulin, start TOUJEO
//     at the same unit dose"; "For patients controlled on LANTUS ... expect that a higher daily dose
//     of TOUJEO will be needed"; "currently on twice-daily long or intermediate-acting insulin, start
//     TOUJEO at 80% of the total daily NPH or insulin detemir twice-daily dosage".
//   Tresiba (version 14): adults, "the same unit dose as the total daily long or intermediate-acting
//     insulin unit dose"; pediatric patients 1 year and older, "80% of the total daily long or
//     intermediate-acting insulin unit dose".
//
// A pair the target label does not address returns that statement and no figure. The labels state no
// rounding rule; a fraction is rounded down to a whole unit here and the result says so.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const TARGETS = [
  { value: 'lantus', text: 'Lantus (insulin glargine 100 units/mL)', brand: 'Lantus', setId: 'd5e07a0c-7e14-4756-9152-9fea485d654a' },
  { value: 'basaglar', text: 'Basaglar (insulin glargine 100 units/mL)', brand: 'Basaglar', setId: '0ad21db3-2b1c-4ed9-a687-bdd6a74d0aae' },
  { value: 'toujeo', text: 'Toujeo (insulin glargine 300 units/mL)', brand: 'Toujeo', setId: 'c9561d96-124d-48ca-982f-0aa1575bff36' },
  { value: 'tresiba', text: 'Tresiba (insulin degludec)', brand: 'Tresiba', setId: '456c5e87-3dfd-46fa-8ac0-c6128d4c97c6' },
];
export const SOURCES = [
  { value: 'glargine100', text: 'Insulin glargine 100 units/mL (Lantus, Basaglar or another)', name: 'insulin glargine 100 units/mL' },
  { value: 'glargine300', text: 'Insulin glargine 300 units/mL (Toujeo)', name: 'insulin glargine 300 units/mL' },
  { value: 'nph', text: 'NPH insulin', name: 'NPH insulin' },
  { value: 'detemir', text: 'Insulin detemir', name: 'insulin detemir' },
  { value: 'degludec', text: 'Insulin degludec (Tresiba)', name: 'insulin degludec' },
];
export const FREQUENCIES = [{ value: 'once', text: 'Once daily' }, { value: 'twice', text: 'Twice daily' }];
export const POPULATIONS = [{ value: 'adult', text: 'Adult' }, { value: 'pediatric', text: 'Pediatric' }];
const SAME_PRODUCT = { lantus: null, basaglar: null, toujeo: 'glargine300', tresiba: 'degludec' };
const NOTE = 'This reports what the target product\'s label gives for these inputs. It does not prescribe. Every one of these labels says to increase glucose monitoring when the insulin regimen changes.';

// -> { percent, why } when the label gives a figure, or { none: sentence } when it does not.
function rule(to, from, freq, pop) {
  if (to === 'lantus') {
    if (from === 'glargine300' && freq === 'once') return { percent: 80, why: 'once-daily Toujeo to once-daily Lantus: 80% of the Toujeo dosage being discontinued' };
    if (from === 'nph' && freq === 'once') return { percent: 100, why: 'once-daily NPH to once-daily Lantus: the same as the NPH dosage being discontinued' };
    if (from === 'nph' && freq === 'twice') return { percent: 80, why: 'twice-daily NPH to once-daily Lantus: 80% of the total NPH dosage being discontinued' };
    return { none: 'The Lantus label gives figures for three switches only: from once-daily Toujeo, from once-daily NPH and from twice-daily NPH.' };
  }
  if (to === 'basaglar') {
    if (from === 'glargine100') return { percent: 100, why: 'another insulin glargine product, 100 units/mL, to Basaglar: the same dose' };
    if (from === 'glargine300' && freq === 'once') return { percent: 80, why: 'a once-daily insulin glargine product, 300 units/mL, to once-daily Basaglar: 80%' };
    if (from === 'nph' && freq === 'twice') return { percent: 80, why: 'twice-daily NPH to once-daily Basaglar: 80% of the total daily NPH dosage' };
    return { none: 'For other intermediate- or long-acting insulins the Basaglar label says only that a change in the dose of the basal insulin may be required.' };
  }
  if (to === 'toujeo') {
    if (freq === 'once') return { percent: 100, why: 'once-daily long or intermediate-acting insulin to Toujeo: the same unit dose', extra: from === 'glargine100' ? 'For patients controlled on Lantus the label says to expect that a higher daily dose of Toujeo will be needed to maintain the same glycemic control.' : null };
    if (from === 'nph' || from === 'detemir') return { percent: 80, why: 'twice-daily long or intermediate-acting insulin to Toujeo: 80% of the total daily NPH or insulin detemir twice-daily dosage' };
    return { none: 'For a twice-daily regimen the Toujeo label names NPH and insulin detemir only (80% of the total); it gives no figure for this insulin taken twice daily.' };
  }
  if (pop === 'pediatric') return { percent: 80, why: 'pediatric patients 1 year of age and older: 80% of the total daily long or intermediate-acting insulin unit dose' };
  return { percent: 100, why: 'adults: the same unit dose as the total daily long or intermediate-acting insulin unit dose' };
}

export function basalInsulinSwitch(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const to = TARGETS.find((t) => t.value === String(o.to ?? '').trim());
  if (!to) return { valid: false, message: 'Choose the basal insulin being started. The starting dose comes from its label.' };
  const from = SOURCES.find((s) => s.value === String(o.from ?? '').trim());
  if (!from) return { valid: false, message: 'Choose the basal insulin being stopped.' };
  if (SAME_PRODUCT[to.value] === from.value) return { valid: false, message: `${to.brand} is ${from.name}: choose two different insulins.` };
  const freq = String(o.frequency ?? '').trim();
  if (freq !== 'once' && freq !== 'twice') return { valid: false, message: 'Say whether the current basal insulin is taken once or twice daily: the labels give different figures.' };
  let pop = null;
  if (to.value === 'tresiba') {
    pop = String(o.population ?? '').trim();
    if (pop !== 'adult' && pop !== 'pediatric') return { valid: false, message: 'Choose adult or pediatric: the Tresiba label starts children at 80% and adults at the same dose.' };
  }
  const f = inputFault([['the current total daily basal dose', o.totalUnits, null, 1000, 'units']]);
  if (f) return { valid: false, message: f };
  const units = Number(o.totalUnits);
  const lr = labelRow(to.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, labelUrl: lr.url, band: `The ${to.brand} label's switching figures are withheld, so no starting dose is reported.`, bandLabel: 'Withheld', notes: [`The ${to.brand} label rows are withheld: ${lr.why}.`, 'Read the starting dose from the label in hand.'], note: NOTE };
  const r = rule(to.value, from.value, freq, pop);
  const base = { valid: true, to: to.value, from: from.value, frequency: freq, labelUrl: lr.url, note: NOTE };
  const tail = [`Label: ${lr.edition}.`];
  if (r.none) {
    return { ...base, flag: 'no-recommendation-given', abnormal: true, band: `The ${to.brand} label gives no figure for a switch from ${freq === 'once' ? 'once-daily' : 'twice-daily'} ${from.name}. ${r.none}`, bandLabel: 'No figure given', notes: tail };
  }
  const exact = (units * r.percent) / 100; const start = Math.floor(exact);
  const notes = [`${to.brand} label, section 2.4: ${r.why}.`];
  if (r.extra) notes.push(r.extra);
  if (start !== exact) notes.push(`${r.percent}% of ${units} units is ${Number(exact.toFixed(2))} units. The labels state no rounding rule; rounding down to a whole unit is this tool's convention.`);
  if (to.value === 'tresiba' && pop === 'pediatric') notes.push('The label\'s pediatric switching figure is for patients 1 year of age and older.');
  if (start === 0) return { ...base, flag: 'no-recommendation-given', abnormal: true, percent: r.percent, band: `${r.percent}% of ${units} units is below 1 unit, so no whole-unit starting dose is reported.`, bandLabel: 'Below 1 unit', notes: [...notes, ...tail] };
  return { ...base, flag: 'dose', abnormal: false, percent: r.percent, startUnits: start, band: `The ${to.brand} label starts at ${r.percent === 100 ? 'the same unit dose' : `${r.percent}% of the total`}: ${start} unit${start === 1 ? '' : 's'} once daily, from ${units} units a day of ${from.name}.`, bandLabel: `${start} units once daily`, notes: [...notes, ...tail] };
}
