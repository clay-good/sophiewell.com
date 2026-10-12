// spec-v1636 tool 13: botulism antitoxin (BAT) and BabyBIG dose and rate, from the labels.
//
// Sources, DailyMed labels re-read October 12, 2026:
//   BAT [Botulism Antitoxin Heptavalent (Equine)], Emergent (set 9f3c4292-..., version 11), section
//   2.1, Tables 1 and 2. Adults (17 years and over): one vial; start 0.5 mL/min for the first 30
//   minutes, double the rate every 30 minutes if tolerated, maximum 2 mL/min. Pediatric (1 year to
//   under 17): 20 to 100% of the adult dose; start 0.01 mL/kg/min, increase by 0.01 mL/kg/min every
//   30 minutes, maximum 0.03 mL/kg/min, "Do not exceed the adult rate". Infants (under 1 year): "10%
//   of adult dose regardless of body weight", the same per-kilogram rates. "Calculate pediatric BAT
//   dose by body weight according to Table 2": 10-14 kg 20%; 15-19 kg 30%; 20-24 kg 40%; 25-29 kg
//   50%; 30-34 kg 60%; 35-39 kg 65%; 40-44 kg 70%; 45-49 kg 75%; 50-54 kg 80%; 55 kg or more 100%.
//   The table's footnote: "based on the Salisbury Rule: Body weight <= 30 kg: 2x weight (kg) = %
//   adult dose ... Body weight > 30 kg: weight (kg) + 30 ... Do not exceed 1 vial ... Minimum
//   pediatric dose is 20% of adult dose." All doses are diluted 1:10 in normal saline.
//   BabyBIG, California Department of Public Health (set 9ec59262-..., version 14), 2.2 and 2.3:
//   "1.0 mL/kg (50 mg/kg), given as a single intravenous infusion"; "Begin infusion slowly
//   (0.5 mL/kg/h); if no untoward reaction in 15 minutes, increase rate to 1.0 mL/kg/h."
//
// The BAT table and the rule in its own footnote disagree inside most bands (12 kg: table 20%, rule
// 24%) and from 55 to 69 kg (table 100%, rule 85 to 99%). The label says to dose "according to
// Table 2", so the table is used and the rule's figure is shown beside it. A weight between two
// whole-kilogram rows returns both; a child of 1 year or more under 10 kg has no row.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = {
  bat: { name: 'BAT', setId: '9f3c4292-8773-4781-8264-d71c80d3eabd' },
  babybig: { name: 'BabyBIG', setId: '9ec59262-35c1-4d8e-8451-a7cfbacb0675' },
};
export const PRODUCTS = [
  { value: 'bat', text: 'BAT (botulism antitoxin heptavalent, equine)' },
  { value: 'babybig', text: 'BabyBIG (botulism immune globulin, infant botulism type A or B)' },
];
const TABLE = [[10, 14, 20], [15, 19, 30], [20, 24, 40], [25, 29, 50], [30, 34, 60], [35, 39, 65], [40, 44, 70], [45, 49, 75], [50, 54, 80], [55, Infinity, 100]];
const NOTE = 'The labeled dose and infusion rates for the entries made. Antitoxin is released through public health authorities, and the decision to treat is theirs and the treating team\'s; this is the arithmetic only.';
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');
const n3 = (x) => (Math.round(x * 1000) / 1000).toLocaleString('en-US');
const rowName = ([lo, hi, pct]) => `${hi === Infinity ? `${lo} kg or more` : `${lo} to ${hi} kg`}: ${pct}%`;

