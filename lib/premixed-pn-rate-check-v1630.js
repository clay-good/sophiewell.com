// spec-v1630 tool 11: a premixed parenteral nutrition bag, rate against the label's adult maximum.
//
//   mL/kg/hour = rate (mL/hour) / weight, or volume / hours / weight
//   amino acids and dextrose, g/kg/hour = mL/kg/hour x the formulation's percent / 100
//
// The maximums are label rows (spec-v1628 section 1), re-read on DailyMed on October 11, 2026, each
// label's Table 2, "Maximum Infusion Rate in Adult Patients" (mL/kg/hour):
//   Clinimix E (Baxter, version 17)  2.75/5 3.6; 4.25/5 2.4; 4.25/10 2.4; 5/15 1.67; 5/20 1.25;
//                                    8/10 1.3; 8/14 1.3. "For central vein infusion only: CLINIMIX E
//                                    4.25/10, 5/15, 5/20, 8/10, 8/14".
//   Clinimix (Baxter, version 14)    4.25/5 2.4; 4.25/10 2.4; 5/15 1.67; 5/20 1.25; 6/5 1.67;
//                                    8/10 1.3; 8/14 1.3. Central vein only: the same five.
//   Kabiven (Fresenius Kabi, v. 9)   "The maximum infusion rate of KABIVEN is 2.6 mL/kg/hour. This
//                                    corresponds to 0.09 g/kg/hour of amino acids, 0.28 g/kg/hour of
//                                    dextrose (the rate limiting factor) and 0.1 g/kg/hour of
//                                    lipids"; "should not exceed 40 mL/kg/day"; central vein only.
// A formulation is named by its amino acid and dextrose percents (4.25/10 is 4.25% and 10%), which
// is how the nutrient rates are worked out; Kabiven's are taken by proportion from the label's own
// figures at its maximum rate.
//
// Adult maximums only: the labels dose pediatric patients by protein, not by a rate table, and the
// result says so. Perikabiven was not read and is not included. A row answers only while its label
// stands (lib/label-row.js); otherwise the rate per kilogram is still shown and the maximum withheld.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

