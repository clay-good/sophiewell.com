// spec-v1630 tool 3: an IV order's rate and concentration against the label.
//
//   rate = dose / infusion time;  concentration = dose / final volume
//   shortest time that meets a maximum rate = dose / that rate
//
// Six drugs with a numeric limit on the label. Label rows (spec-v1628 section 1), each re-read on
// DailyMed on October 11, 2026, on a manufacturer's label:
//   Phenytoin sodium (Hikma, version 27): "should not exceed 50 mg per minute in adults and 1 to 3
//     mg/kg/min (or 50 mg per minute, whichever is slower) in pediatric patients"; diluted in normal
//     saline to "no less than 5 mg/mL"; the infusion "must be completed within 1 to 4 hours".
//   Fosphenytoin (Cerebyx, Pfizer, version 38): "should not exceed 150 mg phenytoin sodium
//     equivalents (PE) per minute in adults and 2 mg PE/kg/min (or 150 mg PE/min, whichever is
//     slower) in pediatric patients"; diluted "to a concentration ranging from 1.5 to 25 mg PE/mL".
//   Vancomycin (Hospira pharmacy bulk package, version 19): "Concentrations of no more than 5 mg/mL
//     and rates of no more than 10 mg/min, are recommended in adults"; "a concentration up to 10
//     mg/mL may be used" in fluid restriction, with more infusion-related events; each dose over at
//     least 60 minutes.
//   Potassium chloride concentrate (Hospira, version 23): with serum potassium above 2.5 mEq/L, "a
//     rate not to exceed 10 mEq/hour in a concentration of up to 40 mEq/liter. The 24-hour total dose
//     should not exceed 200 mEq." Urgent (below 2.0 mEq/L with ECG changes or paralysis): "very
//     cautiously at a rate of up to 40 mEq/hour ... continuous cardiac monitoring is essential. As
//     much as 400 mEq may be administered in a 24 hour period."
//   Magnesium sulfate 50% (Fresenius Kabi, version 9): "should generally not exceed 150 mg/minute
//     ... except in severe eclampsia with seizures"; "must be diluted to a concentration of 20% or
//     less prior to IV infusion".
//   Calcium gluconate (WG Critical Care, version 5): bolus, "do not exceed an infusion rate of 200
//     mg/minute in adults or 100 mg/minute in pediatric patients", diluted to "10 mg/mL to 50 mg/mL";
//     continuous infusion diluted to "5.8 mg/mL to 10 mg/mL".
// The spec's phenytoin and magnesium labels were distributor copies; the same sentences were read on
// the Hikma and Fresenius Kabi labels, and those are the rows.
//
// A drug's figures answer only while its label stands (lib/label-row.js); otherwise the rate and
// concentration are still shown and the comparison withheld. Potassium phosphates is a separate tool.
// The tool reports where an order sits against the label. It does not say what rate to run.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const DRUGS = {
  phenytoin: { name: 'phenytoin sodium', unit: 'mg', setId: '035a8d4e-2063-4240-83cb-d7eebcabe301', perKg: true },
  fosphenytoin: { name: 'fosphenytoin (Cerebyx)', unit: 'mg PE', setId: 'd4c36fad-0ba2-4cd4-9c5e-dcf843f38a5a', perKg: true },
  vancomycin: { name: 'vancomycin', unit: 'mg', setId: 'b01aaa02-8f1d-4b57-96a5-337503428af1' },
  'potassium-chloride': { name: 'potassium chloride', unit: 'mEq', setId: '559a0a8c-a8fe-40a5-b196-21f9308780ab', settings: ['routine', 'urgent'] },
  'magnesium-sulfate': { name: 'magnesium sulfate', unit: 'mg', setId: 'e9c10579-29f3-4889-8881-0626f63968d4' },
  'calcium-gluconate': { name: 'calcium gluconate', unit: 'mg', setId: '16307c00-d0d5-4e05-821f-17b0c1a29fc9', settings: ['bolus', 'continuous'] },
};
export const DRUG_OPTIONS = [
  { value: 'phenytoin', text: 'Phenytoin sodium (mg)' },
  { value: 'fosphenytoin', text: 'Fosphenytoin, Cerebyx (mg PE)' },
  { value: 'vancomycin', text: 'Vancomycin (mg)' },
  { value: 'potassium-chloride', text: 'Potassium chloride (mEq)' },
  { value: 'magnesium-sulfate', text: 'Magnesium sulfate (mg)' },
  { value: 'calcium-gluconate', text: 'Calcium gluconate (mg)' },
];
export const POPULATIONS = [
  { value: 'adult', text: 'Adult' },
  { value: 'pediatric', text: 'Pediatric' },
];
export const SETTINGS = [
  { value: 'routine', text: 'Potassium: serum potassium above 2.5 mEq/L' },
  { value: 'urgent', text: 'Potassium: urgent (under 2 mEq/L with ECG changes or paralysis)' },
  { value: 'bolus', text: 'Calcium: bolus' },
  { value: 'continuous', text: 'Calcium: continuous infusion' },
];
export const WEIGHT_UNITS = [
  { value: 'kg', text: 'kg' },
  { value: 'lb', text: 'lb' },
  { value: 'g', text: 'g' },
];
const TO_KG = { kg: 1, lb: 0.45359237, g: 0.001 };
const NOTE = 'The tool sets an order beside the label\'s limits; it does not say what rate to run. Labels carry monitoring, route and compatibility instructions that are not checked here.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
const has = (list, v) => list.some((x) => x.value === v);