export function botulismAntitoxinDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PRODUCTS.find((x) => x.value === String(o.product ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the product: BAT, or BabyBIG for infant botulism.' };
  const af = inputFault([['the age', o.age, 0, 120, 'years']]);
  if (af) return { valid: false, message: `${af} For an infant enter a fraction of a year (6 months is 0.5).` };
  const age = Number(o.age);
  const adult = p.value === 'bat' && age >= 17;
  let kg = null;
  if (!adult) {
    const wf = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
    if (wf) return { valid: false, message: wf };
    kg = Number(o.weight);
  }
  const L = LABELS[p.value];
  const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The ${L.name} label figures are withheld: ${lr.why}. Read the dose and rates from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const tail = [`Label: ${lr.edition}.`];

  if (p.value === 'babybig') {
    if (age >= 1) return { valid: true, flag: 'not-in-label', abnormal: true, labelUrl: lr.url, band: `BabyBIG is labeled for infant botulism in patients below one year of age. At ${age} years the label gives no dose.`, bandLabel: 'No label dose', notes: tail, note: NOTE };
    return { valid: true, flag: 'dose', abnormal: false, labelUrl: lr.url, volumeMl: Number(kg.toFixed(2)), doseMg: Number((50 * kg).toFixed(1)), startRateMlPerHour: Number((0.5 * kg).toFixed(2)), maxRateMlPerHour: Number(kg.toFixed(2)),
      band: `BabyBIG ${n2(kg)} mL (1.0 mL/kg; ${n2(50 * kg)} mg at 50 mg/kg), as a single intravenous infusion: start at ${n2(0.5 * kg)} mL/hour, and after 15 minutes with no reaction increase to ${n2(kg)} mL/hour.`, bandLabel: `${n2(kg)} mL`,
      notes: ['Label: reconstitute to 50 mg/mL with 2 mL of sterile water for injection; begin the infusion within 2 hours; use a separate intravenous line; do not exceed the recommended dose, concentration and rate.', `At ${n2(kg)} mL/hour the ${n2(kg)} mL dose runs for about 1 hour after the first 15 minutes.`, ...tail], note: NOTE };
  }

  const notes = ['All BAT doses are diluted 1:10 in normal saline and given by slow intravenous infusion. The fill volume varies by lot (10 to 26 mL per vial), so the volume of a percent of a vial comes from the vial in hand.'];
  if (adult) {
    return { valid: true, flag: 'dose', abnormal: false, labelUrl: lr.url, percentOfVial: 100, startRateMlPerMin: 0.5, maxRateMlPerMin: 2,
      band: 'BAT: one vial (adults 17 years and over). Start at 0.5 mL/min for the first 30 minutes; if tolerated double the rate every 30 minutes, to a maximum of 2 mL/min.', bandLabel: 'One vial', notes: [...notes, ...tail], note: NOTE };
  }
  const start = Math.min(0.01 * kg, 0.5); const max = Math.min(0.03 * kg, 2);
  const rates = `Start at 0.01 mL/kg/min, ${n3(start)} mL/min, for the first 30 minutes; if tolerated increase by 0.01 mL/kg/min every 30 minutes, to a maximum of 0.03 mL/kg/min, ${n3(max)} mL/min${0.03 * kg > 2 || 0.01 * kg > 0.5 ? ' (held to the adult rate, which the label says not to exceed)' : ''}.`;
  const rule = Math.min(100, Math.max(20, kg <= 30 ? 2 * kg : kg + 30));
  let flag = 'dose'; let abnormal = false; let pct = null; let band; let label;
  if (age < 1) {
    pct = 10; band = `BAT: 10% of the adult dose (one tenth of a vial), the label's dose for infants under 1 year regardless of body weight. ${rates}`; label = '10% of a vial';
  } else {
    const row = TABLE.find(([lo, hi]) => kg >= lo && kg <= hi);
    if (row) {
      pct = row[2]; band = `BAT: ${pct}% of the adult dose, the label's table row for ${rowName(row).split(':')[0]}. ${rates}`; label = `${pct}% of a vial`;
    } else if (kg < 10) {
      flag = 'weight-not-in-table'; abnormal = true; label = 'No table row';
      band = `The label's pediatric table starts at 10 kg and has no row for ${kg} kg at ${age} years. Its footnote gives a minimum pediatric dose of 20% of the adult dose; no row is chosen here. ${rates}`;
    } else {
      const below = [...TABLE].reverse().find(([, hi]) => hi < kg); const above = TABLE.find(([lo]) => lo > kg);
      flag = 'between-rows'; abnormal = true; label = 'Two rows shown';
      band = `${kg} kg falls between two whole-kilogram rows of the label's table (${rowName(below)} and ${rowName(above)}). Both are shown; none is chosen. ${rates}`;
    }
    notes.push(`The Salisbury rule in the table's own footnote gives ${n2(rule)}% at ${kg} kg (${kg <= 30 ? '2 × weight' : 'weight + 30'}, minimum 20%, never more than one vial).${pct !== null && Math.abs(rule - pct) > 1e-9 ? ` The table row and the rule differ; the label says to dose "according to Table 2", so the table is used.` : ''}`);
  }
  notes.push(...tail);
  return { valid: true, flag, abnormal, labelUrl: lr.url, percentOfVial: pct, salisburyPercent: age < 1 ? null : Number(rule.toFixed(1)), startRateMlPerMin: Number(start.toFixed(3)), maxRateMlPerMin: Number(max.toFixed(3)), band, bandLabel: label, notes, note: NOTE };
}