const E = '8469d6fb-d6ef-476f-8cc3-0905192de0a8';
const C = 'dccff103-8695-400c-a15d-cc2fd078760a';
const K = 'afeb4837-a759-4484-a76e-e04611c459e7';
const mix = (brand, setId, aa, dex, max, central) => ({ name: `${brand} ${aa}/${dex}`, setId, aa, dex, max, central });
export const FORMULATIONS = {
  'clinimix-e-2.75-5': mix('Clinimix E', E, 2.75, 5, 3.6, false),
  'clinimix-e-4.25-5': mix('Clinimix E', E, 4.25, 5, 2.4, false),
  'clinimix-e-4.25-10': mix('Clinimix E', E, 4.25, 10, 2.4, true),
  'clinimix-e-5-15': mix('Clinimix E', E, 5, 15, 1.67, true),
  'clinimix-e-5-20': mix('Clinimix E', E, 5, 20, 1.25, true),
  'clinimix-e-8-10': mix('Clinimix E', E, 8, 10, 1.3, true),
  'clinimix-e-8-14': mix('Clinimix E', E, 8, 14, 1.3, true),
  'clinimix-4.25-5': mix('Clinimix', C, 4.25, 5, 2.4, false),
  'clinimix-4.25-10': mix('Clinimix', C, 4.25, 10, 2.4, true),
  'clinimix-5-15': mix('Clinimix', C, 5, 15, 1.67, true),
  'clinimix-5-20': mix('Clinimix', C, 5, 20, 1.25, true),
  'clinimix-6-5': mix('Clinimix', C, 6, 5, 1.67, false),
  'clinimix-8-10': mix('Clinimix', C, 8, 10, 1.3, true),
  'clinimix-8-14': mix('Clinimix', C, 8, 14, 1.3, true),
  kabiven: { name: 'Kabiven', setId: K, max: 2.6, central: true, atMax: { aa: 0.09, dex: 0.28, lipid: 0.1 }, maxDaily: 40 },
};
export const FORMULATION_OPTIONS = Object.entries(FORMULATIONS).map(([value, f]) => ({ value, text: f.name }));
export const WEIGHT_UNITS = [
  { value: 'kg', text: 'kg' },
  { value: 'lb', text: 'lb' },
];
const TO_KG = { kg: 1, lb: 0.45359237 };
const NOTE = 'Adult maximums only: the labels dose pediatric patients by protein, not by a rate table. The tool sets a rate beside the label\'s maximum; it does not say what rate to run.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function premixedPnRateCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.formulation ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(FORMULATIONS, key)) return { valid: false, message: 'Choose the formulation: each has its own maximum rate on the label.' };
  const f = FORMULATIONS[key];
  const wu = String(o.weightUnit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(TO_KG, wu)) return { valid: false, message: 'Choose the weight unit: kg or lb.' };
  const wf = inputFault([['the weight', o.weight, 20, wu === 'lb' ? 1100 : 500, wu]]);
  if (wf) return { valid: false, message: `${wf} These are adult maximums.` };
  const kg = Number(o.weight) * TO_KG[wu];

  const byRate = !blank(o.rate); const byVolume = !blank(o.volume) || !blank(o.hours);
  if (byRate === byVolume) return { valid: false, message: 'Enter the rate in mL/hour, or the volume and the hours it runs over, not both.' };
  let rate; let daily = null; let how;
  if (byRate) {
    const rf = inputFault([['the rate', o.rate, null, 5000, 'mL/hour']]);
    if (rf) return { valid: false, message: rf };
    rate = Number(o.rate); how = `${show(rate)} mL/hour`;
  } else {
    const vf = inputFault([['the volume', o.volume, null, 20000, 'mL'], ['the hours', o.hours, null, 24, 'hours']]);
    if (vf) return { valid: false, message: vf };
    daily = Number(o.volume); rate = daily / Number(o.hours); how = `${show(daily)} mL over ${show(Number(o.hours))} hours = ${show(rate)} mL/hour`;
  }
  const perKg = rate / kg;
  const notes = [`${how}; ÷ ${show(kg)} kg = ${show(perKg)} mL/kg/hour.`];
  const out = { valid: true, mLPerHour: sig(rate), mLPerKgHour: sig(perKg), weightKg: sig(kg) };
  const row = labelRow(f.setId, now, table);
  const head = `${show(perKg)} mL/kg/hour of ${f.name}`;
  if (!row.answers) {
    notes.push(`The ${f.name} label figures are withheld: ${row.why}.`);
    return { ...out, withheld: true, labelUrl: row.url, band: `${head}. The label maximum is withheld.`, bandLabel: `${show(perKg)} mL/kg/hour`, notes, note: NOTE };
  }
  const over = sig(perKg) > f.max;
  const flags = over ? ['rate above the label maximum'] : [];
  out.rateAgainst = over ? 'above' : 'at or under'; out.labelMaximum = f.max;
  notes.push(`${show(perKg)} mL/kg/hour is ${over ? 'above' : 'at or under'} the label's adult maximum of ${show(f.max)} mL/kg/hour for ${f.name} (${row.edition}).`);
  if (f.atMax) {
    const k = perKg / f.max;
    Object.assign(out, { aminoAcidGPerKgHour: sig(f.atMax.aa * k), dextroseGPerKgHour: sig(f.atMax.dex * k), lipidGPerKgHour: sig(f.atMax.lipid * k) });
    notes.push(`That delivers about ${show(f.atMax.aa * k)} g/kg/hour of amino acids, ${show(f.atMax.dex * k)} of dextrose and ${show(f.atMax.lipid * k)} of lipid, by proportion from the label's figures at its maximum rate (0.09, 0.28 and 0.1; dextrose is the rate-limiting factor).`);
    if (daily !== null) {
      const dayKg = daily / kg; const overDay = sig(dayKg) > f.maxDaily;
      out.mLPerKgDay = sig(dayKg); out.dailyAgainst = overDay ? 'above' : 'at or under';
      if (overDay) flags.push('volume above 40 mL/kg/day');
      notes.push(`${show(daily)} mL is ${show(dayKg)} mL/kg/day, ${overDay ? 'above' : 'at or under'} the 40 mL/kg/day the label says the adult daily dosage should not exceed.`);
    } else notes.push('The label also says the adult daily dosage should not exceed 40 mL/kg/day; enter the volume and hours to set the day\'s volume beside it.');
  } else {
    const aa = (perKg * f.aa) / 100; const dex = (perKg * f.dex) / 100;
    Object.assign(out, { aminoAcidGPerKgHour: sig(aa), dextroseGPerKgHour: sig(dex) });
    notes.push(`That delivers ${show(aa)} g/kg/hour of amino acids (${show(f.aa)}%) and ${show(dex)} g/kg/hour of dextrose (${show(f.dex)}%).`);
  }
  notes.push(f.central ? `Route: the label gives ${f.name} for central vein infusion only.` : `Route: the label gives ${f.name} for central or peripheral vein infusion.`);
  return {
    ...out, flags, centralOnly: f.central, abnormal: flags.length > 0,
    band: `${head}: ${flags.length ? flags.join('; ') : `at or under the label's adult maximum of ${show(f.max)}`}. ${f.central ? 'Central vein only.' : 'Central or peripheral vein.'}`,
    bandLabel: over ? 'Above the label maximum' : 'At or under the label maximum',
    notes, note: NOTE,
  };
}
