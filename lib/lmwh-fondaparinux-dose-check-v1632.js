// spec-v1632 tool 2: dalteparin and fondaparinux dose by weight, read from each label.
//
// Two label rows (spec-v1628 section 1), each re-read on October 11, 2026. The tool reports the row
// the label gives and recommends nothing.
//
// Fragmin (dalteparin; Pfizer, DailyMed version 27), sections 2.1 to 2.3, 2.5 and 2.6:
//   Unstable angina or non-Q-wave MI: "120 units/kg of body weight, but not more than 10,000 units,
//     subcutaneously every 12 hours" with aspirin; Table 1 by weight (UA_TABLE).
//   Hip replacement, Table 2: three start options, then 5,000 units once daily. Abdominal surgery:
//     2,500 units once daily starting 1 to 2 hours before surgery; high risk, 5,000 units the evening
//     before and then once daily, or in malignancy 2,500 units 1 to 2 hours before, 2,500 units 12
//     hours later, then 5,000 units once daily. Medical patients: 5,000 units once daily.
//   Cancer with symptomatic VTE: first 30 days "200 units/kg total body weight subcutaneously once
//     daily. The total daily dose should not exceed 18,000 units" (Table 3, CANCER_MONTH_1); months 2
//     to 6 "approximately 150 units/kg", not above 18,000 (Table 4, CANCER_LATER).
//   Table 6 (adults): platelets <= 50,000/mm3, "Discontinue FRAGMIN until platelet count recovers to
//     above 50,000"; > 50,000 up to 100,000, "Reduce the daily dose of FRAGMIN by 2,500 units until
//     the platelet count recovers to greater or equal to 100,000".
//   2.6 (cancer VTE): CrCl < 30 mL/min, "monitor anti-Xa levels to determine the appropriate FRAGMIN
//     dose. Target anti-Xa range is 0.5 units/mL to 1.5 units/mL", sampled 4 to 6 hours after a dose
//     and only after 3 to 4 doses. The label gives no dose for it.
//
// Arixtra (fondaparinux; Mylan Institutional, version 13), sections 2.2 to 2.4 and 4:
//   Prophylaxis after hip fracture, hip replacement, knee replacement or abdominal surgery: 2.5 mg
//     once daily, the first dose "no earlier than 6 hours to 8 hours after surgery".
//   DVT or PE treatment: "5 mg (body weight less than 50 kg), 7.5 mg (body weight 50 kg to 100 kg),
//     or 10 mg (body weight greater than 100 kg)" once daily.
//   Contraindicated: "creatinine clearance [CrCl] less than 30 mL/min"; "Body weight less than 50 kg
//     (venous thromboembolism [VTE] prophylaxis in adults only)".
//
// The dalteparin tables are printed in whole kilograms ("50 kg to 59 kg", then "60 kg to 69 kg"), so
// a weight such as 59.5 kg falls between two rows; the tool then shows both rows and says so. The
// band dose and the per-kilogram figure differ by design; the label prints both.
//
// Adults only: the pediatric tables in both labels are out of scope (spec-v1632, Rejected).
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const DRUGS = [
  { value: 'dalteparin', text: 'Dalteparin (Fragmin)', brand: 'Fragmin', setId: '23527b8b-9b28-4e6d-9751-33b143975ac7' },
  { value: 'fondaparinux', text: 'Fondaparinux (Arixtra)', brand: 'Arixtra', setId: 'd3b30c68-cf45-4b46-8ba6-72090f7ba01a' },
];
export const INDICATIONS = [
  { value: 'ua-nqmi', text: 'Dalteparin: unstable angina or non-Q-wave MI', drug: 'dalteparin' },
  { value: 'hip', text: 'Dalteparin: DVT prophylaxis, hip replacement', drug: 'dalteparin' },
  { value: 'abdominal', text: 'Dalteparin: DVT prophylaxis, abdominal surgery', drug: 'dalteparin' },
  { value: 'abdominal-high', text: 'Dalteparin: DVT prophylaxis, abdominal surgery at high risk', drug: 'dalteparin' },
  { value: 'medical', text: 'Dalteparin: DVT prophylaxis, medical patients', drug: 'dalteparin' },
  { value: 'cancer-vte', text: 'Dalteparin: extended treatment of VTE in cancer', drug: 'dalteparin' },
  { value: 'surgical-prophylaxis', text: 'Fondaparinux: DVT prophylaxis after hip fracture, hip, knee or abdominal surgery', drug: 'fondaparinux' },
  { value: 'vte-treatment', text: 'Fondaparinux: treatment of DVT or PE', drug: 'fondaparinux' },
];
export const MONTHS = [
  { value: '1', text: 'Month 1 (first 30 days)' },
  { value: '2-6', text: 'Months 2 to 6' },
];
// [lowest kg, highest kg, units] as the label prints each row; null is open-ended.
export const UA_TABLE = [[null, 49, 5500], [50, 59, 6500], [60, 69, 7500], [70, 79, 9000], [80, 89, 10000], [90, null, 10000]];
export const CANCER_MONTH_1 = [[null, 56, 10000], [57, 68, 12500], [69, 82, 15000], [83, 98, 18000], [99, null, 18000]];
export const CANCER_LATER = [[null, 56, 7500], [57, 68, 10000], [69, 82, 12500], [83, 98, 15000], [99, null, 18000]];
const NOTE = 'This reports what the label gives for the values entered. It is not a recommendation, it covers adults only, and it does not check contraindications other than the two named, bleeding risk or neuraxial anesthesia.';

