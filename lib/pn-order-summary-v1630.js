// spec-v1630 tool 7: a parenteral nutrition order per kilogram, with GIR, energy and the
// calorie-to-nitrogen ratio.
//
//   g/kg/day          = grams / weight, for dextrose, amino acids and lipid; mL/kg/day likewise
//   GIR, mg/kg/min    = dextrose g x 1,000 / (weight x minutes infused)
//   dextrose g/kg/hour = dextrose g / weight / hours infused
//   energy            = dextrose g x 3.4 + amino acid g x 4 + lipid mL x the product's kcal/mL
//   non-protein kcal per g of nitrogen = (dextrose kcal + lipid kcal) / nitrogen g
//
// The energy factors and the dextrose rate are label rows (spec-v1628 section 1), re-read on DailyMed
// on October 11, 2026:
//   Dextrose Injection 50% (Hospira, version 34): "0.5 grams of dextrose, hydrous which delivers
//     3.4 kcal/gram", and "The maximum rate at which Dextrose Injection (50%) can be infused without
//     producing hyperglycemia is 0.5 g/kg of body weight/hour" (0.5 g/kg/hour is 8.33 mg/kg/min).
//   Clinimix (Baxter): its caloric content table gives 4 kcal per gram of amino acids.
//   The lipid labels in lib/lipid-emulsion-dose-check-v1630.js: 2, 3 and 1.12 kcal/mL.
// A factor answers only while its label stands; when one does not, the energy lines are withheld
// and the per-kilogram and GIR lines, which need no label, still show.
//
// Nitrogen is the reader's figure, from the amino acid product's label: products print their own
// grams of nitrogen per liter, and grams of protein / 6.25 is not assumed. No target band is given
// for the calorie-to-nitrogen ratio: no primary source read states one.
//
// Not tpn-macro, which turns a volume and percentages into grams and kcal with no weight.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { PRODUCTS as LIPIDS, PRODUCT_OPTIONS as LIPID_OPTIONS } from './lipid-emulsion-dose-check-v1630.js';

export const DEXTROSE = { setId: '4ed365da-4e62-4329-c1b9-c197ab4fb6e1', kcalPerG: 3.4, maxGPerKgHour: 0.5 };
export const AMINO_ACIDS = { setId: 'dccff103-8695-400c-a15d-cc2fd078760a', kcalPerG: 4 };
export { LIPID_OPTIONS };
export const WEIGHT_UNITS = [
  { value: 'kg', text: 'kg' },
  { value: 'lb', text: 'lb' },
  { value: 'g', text: 'g' },
];
const TO_KG = { kg: 1, lb: 0.45359237, g: 0.001 };
const NOTE = 'The tool does the arithmetic on an order and shows each factor\'s label; it sets no targets and does not say what to order. Grams of dextrose are hydrous dextrose, as the labels state them.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

