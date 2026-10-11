// spec-v1630 tool 10: trace element and pediatric multivitamin volume by weight.
//
// Label rows (spec-v1628 section 1), re-read on DailyMed on October 11, 2026:
//   Tralement (American Regent, version 10), per mL: zinc 3 mg, copper 0.3 mg, manganese 55 mcg,
//     selenium 60 mcg. At least 50 kg: 1 mL per day. Table 1: 10 kg to 19 kg 0.2 mL; 20 kg to 29 kg
//     0.4 mL; 30 kg to 39 kg 0.6 mL; 40 kg to 49 kg 0.8 mL. "Not approved for use in pediatric
//     patients weighing less than 10 kg". Daily dosage to compare: zinc 50 mcg/kg/day (up to 3,000),
//     copper 20 (up to 300), selenium 2 (up to 60); "Do not supplement Tralement with additional
//     manganese" (recommended 1 mcg/kg/day, up to 55).
//   Multrys (American Regent, version 4), per mL: zinc 1,000 mcg, copper 60 mcg, manganese 3 mcg,
//     selenium 6 mcg. 0.4 kg to 0.59 kg: 0.2 mL every other day. 0.6 kg to less than 10 kg: "0.3
//     mL/kg/day rounded to nearest 0.1 mL for up to a maximum of 1 mL per day", and Table 1: 0.6 to
//     0.8 kg 0.2 mL; 0.9 to 1.1 kg 0.3; 1.2 to 1.4 kg 0.4; 1.5 to 1.7 kg 0.5; 1.8 to 2 kg 0.6; 2.1 to
//     2.3 kg 0.7; 2.4 to 2.6 kg 0.8; 2.7 to 2.9 kg 0.9; 3 kg to 9.9 kg 1 mL. Table 2, daily
//     requirement: zinc 400 mcg/kg/day under 3 kg, 250 at 3 to 5 kg, 100 at 5 to 10 kg; copper 20;
//     selenium 2; manganese 1.
//   Infuvite Pediatric (Sandoz, version 7): under 1 kg, 1.2 mL of Vial 1 and 0.3 mL of Vial 2 (1.5 mL
//     of the combined bulk package); 1 kg to less than 3 kg, 2.6 mL and 0.65 mL (3.25 mL); 3 kg or
//     greater, 4 mL and 1 mL (5 mL).
//
// Where a label's table and its own sentence disagree, the tool gives the table's volume and names
// the difference: for Multrys at 2.7 kg the sentence gives 0.8 mL and the table 0.9 mL. The tables
// print their bands in whole steps (10 to 19 kg, then 20 to 29 kg); a weight between two printed
// bands is placed in the lower one, and the result says so.
//
// A product's figures answer only while its label stands (lib/label-row.js). The tool reports what
// the label gives for a weight; it does not say what to order.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const PRODUCTS = {
  tralement: {
    name: 'Tralement', setId: 'a49ffb90-f307-433e-a86e-aaea6d6a9982',
    perMl: { zinc: 3000, copper: 300, manganese: 55, selenium: 60 },
    bands: [[10, 19, 0.2], [20, 29, 0.4], [30, 39, 0.6], [40, 49, 0.8]],
  },
  multrys: {
    name: 'Multrys', setId: '995f1efa-aca0-4b6c-9099-f8e757c2133a',
    perMl: { zinc: 1000, copper: 60, manganese: 3, selenium: 6 },
    bands: [[0.6, 0.8, 0.2], [0.9, 1.1, 0.3], [1.2, 1.4, 0.4], [1.5, 1.7, 0.5], [1.8, 2, 0.6], [2.1, 2.3, 0.7], [2.4, 2.6, 0.8], [2.7, 2.9, 0.9], [3, 9.9, 1]],
  },
  'infuvite-pediatric': { name: 'Infuvite Pediatric', setId: '4ff223f7-e076-4e81-8151-5c06724fabd9' },
};
export const PRODUCT_OPTIONS = Object.entries(PRODUCTS).map(([value, p]) => ({ value, text: p.name }));
export const WEIGHT_UNITS = [
  { value: 'kg', text: 'kg' },
  { value: 'g', text: 'g' },
  { value: 'lb', text: 'lb' },
];
const TO_KG = { kg: 1, lb: 0.45359237, g: 0.001 };
const ELEMENTS = ['zinc', 'copper', 'selenium', 'manganese'];
const NOTE = 'The tool reports what the label gives for a weight; it does not say what to order. These fixed combinations are for patients who need all four trace elements; the labels tie extra single-element doses to monitoring.';

