// spec-v1633 tool 5: extended-release opioid starting dose, each by its own label's procedure.
//
// Three label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Hysingla ER (hydrocodone; DailyMed version 17), section 2.3, Table 1, "Conversion factors to
//     HYSINGLA ER (Not Equianalgesic Doses)": codeine 0.15, hydromorphone 4, methadone 1.5, morphine
//     0.5, oxycodone 1, oxymorphone 2, tramadol 0.1; "reduce the calculated daily hydrocodone dose by
//     25%"; "Always round the dose down ... to the nearest HYSINGLA ER tablet strength available";
//     "If the converted HYSINGLA ER dose using Table 1 is less than 20 mg, initiate therapy with
//     HYSINGLA ER 20 mg." Tablets: 20, 30, 40, 60, 80, 100 mg. The label's example: oxycodone 50 mg
//     x 1 x 0.75 = 37.5 mg, rounded down to 30 mg.
//   Butrans (buprenorphine transdermal; version 32), section 2.3, by prior oral morphine equivalents
//     per day: "Less than 30 mg", 5 mcg/hour; "Between 30 mg to 80 mg", taper "for up to 7 days to no
//     more than 30 mg ... Then initiate treatment with BUTRANS 10 mcg/hour"; "Greater than 80 mg",
//     "BUTRANS 20 mcg/hour may not provide adequate analgesia ... Consider the use of an alternate
//     analgesic." "The maximum BUTRANS dose is 20 mcg/hour"; "minimum BUTRANS titration interval is
//     72 hours".
//   Belbuca (buprenorphine buccal film; version 18), section 2.3, Table 1, by daily dose "Before
//     Taper to 30 mg Oral MSE": less than 30 mg, 75 mcg once daily or every 12 hours; 30 to 89 mg,
//     150 mcg every 12 hours; 90 to 160 mg, 300 mcg every 12 hours; greater than 160 mg, "Consider
//     alternate analgesic". Steps of 150 mcg every 12 hours "no more frequently than every 4 days";
//     "The maximum BELBUCA dose is 900 mcg every 12 hours."
//
// One way only: each label says its table is not equianalgesic, and there is no reverse mode.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const PRODUCTS = [
  { value: 'hysingla', text: 'Hysingla ER (hydrocodone extended-release tablets)', brand: 'Hysingla ER', setId: 'b7d23ac2-e776-9f62-3290-c64c2d6eb353' },
  { value: 'butrans', text: 'Butrans (buprenorphine transdermal system)', brand: 'Butrans', setId: '794aa355-66de-41b8-aedf-f2c40f6bc664' },
  { value: 'belbuca', text: 'Belbuca (buprenorphine buccal film)', brand: 'Belbuca', setId: 'bc2b7a3d-72cf-497c-95b0-ba2b71f63c64' },
];
// Hysingla ER Table 1: prior oral opioid -> hydrocodone, by this factor.
export const HYSINGLA_FACTORS = [
  { arg: 'codeineMg', name: 'codeine', factor: 0.15 },
  { arg: 'hydromorphoneMg', name: 'hydromorphone', factor: 4 },
  { arg: 'methadoneMg', name: 'methadone', factor: 1.5 },
  { arg: 'morphineMg', name: 'morphine', factor: 0.5 },
  { arg: 'oxycodoneMg', name: 'oxycodone', factor: 1 },
  { arg: 'oxymorphoneMg', name: 'oxymorphone', factor: 2 },
  { arg: 'tramadolMg', name: 'tramadol', factor: 0.1 },
];
export const HYSINGLA_TABLETS = [20, 30, 40, 60, 80, 100];
const NOTE = 'This reports what the label gives for these inputs. It does not prescribe. Each label says its table is not a table of equianalgesic doses and cannot be used to convert from the product to another opioid; this tool has no reverse mode.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const num = (x) => Number(x.toFixed(2)).toLocaleString('en-US');