export function pnOrderSummary(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const wu = String(o.weightUnit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(TO_KG, wu)) return { valid: false, message: 'Choose the weight unit: kg, lb or g.' };
  const wf = inputFault([['the weight', o.weight, null, wu === 'g' ? 500000 : wu === 'lb' ? 1100 : 500, wu]]);
  if (wf) return { valid: false, message: wf };
  const kg = Number(o.weight) * TO_KG[wu];
  if (kg < 0.2) return { valid: false, message: `A weight of ${show(Number(o.weight))} ${wu} is below the 0.2 kg this tool accepts. Check the weight and its unit.` };
  const f = inputFault([['the dextrose', o.dextroseGrams, 0, 5000, 'g'], ['the amino acids', o.aminoAcidGrams, 0, 2000, 'g'], ['the infusion hours', o.hours, null, 24, 'hours'], ['the total volume', o.volume, null, 20000, 'mL']]);
  if (f) return { valid: false, message: f };
  const dex = Number(o.dextroseGrams); const aa = Number(o.aminoAcidGrams); const hours = Number(o.hours); const volume = Number(o.volume);

  const lipidKey = String(o.lipidProduct ?? '').trim();
  let lipid = null; let lipidG = 0;
  if (lipidKey || !blank(o.lipidGrams)) {
    if (!Object.prototype.hasOwnProperty.call(LIPIDS, lipidKey)) return { valid: false, message: 'Lipid grams were entered: choose the lipid product, whose label sets its energy per mL. For no lipid, clear the grams.' };
    const lf = inputFault([['the lipid', o.lipidGrams, null, 2000, 'g']]);
    if (lf) return { valid: false, message: lf };
    lipid = LIPIDS[lipidKey]; lipidG = Number(o.lipidGrams);
  }
  let nitrogen = null;
  if (!blank(o.nitrogenGrams)) {
    const nf = inputFault([['the nitrogen', o.nitrogenGrams, null, 400, 'g']]);
    if (nf) return { valid: false, message: nf };
    nitrogen = Number(o.nitrogenGrams);
  }

  const gir = (dex * 1000) / (kg * hours * 60);
  const dexRate = dex / kg / hours;
  const notes = [
    `Per kilogram (${show(kg)} kg): dextrose ${show(dex / kg)} g/kg/day, amino acids ${show(aa / kg)} g/kg/day${lipid ? `, lipid ${show(lipidG / kg)} g/kg/day` : ''}, fluid ${show(volume / kg)} mL/kg/day.`,
    `GIR: ${show(dex)} g × 1,000 ÷ (${show(kg)} kg × ${show(hours * 60)} minutes) = ${show(gir)} mg/kg/min, which is ${show(dexRate)} g/kg/hour of dextrose.`,
  ];
  const out = {
    valid: true, weightKg: sig(kg), dextroseGPerKgDay: sig(dex / kg), aminoAcidGPerKgDay: sig(aa / kg), mLPerKgDay: sig(volume / kg),
    girMgKgMin: sig(gir), dextroseGPerKgHour: sig(dexRate), ...(lipid ? { lipidGPerKgDay: sig(lipidG / kg) } : {}),
  };
  const rows = [['dextrose', labelRow(DEXTROSE.setId, now, table)], ['amino acid', labelRow(AMINO_ACIDS.setId, now, table)]];
  if (lipid) rows.push(['lipid', labelRow(lipid.setId, now, table)]);
  const dexRow = rows[0][1];
  let abnormal = false;
  if (dexRow.answers) {
    const over = sig(dexRate) > DEXTROSE.maxGPerKgHour;
    abnormal = over; out.dextroseRateAgainst = over ? 'above' : 'at or under';
    notes.push(`That is ${over ? 'above' : 'at or under'} the 0.5 g/kg/hour (8.33 mg/kg/min) the dextrose label gives as the maximum rate without producing hyperglycemia (${dexRow.edition}).`);
  }
  const withheld = rows.filter(([, r]) => !r.answers);
  let band = `GIR ${show(gir)} mg/kg/min; dextrose ${show(dex / kg)}, amino acids ${show(aa / kg)}${lipid ? `, lipid ${show(lipidG / kg)}` : ''} g/kg/day`;
  if (withheld.length) {
    for (const [what, r] of withheld) notes.push(`The ${what} label figures are withheld: ${r.why}.`);
    notes.push('Energy and the calorie-to-nitrogen ratio need those figures, so they are not shown.');
    return { ...out, withheld: withheld.map(([what]) => what), labelUrl: withheld[0][1].url, abnormal, band: `${band}. Energy is withheld.`, bandLabel: `GIR ${show(gir)} mg/kg/min`, notes, note: NOTE };
  }
  const dexKcal = dex * DEXTROSE.kcalPerG; const aaKcal = aa * AMINO_ACIDS.kcalPerG;
  const lipidMl = lipid ? lipidG / lipid.gPerMl : 0; const lipidKcal = lipid ? lipidMl * lipid.kcalPerMl : 0;
  const total = dexKcal + aaKcal + lipidKcal;
  if (!(total > 0)) return { valid: false, message: 'The order holds no dextrose, amino acids or lipid, so there is no energy to total.' };
  const pct = (x) => show((x / total) * 100);
  notes.push(`Energy: dextrose ${show(dex)} g × 3.4 = ${show(dexKcal)} kcal (${pct(dexKcal)}%); amino acids ${show(aa)} g × 4 = ${show(aaKcal)} kcal (${pct(aaKcal)}%)${lipid ? `; ${lipid.name} ${show(lipidMl)} mL × ${show(lipid.kcalPerMl)} = ${show(lipidKcal)} kcal (${pct(lipidKcal)}%)` : ''}. Total ${show(total)} kcal, ${show(total / kg)} kcal/kg/day.`);
  notes.push(`Factors: ${rows.map(([what, r]) => `${what}, ${r.edition}`).join('; ')}.`);
  Object.assign(out, { dextroseKcal: sig(dexKcal), aminoAcidKcal: sig(aaKcal), lipidKcal: sig(lipidKcal), totalKcal: sig(total), kcalPerKgDay: sig(total / kg) });
  if (nitrogen === null) notes.push('No nitrogen was entered, so the calorie-to-nitrogen ratio is not given. Take the grams of nitrogen from the amino acid product\'s label; it is not assumed to be protein ÷ 6.25.');
  else {
    const ratio = (dexKcal + lipidKcal) / nitrogen;
    out.nonProteinKcalPerGNitrogen = sig(ratio);
    notes.push(`Non-protein kcal per gram of nitrogen: (${show(dexKcal)} + ${show(lipidKcal)}) ÷ ${show(nitrogen)} g = ${show(ratio)}. No target is shown: no primary source read states one.`);
  }
  band = `${show(total)} kcal (${show(total / kg)} kcal/kg/day); ${band}`;
  return { ...out, abnormal, band: `${band}${abnormal ? '; dextrose rate above the label figure' : ''}.`, bandLabel: `${show(total / kg)} kcal/kg/day`, notes, note: NOTE };
}
