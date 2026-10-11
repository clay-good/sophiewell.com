// spec-v1631 tool 8: fosphenytoin and IV phenytoin loading (dose, rate and when to draw a level).
//
// Label rows (spec-v1628 section 1), re-read on DailyMed on October 11, 2026.
// Cerebyx (fosphenytoin, Pfizer, version 38), in phenytoin sodium equivalents (PE): "1.5 mg of
//   fosphenytoin sodium is equivalent to 1 mg phenytoin sodium", vial 50 mg PE/mL.
//   Table 1, status epilepticus: adult 15 to 20 mg PE/kg at 100 to 150 mg PE/min, "do not exceed a
//     maximum rate of 150 mg PE/min"; pediatric (birth to under 17 years) 15 to 20 mg PE/kg at
//     "2 mg PE/kg/min, or 150 mg PE/min, whichever is slower".
//   Table 2, non-emergent: adult 10 to 20 mg PE/kg, not above 150 mg PE/min; pediatric 10 to 15 mg
//     PE/kg at "1 mg PE/kg/min to 2 mg PE/kg/min, or 150 mg PE/min, whichever is slower".
//   Table 3, initial maintenance: adult 4 to 6 mg PE/kg/day in divided doses; pediatric 2 to 4 mg
//     PE/kg 12 hours after the load, at 1 to 2 mg PE/kg/min or 100 mg PE/min, whichever is slower.
//   Dilute "to a concentration ranging from 1.5 to 25 mg PE/mL". Phenytoin concentrations should not
//     be monitored until conversion is essentially complete, "approximately 2 hours after the end of
//     IV infusion and 4 hours after intramuscular (IM) injection". "IM CEREBYX should ordinarily not
//     be used in the treatment of status epilepticus" or in pediatric patients.
// Phenytoin Sodium Injection (Hikma, version 27), 50 mg/mL: "In adults, a loading dose of 10 to 15
//   mg/kg ... at a rate not exceeding 50 mg per minute (this will require approximately 20 minutes
//   in a 70-kg patient)", then "100 mg orally or intravenously every 6 to 8 hours"; pediatric
//   "15 to 20 mg/kg at a rate not exceeding 1 to 3 mg/kg/min or 50 mg/min, whichever is slower";
//   for an infusion, diluted in normal saline to "no less than 5 mg/mL" and "completed within 1 to
//   4 hours".
//
// The pediatric ceilings applied are the upper figures (2 mg PE/kg/min; 3 mg/kg/min), capped as the
// labels cap them. Oral phenytoin loading is not here. A label's figures answer only while it stands
// (lib/label-row.js). The tool reports what the label gives for a chosen mg/kg; it does not choose it.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

const FOS = { name: 'fosphenytoin (Cerebyx)', unit: 'mg PE', setId: 'd4c36fad-0ba2-4cd4-9c5e-dcf843f38a5a', perMl: 50, cap: 150, perKgRate: 2,
  range: { status: { adult: [15, 20], pediatric: [15, 20] }, 'non-emergent': { adult: [10, 20], pediatric: [10, 15] } } };
const PHT = { name: 'phenytoin sodium injection', unit: 'mg', setId: '035a8d4e-2063-4240-83cb-d7eebcabe301', perMl: 50, cap: 50, perKgRate: 3,
  range: { status: { adult: [10, 15], pediatric: [15, 20] }, 'non-emergent': { adult: [10, 15], pediatric: [15, 20] } } };
export const DRUGS = { fosphenytoin: FOS, phenytoin: PHT };
export const DRUG_OPTIONS = [
  { value: 'fosphenytoin', text: 'Fosphenytoin (Cerebyx), mg PE' },
  { value: 'phenytoin', text: 'Phenytoin sodium injection, mg' },
];
export const POPULATIONS = [
  { value: 'adult', text: 'Adult' },
  { value: 'pediatric', text: 'Pediatric (birth to under 17 years)' },
];
export const INDICATIONS = [
  { value: 'status', text: 'Status epilepticus' },
  { value: 'non-emergent', text: 'Non-emergent loading' },
];
export const ROUTES = [
  { value: 'iv', text: 'Intravenous' },
  { value: 'im', text: 'Intramuscular (fosphenytoin only)' },
];
export const WEIGHT_UNITS = [
  { value: 'kg', text: 'kg' },
  { value: 'lb', text: 'lb' },
  { value: 'g', text: 'g' },
];
const TO_KG = { kg: 1, lb: 0.45359237, g: 0.001 };
const NOTE = 'The tool works out what the label gives for the mg/kg you chose; it does not choose the dose. Both labels require cardiac monitoring during the infusion, and both carry a boxed warning about rapid infusion.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
const has = (list, v) => list.some((x) => x.value === v);