function hysingla(o, base) {
  const given = HYSINGLA_FACTORS.filter((f) => !blank(o[f.arg]));
  if (!given.length) return { valid: false, message: 'Enter the total daily dose of at least one prior oral opioid (codeine, hydromorphone, methadone, morphine, oxycodone, oxymorphone or tramadol).' };
  const f = inputFault(given.map((g) => [`the daily ${g.name} dose`, o[g.arg], 0, 5000, 'mg']));
  if (f) return { valid: false, message: f };
  const used = given.filter((g) => Number(o[g.arg]) > 0);
  if (!used.length) return { valid: false, message: 'Every prior opioid dose entered is 0. Enter the total daily dose of the opioid the patient takes.' };
  const terms = used.map((g) => ({ ...g, mg: Number(o[g.arg]), hydrocodone: Number(o[g.arg]) * g.factor }));
  const sum = terms.reduce((a, t) => a + t.hydrocodone, 0);
  const reduced = sum * 0.75;
  const work = `${terms.map((t) => `${t.name} ${num(t.mg)} mg × ${t.factor}`).join(' + ')} = ${num(sum)} mg of hydrocodone a day; less 25% is ${num(reduced)} mg.`;
  const notes = [work, 'The label\'s example: oxycodone 50 mg × 1 × 0.75 = 37.5 mg, rounded down to 30 mg.'];
  if (used.some((g) => g.arg === 'methadoneMg')) notes.push('The label asks for particular care converting from methadone: its ratio to other opioids varies widely with prior dose, and it accumulates.');
  const out = { ...base, calculatedHydrocodoneMg: Number(sum.toFixed(2)), reducedMg: Number(reduced.toFixed(2)) };
  if (reduced < 20) {
    return { ...out, flag: 'dose', abnormal: false, startMg: 20, band: `The calculation gives ${num(reduced)} mg, which is less than 20 mg: the Hysingla ER label says to initiate at 20 mg once daily.`, bandLabel: '20 mg once daily', notes };
  }
  const top = HYSINGLA_TABLETS[HYSINGLA_TABLETS.length - 1];
  if (reduced > top) {
    return { ...out, flag: 'no-recommendation-given', abnormal: true, band: `The calculation gives ${num(reduced)} mg, above the largest Hysingla ER tablet (${top} mg). The label's rule rounds down to one tablet strength, so no starting dose is reported for this value.`, bandLabel: 'Above the largest tablet', notes: [...notes, 'The label reserves daily doses of 80 mg or more for opioid-tolerant patients.'] };
  }
  const start = [...HYSINGLA_TABLETS].reverse().find((t) => t <= reduced);
  if (start >= 80) notes.push('The label reserves daily doses of 80 mg or more for opioid-tolerant patients.');
  return { ...out, flag: 'dose', abnormal: false, startMg: start, band: `The Hysingla ER label's procedure gives ${num(reduced)} mg, rounded down to the ${start} mg tablet once daily.`, bandLabel: `${start} mg once daily`, notes };
}