const sig = (x) => Number(Number(x).toPrecision(4));
const show = (x) => sig(x).toLocaleString('en-US', { maximumSignificantDigits: 4 });
const units = (n) => `${n.toLocaleString('en-US')} units`;
const rowName = ([lo, hi]) => (lo === null ? `${hi === 49 ? 'below 50' : `${hi} kg or less`}` : hi === null ? `${lo} kg or more` : `${lo} to ${hi} kg`);

// The row or rows of a whole-kilogram table that a weight falls in or between.
export function bandRows(tableRows, kg) {
  const inside = tableRows.filter(([lo, hi]) => (lo === null || kg >= lo) && (hi === null || kg <= hi));
  if (inside.length) return inside;
  const below = [...tableRows].reverse().find(([, hi]) => hi !== null && kg > hi);
  const above = tableRows.find(([lo]) => lo !== null && kg < lo);
  return [below, above].filter(Boolean);
}
// `lead(table)` is the sentence up to the dosing frequency; `row` is the clause for a note.
function bandText(tableRows, kg) {
  const rows = bandRows(tableRows, kg);
  if (rows.length === 1) {
    const row = `${units(rows[0][2])} (the row for ${rowName(rows[0])})`;
    return { doses: [rows[0][2]], row, lead: (table) => `The Fragmin label's ${table} gives ${row}` };
  }
  const same = rows[0][2] === rows[1][2];
  const row = `${units(rows[0][2])} (${rowName(rows[0])}) or ${units(rows[1][2])} (${rowName(rows[1])})`;
  return {
    doses: same ? [rows[0][2]] : [rows[0][2], rows[1][2]], between: true, row,
    lead: (table) => `${show(kg)} kg falls between two rows of the Fragmin label's ${table}, which is printed in whole kilograms: ${row}`,
  };
}