export function fosphenytoinLoadRate(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.drug ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(DRUGS, key)) return { valid: false, message: 'Choose the drug: fosphenytoin (dosed in mg PE) or phenytoin sodium injection (dosed in mg).' };
  const d = DRUGS[key];
  const pop = String(o.population ?? '').trim();
  if (!has(POPULATIONS, pop)) return { valid: false, message: 'Choose adult or pediatric: the labels give a different range and rate for each.' };
  const ind = String(o.indication ?? '').trim();
  if (!has(INDICATIONS, ind)) return { valid: false, message: 'Choose status epilepticus or non-emergent loading.' };
  const route = String(o.route ?? '').trim();
  if (!has(ROUTES, route)) return { valid: false, message: 'Choose the route: intravenous or intramuscular.' };
  if (route === 'im' && key === 'phenytoin') return { valid: false, message: 'This tool works out phenytoin sodium injection as an intravenous load only; the intramuscular choice here is for fosphenytoin.' };
  const wu = String(o.weightUnit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(TO_KG, wu)) return { valid: false, message: 'Choose the weight unit: kg, lb or g.' };
  const f = inputFault([['the weight', o.weight, null, wu === 'g' ? 500000 : wu === 'lb' ? 1100 : 500, wu], ['the dose chosen', o.mgPerKg, null, 100, `${d.unit}/kg`]]);
  if (f) return { valid: false, message: f };
  const kg = Number(o.weight) * TO_KG[wu];
  if (kg < 0.2) return { valid: false, message: 'That weight is below the 0.2 kg this tool accepts. Check the weight and its unit.' };
  const perKg = Number(o.mgPerKg); const dose = perKg * kg; const mL = dose / d.perMl;
  const u = d.unit;
  const notes = [`${show(perKg)} ${u}/kg × ${show(kg)} kg = ${show(dose)} ${u}, which is ${show(mL)} mL of the ${d.perMl} ${u}/mL product.`];
  const out = { valid: true, dose: sig(dose), productMl: sig(mL), weightKg: sig(kg) };
  const head = `${show(dose)} ${u} of ${d.name} (${show(mL)} mL)`;
  const row = labelRow(d.setId, now, table);
  if (!row.answers) {
    notes.push(`The ${d.name} label figures are withheld: ${row.why}. The strength used above is the product's ${d.perMl} ${u}/mL; check it against the vial in hand.`);
    return { ...out, withheld: true, labelUrl: row.url, band: `${head}. The label's range and rate are withheld.`, bandLabel: `${show(dose)} ${u}`, notes, note: NOTE };
  }
  const flags = [];
  const range = d.range[ind][pop];
  const where = sig(perKg) > range[1] ? 'above' : sig(perKg) < range[0] ? 'below' : 'within';
  out.doseAgainst = where; out.labelRange = range;
  if (where === 'above') flags.push('dose above the label range');
  notes.push(`Dose: ${show(perKg)} ${u}/kg is ${where} the label's ${range[0]} to ${range[1]} ${u}/kg for ${pop === 'adult' ? 'adults' : 'pediatric patients'}${key === 'phenytoin' ? ' (it gives one loading range for status epilepticus and non-emergent loading)' : `, ${ind === 'status' ? 'status epilepticus' : 'non-emergent loading'}`}. That range is ${show(range[0] * kg)} to ${show(range[1] * kg)} ${u} at this weight.`);
  if (route === 'im') {
    out.levelAfterHours = 4;
    notes.push('Intramuscular: no infusion rate applies. The label says phenytoin concentrations should not be monitored until about 4 hours after an IM injection.');
    if (ind === 'status' || pop === 'pediatric') { flags.push('IM is a route the label says should ordinarily not be used here'); notes.push('The label says IM Cerebyx should ordinarily not be used in the treatment of status epilepticus, and should ordinarily not be used in pediatric patients.'); }
  } else {
    const max = pop === 'adult' ? d.cap : Math.min(d.perKgRate * kg, d.cap);
    const minutes = dose / max;
    Object.assign(out, { maxRate: sig(max), shortestMinutes: sig(minutes) });
    notes.push(`Rate: not above ${show(max)} ${u}/minute${pop === 'adult' ? '' : ` (${d.perKgRate} ${u}/kg/minute or ${d.cap} ${u}/minute, whichever is slower)`}, so this dose takes at least ${show(minutes)} minutes.${key === 'fosphenytoin' && pop === 'adult' && ind === 'status' ? ' For status epilepticus in adults the label gives 100 to 150 mg PE/minute.' : ''}`);
    if (!blank(o.bagVolume)) {
      const bf = inputFault([['the bag volume', o.bagVolume, null, 20000, 'mL']]);
      if (bf) return { valid: false, message: bf };
      const conc = dose / Number(o.bagVolume);
      if (key === 'fosphenytoin') {
        const w = sig(conc) > 25 ? 'above' : sig(conc) < 1.5 ? 'below' : 'within';
        out.concentrationAgainst = w;
        if (w === 'above') flags.push('concentration above the label range');
        notes.push(`In ${show(Number(o.bagVolume))} mL: ${show(conc)} mg PE/mL, ${w} the label's 1.5 to 25 mg PE/mL (${show(dose / 25)} to ${show(dose / 1.5)} mL for this dose).`);
      } else {
        const thin = sig(conc) < 5;
        out.concentrationAgainst = thin ? 'below' : 'at or above';
        if (thin) flags.push('more dilute than the label allows');
        notes.push(`In ${show(Number(o.bagVolume))} mL of normal saline: ${show(conc)} mg/mL, ${thin ? 'below' : 'at or above'} the 5 mg/mL the label gives as the least (no more than ${show(dose / 5)} mL for this dose). The infusion must be completed within 1 to 4 hours.`);
      }
    } else notes.push(key === 'fosphenytoin' ? `No bag volume was entered: at the label's 1.5 to 25 mg PE/mL this dose takes ${show(dose / 25)} to ${show(dose / 1.5)} mL.` : `No bag volume was entered: for an infusion the label gives no less than 5 mg/mL, which is no more than ${show(dose / 5)} mL for this dose.`);
    if (key === 'fosphenytoin') { out.levelAfterHours = 2; notes.push('Level: the label says phenytoin concentrations should not be monitored until about 2 hours after the end of the IV infusion, when conversion is essentially complete.'); }
  }
  notes.push(key === 'fosphenytoin'
    ? (pop === 'adult' ? 'Initial maintenance on the label: 4 to 6 mg PE/kg/day in divided doses.' : 'Initial maintenance on the label: 2 to 4 mg PE/kg, 12 hours after the load, at 1 to 2 mg PE/kg/minute or 100 mg PE/minute, whichever is slower; then 4 to 8 mg PE/kg/day in divided doses.')
    : (pop === 'adult' ? 'After the load the label gives 100 mg orally or intravenously every 6 to 8 hours.' : 'The label follows the pediatric load with maintenance doses every 6 to 8 hours; read it for the amounts.'));
  notes.push(`Label: ${row.edition}.`);
  return {
    ...out, flags, abnormal: flags.length > 0,
    band: `${head}${out.shortestMinutes !== undefined ? ` over at least ${show(out.shortestMinutes)} minutes` : ' by IM injection'}: the dose is ${where} the label range${flags.filter((x) => !x.startsWith('dose')).length ? `; ${flags.filter((x) => !x.startsWith('dose')).join('; ')}` : ''}.`,
    bandLabel: out.shortestMinutes !== undefined ? `${show(dose)} ${u}, at least ${show(out.shortestMinutes)} min` : `${show(dose)} ${u} IM`,
    notes, note: NOTE,
  };
}