function byMorphineEquivalent(o, base, product) {
  const f = inputFault([['the prior total daily dose in oral morphine equivalents', o.morphineEquivalentMg, 0, 20000, 'mg']]);
  if (f) return { valid: false, message: `${f} The ${product.brand} label sets the starting dose by it.` };
  const med = Number(o.morphineEquivalentMg); const out = { ...base, morphineEquivalentMg: med };
  if (product.value === 'butrans') {
    const tail = ['The maximum Butrans dose is 20 mcg/hour, and the minimum titration interval is 72 hours.', 'The label warns that buprenorphine can precipitate withdrawal in patients already on opioids.'];
    if (med < 30) return { ...out, flag: 'dose', abnormal: false, startMcgHr: 5, band: 'The Butrans label, for a prior dose below 30 mg of oral morphine equivalents a day: initiate with 5 mcg/hour at the next dosing interval.', bandLabel: '5 mcg/hour', notes: tail };
    if (med <= 80) return { ...out, flag: 'taper-first', abnormal: false, startMcgHr: 10, band: 'The Butrans label, for a prior dose between 30 and 80 mg of oral morphine equivalents a day: taper the current around-the-clock opioids for up to 7 days to no more than 30 mg a day, then initiate with 10 mcg/hour at the next dosing interval.', bandLabel: 'Taper, then 10 mcg/hour', notes: ['Short-acting analgesics may be used as needed until analgesic efficacy is attained.', ...tail] };
    return { ...out, flag: 'alternate-analgesic', abnormal: true, band: 'The Butrans label, for a prior dose above 80 mg of oral morphine equivalents a day: Butrans 20 mcg/hour may not provide adequate analgesia; consider the use of an alternate analgesic. It gives no starting dose.', bandLabel: 'Consider an alternate analgesic', notes: tail };
  }
  const tail = ['The label says to taper to no more than 30 mg of oral morphine sulfate equivalents a day before beginning Belbuca; the starting dose is based on the daily dose before that taper.', 'Titration is in steps of 150 mcg every 12 hours, no more often than every 4 days, to a maximum of 900 mcg every 12 hours. The 600, 750 and 900 mcg doses are only for use after titration from lower doses.'];
  if (med > 160) return { ...out, flag: 'alternate-analgesic', abnormal: true, band: 'The Belbuca label, for a prior dose above 160 mg of oral morphine sulfate equivalents a day: consider an alternate analgesic. It gives no starting dose.', bandLabel: 'Consider an alternate analgesic', notes: tail };
  // The table prints "30 mg to 89 mg" and "90 mg to 160 mg": a value between 89 and 90 is in neither.
  if (med > 89 && med < 90) return { ...out, flag: 'between-bands', abnormal: true, rows: [150, 300], band: `${med} mg falls between two rows as the Belbuca label prints them: 30 to 89 mg (150 mcg every 12 hours) and 90 to 160 mg (300 mcg every 12 hours). The label does not cover this value; both rows are shown.`, bandLabel: '150 or 300 mcg every 12 hours', notes: tail };
  if (med < 30) return { ...out, flag: 'dose', abnormal: false, startMcg: 75, band: 'The Belbuca label, for a prior dose below 30 mg of oral morphine sulfate equivalents a day: 75 mcg once daily or every 12 hours.', bandLabel: '75 mcg once daily or every 12 hours', notes: tail };
  const start = med <= 89 ? 150 : 300;
  return { ...out, flag: 'taper-first', abnormal: false, startMcg: start, band: `The Belbuca label, for a prior dose of ${med <= 89 ? '30 to 89' : '90 to 160'} mg of oral morphine sulfate equivalents a day: after the taper, ${start} mcg every 12 hours.`, bandLabel: `Taper, then ${start} mcg every 12 hours`, notes: tail };
}

export function erOpioidLabelStart(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const product = PRODUCTS.find((p) => p.value === String(o.product ?? '').trim());
  if (!product) return { valid: false, message: 'Choose the product. Each label has its own procedure.' };
  const lr = labelRow(product.setId, now, table);
  const base = { valid: true, product: product.value, labelUrl: lr.url, note: NOTE };
  const r = product.value === 'hysingla' ? hysingla(o, base) : byMorphineEquivalent(o, base, product);
  if (!r.valid) return r;
  if (!lr.answers) return { valid: true, withheld: true, product: product.value, labelUrl: lr.url, band: `The ${product.brand} label's procedure is withheld, so no starting dose is reported.`, bandLabel: 'Withheld', notes: [`The ${product.brand} label rows are withheld: ${lr.why}.`, 'Read the starting dose from the label in hand.'], note: NOTE };
  return { ...r, notes: [...r.notes, `Label: ${lr.edition}.`] };
}