function dalteparin(o, ind) {
  const notes = [];
  if (ind === 'hip') {
    return { flag: 'dose', text: 'The Fragmin label gives 5,000 units once daily after hip replacement surgery, with three ways to start.', rule: 'Fixed doses; the label gives no weight band for this indication.', notes: [
      'Postoperative start: 2,500 units 4 to 8 hours after surgery, then 5,000 units once daily (at least 6 hours between the first dose and the next day\'s).',
      'Day-of-surgery start: 2,500 units within 2 hours before surgery and 2,500 units 4 to 8 hours after, then 5,000 units once daily.',
      'Evening-before start: 5,000 units 10 to 14 hours before surgery and 5,000 units 4 to 8 hours after, then 5,000 units once daily.',
      'Usual duration 5 to 10 days after surgery; up to 14 days was well tolerated in trials.',
    ] };
  }
  if (ind === 'abdominal') return { flag: 'dose', text: 'The Fragmin label gives 2,500 units once daily, starting 1 to 2 hours before abdominal surgery and repeated once daily after it.', rule: 'Fixed dose; usual duration 5 to 10 days.', notes };
  if (ind === 'abdominal-high') {
    return { flag: 'dose', text: 'The Fragmin label gives 5,000 units the evening before abdominal surgery at high risk, then once daily after it.', rule: 'Fixed dose; usual duration 5 to 10 days.', notes: ['Alternative in the label for patients with malignancy: 2,500 units 1 to 2 hours before surgery, 2,500 units 12 hours later, then 5,000 units once daily.'] };
  }
  if (ind === 'medical') return { flag: 'dose', text: 'The Fragmin label gives 5,000 units once daily for medical patients with severely restricted mobility during acute illness.', rule: 'Fixed dose; 12 to 14 days in the trials.', notes };
  const f = inputFault([['the weight', o.weight, 20, 400, 'kg']]);
  if (f) return { fault: f };
  const kg = Number(o.weight);
  if (ind === 'ua-nqmi') {
    const b = bandText(UA_TABLE, kg); const perKg = Math.min(120 * kg, 10000);
    notes.push(`By the label's per-kilogram rule: 120 units/kg × ${show(kg)} kg = ${units(Math.round(120 * kg))}${120 * kg > 10000 ? ', above the label\'s 10,000-unit ceiling, so 10,000 units' : ''} every 12 hours.`);
    notes.push('The table dose and the per-kilogram dose differ by design; the label prints both.', 'With aspirin 75 to 165 mg once daily unless contraindicated; usual duration 5 to 8 days.');
    return { flag: 'dose', doses: b.doses, perKgDose: Math.round(perKg), text: `${b.lead('Table 1')}, every 12 hours.`, rule: `Unstable angina or non-Q-wave MI at ${show(kg)} kg.`, notes };
  }
  // cancer-vte
  const month = String(o.month ?? '').trim();
  if (month !== '1' && month !== '2-6') return { fault: 'Choose the month of treatment: the label gives 200 units/kg in month 1 and about 150 units/kg in months 2 to 6.' };
  const pf = inputFault([['the creatinine clearance', o.crcl, 0, 250, 'mL/min'], ['the platelet count', o.platelets, 0, 2000, '× 1,000/mm³']]);
  if (pf) return { fault: `${pf} The label's dose for VTE in cancer turns on both.` };
  const crcl = Number(o.crcl); const plt = Number(o.platelets);
  const perKgRate = month === '1' ? 200 : 150;
  const b = bandText(month === '1' ? CANCER_MONTH_1 : CANCER_LATER, kg);
  const perKg = Math.min(perKgRate * kg, 18000);
  notes.push(`By the label's per-kilogram rule: ${month === '1' ? '' : 'about '}${perKgRate} units/kg × ${show(kg)} kg = ${units(Math.round(perKgRate * kg))}${perKgRate * kg > 18000 ? ', above the label\'s 18,000-unit ceiling, so 18,000 units' : ''} once daily.`);
  notes.push('The table dose and the per-kilogram dose differ by design; the label prints both.');
  const table = month === '1' ? 'Table 3 (month 1)' : 'Table 4 (months 2 to 6)';
  const out = { doses: b.doses, perKgDose: Math.round(perKg) };
  if (crcl < 30) {
    notes.push(`The table row for this weight would be ${b.row}.`);
    return { ...out, flag: 'no-recommendation-given', text: 'The Fragmin label gives no dose for a CrCl below 30 mL/min in cancer VTE: it says to monitor anti-Xa levels to determine the dose, with a target of 0.5 to 1.5 units/mL, sampled 4 to 6 hours after a dose and only after 3 to 4 doses.', rule: `CrCl ${show(crcl)} mL/min is below 30.`, notes };
  }
  if (plt <= 50) {
    notes.push(`The table row for this weight would be ${b.row}.`);
    return { ...out, flag: 'hold', text: 'The Fragmin label says to discontinue dalteparin until the platelet count recovers to above 50,000/mm³.', rule: `Platelets ${show(plt)} × 1,000/mm³ are 50,000 or below.`, notes };
  }
  if (plt < 100) {
    const reduced = b.doses.map((x) => units(x - 2500)).join(' or ');
    return { ...out, reducedDoses: b.doses.map((x) => x - 2500), flag: 'dose', text: `${b.lead(table)}, once daily; with platelets above 50,000 and below 100,000/mm³ it says to reduce the daily dose by 2,500 units, to ${reduced}, until the count is at least 100,000.`, rule: `Platelets ${show(plt)} × 1,000/mm³ are above 50,000 and below 100,000.`, notes };
  }
  if (plt === 100) notes.push('At exactly 100,000/mm³ the label\'s table reads both ways: its reduced-dose row runs "up to 100,000", and the reduction ends when the count is "greater or equal to 100,000". No reduction is applied here.');
  return { ...out, flag: 'dose', text: `${b.lead(table)}, once daily.`, rule: `VTE in cancer at ${show(kg)} kg, CrCl ${show(crcl)} mL/min, platelets ${show(plt)} × 1,000/mm³.`, notes: [...notes, 'The label says safety and efficacy beyond six months have not been evaluated.'] };
}