export function ivLabelRateCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.drug ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(DRUGS, key)) return { valid: false, message: 'Choose the drug: this tool covers six whose labels state a numeric rate or concentration limit.' };
  const d = DRUGS[key];
  const pop = String(o.population ?? '').trim();
  if (!has(POPULATIONS, pop)) return { valid: false, message: 'Choose adult or pediatric: the labels give different limits.' };
  const setting = String(o.setting ?? '').trim();
  if (d.settings) {
    if (!d.settings.includes(setting)) return { valid: false, message: key === 'potassium-chloride' ? 'Choose the potassium setting: serum potassium above 2.5 mEq/L, or urgent. The label gives a different limit for each.' : 'Choose bolus or continuous infusion: the label gives a different concentration for each.' };
  } else if (setting) return { valid: false, message: `The setting applies to potassium chloride and calcium gluconate only. Clear it for ${d.name}.` };
  const pediatricPerKg = d.perKg && pop === 'pediatric';
  let kg = null;
  if (pediatricPerKg || !blank(o.weight)) {
    const wu = String(o.weightUnit ?? '').trim();
    if (!Object.prototype.hasOwnProperty.call(TO_KG, wu)) return { valid: false, message: pediatricPerKg ? 'Enter the weight and choose its unit: the pediatric limit is per kilogram.' : 'Choose the weight unit, or clear the weight.' };
    const wf = inputFault([['the weight', o.weight, null, wu === 'g' ? 500000 : wu === 'lb' ? 1100 : 500, wu]]);
    if (wf) return { valid: false, message: wf };
    kg = Number(o.weight) * TO_KG[wu];
    if (kg < 0.2) return { valid: false, message: 'That weight is below the 0.2 kg this tool accepts. Check the weight and its unit.' };
  }
  const f = inputFault([['the dose', o.dose, null, 1e6, d.unit], ['the final volume', o.finalVolume, null, 20000, 'mL'], ['the infusion time', o.minutes, null, 2880, 'minutes']]);
  if (f) return { valid: false, message: f };
  const dose = Number(o.dose); const volume = Number(o.finalVolume); const minutes = Number(o.minutes);
  const perMin = dose / minutes; const perHour = perMin * 60; const conc = dose / volume;
  const hourly = key === 'potassium-chloride';
  const u = d.unit;
  const rateText = hourly ? `${show(perHour)} ${u}/hour` : `${show(perMin)} ${u}/minute`;
  const concText = hourly ? `${show(conc * 1000)} ${u}/L` : `${show(conc)} ${u}/mL`;
  const notes = [`${show(dose)} ${u} in ${show(volume)} mL over ${show(minutes)} minutes: ${rateText}, at ${concText}.`];
  const out = { valid: true, ratePerMinute: sig(perMin), ratePerHour: sig(perHour), concentrationPerMl: sig(conc) };
  const head = `${d.name[0].toUpperCase()}${d.name.slice(1)} at ${rateText} and ${concText}`;
  const row = labelRow(d.setId, now, table);
  if (!row.answers) {
    notes.push(`The ${d.name} label figures are withheld: ${row.why}.`);
    return { ...out, withheld: true, labelUrl: row.url, band: `${head}. The label comparison is withheld.`, bandLabel: rateText, notes, note: NOTE };
  }
  const flags = [];
  const rate = (max, unit, what, perMinuteMax = max) => {
    const actual = hourly ? perHour : perMin;
    const over = sig(actual) > max;
    out.rateAgainst = over ? 'above' : 'at or under'; out.labelMaxRate = sig(max);
    const shortest = hourly ? (dose / max) * 60 : dose / perMinuteMax;
    out.shortestMinutes = sig(shortest);
    if (over) flags.push('rate above the label limit');
    notes.push(`Rate: ${rateText} is ${over ? 'above' : 'at or under'} ${what} (${show(max)} ${unit}). The shortest time that meets it for this dose is ${show(shortest)} minutes.`);
  };
  const upper = (max, what) => { const over = sig(conc) > max; if (over) flags.push('concentration above the label limit'); out.concentrationAgainst = over ? 'above' : 'at or under'; notes.push(`Concentration: ${concText} is ${over ? 'above' : 'at or under'} ${what}.`); };

  if (key === 'phenytoin' || key === 'fosphenytoin') {
    const cap = key === 'phenytoin' ? 50 : 150; const perKgMax = key === 'phenytoin' ? 3 : 2;
    const max = pop === 'adult' ? cap : Math.min(perKgMax * kg, cap);
    rate(max, `${u}/minute`, pop === 'adult' ? `the label's adult limit` : `the label's pediatric limit of ${perKgMax} ${u}/kg/minute or ${cap} ${u}/minute, whichever is slower, at ${show(kg)} kg`);
    if (key === 'phenytoin') {
      const thin = sig(conc) < 5;
      out.concentrationAgainst = thin ? 'below' : 'at or above';
      if (thin) flags.push('more dilute than the label allows');
      notes.push(`Concentration: ${concText} is ${thin ? 'below' : 'at or above'} the 5 mg/mL the label gives as the least for an infusion in normal saline.`);
      const late = minutes > 240;
      if (late) flags.push('longer than 4 hours');
      notes.push(`Time: the label says the infusion must be completed within 1 to 4 hours of mixing; ${show(minutes)} minutes is ${late ? 'longer than' : 'within'} 4 hours.`);
    } else {
      const where = sig(conc) > 25 ? 'above' : sig(conc) < 1.5 ? 'below' : 'within';
      out.concentrationAgainst = where;
      if (where === 'above') flags.push('concentration above the label limit');
      notes.push(`Concentration: ${concText} is ${where} the label's 1.5 to 25 mg PE/mL${where === 'below' ? ' (more dilute than the range it gives)' : ''}.`);
      if (pop === 'pediatric') notes.push('For a pediatric maintenance dose the label gives 1 to 2 mg PE/kg/minute or 100 mg PE/minute, whichever is slower; the loading-dose limit is the one applied here.');
    }
  } else if (key === 'vancomycin') {
    if (pop === 'adult') rate(10, 'mg/minute', 'the 10 mg/minute the label recommends in adults');
    const short = minutes < 60;
    out.durationAgainst = short ? 'under 60 minutes' : '60 minutes or more';
    if (short) flags.push('shorter than 60 minutes');
    notes.push(`Time: the label gives each dose over at least 60 minutes; ${show(minutes)} minutes is ${short ? 'shorter than that' : 'at least that'}.`);
    if (pop === 'adult') {
      if (sig(conc) > 10) { flags.push('concentration above the label limit'); out.concentrationAgainst = 'above'; notes.push(`Concentration: ${concText} is above the 10 mg/mL the label allows even in fluid restriction.`); }
      else if (sig(conc) > 5) { out.concentrationAgainst = 'fluid-restriction range'; notes.push(`Concentration: ${concText} is above the 5 mg/mL the label recommends in adults. It allows up to 10 mg/mL in selected patients who need fluid restriction, and says that may increase infusion-related events.`); }
      else { out.concentrationAgainst = 'at or under'; notes.push(`Concentration: ${concText} is at or under the 5 mg/mL the label recommends in adults.`); }
    } else notes.push('Concentration: the label\'s 5 mg/mL recommendation is stated for adults; it is not applied to a pediatric order here.');
  } else if (key === 'potassium-chloride') {
    const urgent = setting === 'urgent';
    rate(urgent ? 40 : 10, 'mEq/hour', urgent ? 'the 40 mEq/hour the label allows, very cautiously and with continuous cardiac monitoring, in urgent treatment' : 'the 10 mEq/hour the label gives when serum potassium is above 2.5 mEq/L');
    if (!urgent) upper(0.04, 'the 40 mEq/L the label gives for that rate');
    const dayMax = urgent ? 400 : 200; const overDay = dose > dayMax;
    if (overDay) flags.push(`more than ${dayMax} mEq`);
    notes.push(`Total: the label's 24-hour total is ${dayMax} mEq in this setting; this dose alone is ${show(dose)} mEq${overDay ? ', above it' : ''}. Other potassium given the same day counts toward it.`);
    // The label read gives no pediatric limits; its figures are applied as printed, and the result says so.
    if (pop === 'pediatric') notes.push('The potassium chloride label read here gives no pediatric rate, concentration or daily limit; its figures, which are not stated for children, are the ones compared. A pediatric order needs a pediatric reference.');
  } else if (key === 'magnesium-sulfate') {
    rate(150, 'mg/minute', 'the 150 mg/minute the label says should generally not be exceeded');
    notes.push('The label makes an exception for severe eclampsia with seizures; the tool does not rule on it.');
    if (pop === 'pediatric') notes.push('The magnesium sulfate label read here gives no pediatric rate; the 150 mg/minute figure, which is not stated for children, is the one compared. A pediatric order needs a pediatric reference.');
    upper(200, 'the 20% (200 mg/mL) the label says a solution for IV infusion must be diluted to');
  } else {
    if (setting === 'bolus') {
      rate(pop === 'adult' ? 200 : 100, 'mg/minute', `the label's bolus limit for ${pop === 'adult' ? 'adults' : 'pediatric patients'}`);
      const where = sig(conc) > 50 ? 'above' : sig(conc) < 10 ? 'below' : 'within';
      out.concentrationAgainst = where;
      if (where === 'above') flags.push('concentration above the label limit');
      notes.push(`Concentration: ${concText} is ${where} the 10 to 50 mg/mL the label gives for a bolus.`);
    } else {
      const where = sig(conc) > 10 ? 'above' : sig(conc) < 5.8 ? 'below' : 'within';
      out.concentrationAgainst = where;
      if (where === 'above') flags.push('concentration above the label limit');
      notes.push(`Concentration: ${concText} is ${where} the 5.8 to 10 mg/mL the label gives for a continuous infusion. The label sets the continuous rate by serum calcium and gives no maximum to compare.`);
    }
  }
  notes.push(`Label: ${row.edition}.`);
  return {
    ...out, flags, abnormal: flags.length > 0,
    band: `${head}: ${flags.length ? flags.join('; ') : 'nothing above the label limits checked'}.${pop === 'pediatric' && (key === 'potassium-chloride' || key === 'magnesium-sulfate') ? ' The label gives no pediatric limits; these are its unqualified figures.' : ''}`,
    bandLabel: flags.length ? `${flags.length} outside the label` : 'Within the label limits checked',
    notes, note: NOTE,
  };
}