const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });

// The band whose lower edge is the last one at or under the weight; `gap` when the weight sits
// between two printed bands.
function bandFor(bands, kg) {
  let hit = null;
  for (const b of bands) if (kg >= b[0]) hit = b;
  return hit ? { band: hit, gap: kg > hit[1] } : null;
}

function requirement(key, kg) {
  if (key === 'tralement') return { zinc: Math.min(50 * kg, 3000), copper: Math.min(20 * kg, 300), selenium: Math.min(2 * kg, 60), manganese: Math.min(kg, 55) };
  const zincPerKg = kg < 3 ? 400 : kg <= 5 ? 250 : 100;
  return { zinc: zincPerKg * kg, copper: 20 * kg, selenium: 2 * kg, manganese: kg, zincPerKg };
}

export function pnMicronutrientVolume(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const key = String(o.product ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(PRODUCTS, key)) return { valid: false, message: 'Choose the product: Tralement, Multrys or Infuvite Pediatric.' };
  const p = PRODUCTS[key];
  const wu = String(o.weightUnit ?? '').trim();
  if (!Object.prototype.hasOwnProperty.call(TO_KG, wu)) return { valid: false, message: 'Choose the weight unit: kg, g or lb.' };
  const wf = inputFault([['the weight', o.weight, null, wu === 'g' ? 500000 : wu === 'lb' ? 1100 : 500, wu]]);
  if (wf) return { valid: false, message: wf };
  const kg = Number(o.weight) * TO_KG[wu];
  if (kg < 0.2) return { valid: false, message: `A weight of ${show(Number(o.weight))} ${wu} is below the 0.2 kg this tool accepts. Check the weight and its unit.` };
  const row = labelRow(p.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, weightKg: sig(kg), band: `The ${p.name} label figures are withheld, so no volume is shown.`, bandLabel: 'Withheld', notes: [`The ${p.name} label figures are withheld: ${row.why}.`, 'Read the volume for this weight from the label in hand.'], note: NOTE };
  }
  const from = `(${row.edition})`;
  const weightLine = wu === 'kg' ? null : `Weight: ${show(Number(o.weight))} ${wu} = ${show(kg)} kg.`;

  if (key === 'infuvite-pediatric') {
    const [v1, v2, both, which] = kg < 1 ? [1.2, 0.3, 1.5, 'under 1 kg'] : kg < 3 ? [2.6, 0.65, 3.25, '1 kg to under 3 kg'] : [4, 1, 5, '3 kg or more'];
    const notes = [`At ${show(kg)} kg (${which}) the label gives ${v1} mL of Vial 1 and ${v2} mL of Vial 2 as the daily dose, or ${both} mL of the combined contents of the pharmacy bulk package ${from}.`, 'The label is for pediatric patients up to 11 years, and notes that low-birth-weight infants may need supplemental vitamin A.'];
    if (weightLine) notes.unshift(weightLine);
    return { valid: true, weightKg: sig(kg), vial1Ml: v1, vial2Ml: v2, combinedMl: both, band: `${p.name} at ${show(kg)} kg: ${v1} mL of Vial 1 and ${v2} mL of Vial 2 daily (${both} mL combined from the bulk package).`, bandLabel: `${v1} mL + ${v2} mL`, notes, note: NOTE };
  }

  let volume; let everyOtherDay = false; const notes = [];
  if (key === 'tralement') {
    if (kg < 10) return { valid: false, message: 'The Tralement label says it is not approved for pediatric patients weighing less than 10 kg: it gives too little zinc, copper and selenium for them and too much manganese. Multrys is the product labeled for under 10 kg.' };
    if (kg >= 50) { volume = 1; notes.push(`At ${show(kg)} kg (at least 50 kg) the label gives 1 mL per day ${from}.`); }
    else {
      const { band, gap } = bandFor(p.bands, kg); volume = band[2];
      notes.push(`At ${show(kg)} kg the label's table gives ${volume} mL per day (${band[0]} kg to ${band[1]} kg) ${from}.`);
      if (gap) notes.push(`The table prints its bands in whole kilograms; ${show(kg)} kg falls between two of them and is placed in the lower one.`);
    }
  } else {
    if (kg < 0.4) return { valid: false, message: 'The Multrys label gives no dosage under 0.4 kg.' };
    if (kg >= 10) return { valid: false, message: 'The Multrys label gives dosages for patients under 10 kg. Tralement is the product labeled for 10 kg and over.' };
    if (kg < 0.6) { volume = 0.2; everyOtherDay = true; notes.push(`At ${show(kg)} kg (0.4 kg to 0.59 kg) the label gives 0.2 mL every other day ${from}.`); }
    else {
      const { band, gap } = bandFor(p.bands, kg); volume = band[2];
      notes.push(`At ${show(kg)} kg the label's Table 1 gives ${volume} mL per day (${band[0]} kg to ${band[1]} kg) ${from}.`);
      if (gap) notes.push(`The table prints its bands to one decimal place; ${show(kg)} kg falls between two of them and is placed in the lower one.`);
      const bySentence = Math.min(1, Math.round(0.3 * kg * 10 + 1e-9) / 10);
      if (bySentence !== volume) notes.push(`The label's sentence ("0.3 mL/kg/day rounded to nearest 0.1 mL", up to 1 mL) gives ${bySentence} mL at this weight, not the table's ${volume} mL. The two disagree on the label; the table's volume is shown.`);
    }
  }
  if (weightLine) notes.unshift(weightLine);
  const perDay = everyOtherDay ? volume / 2 : volume;
  const need = requirement(key, kg);
  const delivered = {}; const gaps = {};
  for (const e of ELEMENTS) { delivered[e] = sig(p.perMl[e] * perDay); gaps[e] = sig(need[e] - p.perMl[e] * perDay); }
  notes.push(`${volume} mL${everyOtherDay ? ' every other day (an average of 0.1 mL per day)' : ''} provides${everyOtherDay ? ', per day on average,' : ''} zinc ${show(delivered.zinc)} mcg, copper ${show(delivered.copper)} mcg, selenium ${show(delivered.selenium)} mcg and manganese ${show(delivered.manganese)} mcg.`);
  const line = (e, basis) => `${e} ${show(need[e])} mcg/day (${basis}): ${gaps[e] > 0 ? `${show(gaps[e])} mcg short` : 'met'}`;
  notes.push(key === 'tralement'
    ? `Against the label's daily dosage at ${show(kg)} kg: ${line('zinc', '50 mcg/kg, up to 3,000')}; ${line('copper', '20 mcg/kg, up to 300')}; ${line('selenium', '2 mcg/kg, up to 60')}.`
    : `Against the label's daily requirement at ${show(kg)} kg: ${line('zinc', `${need.zincPerKg} mcg/kg`)}; ${line('copper', '20 mcg/kg')}; ${line('selenium', '2 mcg/kg')}.`);
  const mn = delivered.manganese > sig(need.manganese);
  notes.push(key === 'tralement'
    ? `Manganese: ${show(delivered.manganese)} mcg against the recommended ${show(need.manganese)} mcg/day (1 mcg/kg, up to 55)${mn ? ', which it exceeds' : ''}. The label says not to supplement Tralement with additional manganese.`
    : `Manganese: ${show(delivered.manganese)} mcg against the label's requirement of ${show(need.manganese)} mcg/day (1 mcg/kg)${mn ? ', which it exceeds' : ''}.`);
  if (key === 'multrys' && kg === 5) notes.push('At exactly 5 kg the label\'s zinc rows overlap (3 kg to 5 kg, and 5 to 10 kg); the 3 kg to 5 kg row, 250 mcg/kg/day, is used here.');
  const short = ['zinc', 'copper', 'selenium'].filter((e) => gaps[e] > 0);
  return {
    valid: true, weightKg: sig(kg), volumeMl: volume, everyOtherDay, delivered, requirement: { zinc: sig(need.zinc), copper: sig(need.copper), selenium: sig(need.selenium), manganese: sig(need.manganese) }, shortfall: Object.fromEntries(short.map((e) => [e, gaps[e]])),
    band: `${p.name} at ${show(kg)} kg: ${volume} mL ${everyOtherDay ? 'every other day' : 'per day'}${short.length ? `; short of the label's daily amount for ${short.join(', ')}` : '; meets the label\'s daily zinc, copper and selenium'}.`,
    bandLabel: `${volume} mL ${everyOtherDay ? 'every other day' : 'per day'}`,
    notes, note: NOTE,
  };
}