function fondaparinux(o, ind) {
  const f = inputFault([['the weight', o.weight, 20, 400, 'kg'], ['the creatinine clearance', o.crcl, 0, 250, 'mL/min']]);
  if (f) return { fault: `${f} The Arixtra label's contraindications turn on weight and creatinine clearance.` };
  const kg = Number(o.weight); const crcl = Number(o.crcl);
  if (crcl < 30) return { flag: 'contraindicated', text: 'The Arixtra label lists a creatinine clearance below 30 mL/min as a contraindication.', rule: `CrCl ${show(crcl)} mL/min is below 30.`, notes: [] };
  if (ind === 'surgical-prophylaxis') {
    if (kg < 50) return { flag: 'contraindicated', text: 'The Arixtra label lists a body weight below 50 kg as a contraindication for VTE prophylaxis in adults.', rule: `Weight ${show(kg)} kg is below 50 kg.`, notes: [] };
    return { flag: 'dose', doses: [2.5], text: 'The Arixtra label gives 2.5 mg once daily, the first dose no earlier than 6 to 8 hours after surgery, once hemostasis is established.', rule: `Weight ${show(kg)} kg is 50 kg or more and CrCl ${show(crcl)} mL/min is 30 or above.`, notes: ['Usual duration 5 to 9 days. After hip fracture surgery the label recommends extended prophylaxis for up to 24 additional days.', 'The label says a dose earlier than 6 hours after surgery increases the risk of major bleeding.'] };
  }
  const dose = kg < 50 ? 5 : kg <= 100 ? 7.5 : 10;
  return { flag: 'dose', doses: [dose], text: `The Arixtra label gives ${dose} mg once daily.`, rule: `Weight ${show(kg)} kg is ${kg < 50 ? 'below 50 kg' : kg <= 100 ? '50 to 100 kg' : 'above 100 kg'}; CrCl ${show(crcl)} mL/min is 30 or above.`, notes: ['The label says to start warfarin as soon as possible, usually within 72 hours, and to continue fondaparinux for at least 5 days and until the INR is 2 to 3.'] };
}

export function lmwhFondaparinuxDoseCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = DRUGS.find((d) => d.value === String(o.drug ?? '').trim());
  if (!drug) return { valid: false, message: 'Choose the drug: dalteparin or fondaparinux.' };
  const ind = INDICATIONS.find((i) => i.value === String(o.indication ?? '').trim());
  if (!ind) return { valid: false, message: 'Choose the indication. The label gives a different dose for each.' };
  if (ind.drug !== drug.value) return { valid: false, message: `That indication belongs to the other drug. The ${drug.brand} label's indications here: ${INDICATIONS.filter((i) => i.drug === drug.value).map((i) => i.text.split(': ')[1]).join('; ')}.` };
  const row = labelRow(drug.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, drug: drug.value, band: `The ${drug.brand} label's rows are withheld, so no dose is reported.`, bandLabel: 'Withheld', notes: [`The ${drug.brand} label rows are withheld: ${row.why}.`, 'Read the dose from the label in hand.'], note: NOTE };
  }
  const r = drug.value === 'dalteparin' ? dalteparin(o, ind.value) : fondaparinux(o, ind.value);
  if (r.fault) return { valid: false, message: r.fault };
  const short = { dose: 'Dose given', contraindicated: 'Contraindicated', hold: 'Discontinue', 'no-recommendation-given': 'No dose given' }[r.flag];
  const { text, rule, notes, flag, ...extra } = r;
  return {
    valid: true, drug: drug.value, indication: ind.value, flag, ...extra, abnormal: flag !== 'dose',
    band: text, bandLabel: short,
    notes: [rule, ...notes, `Label: ${row.edition}.`], note: NOTE,
  };
}
