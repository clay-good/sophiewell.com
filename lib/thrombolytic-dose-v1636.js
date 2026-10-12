// spec-v1636 tool 11: alteplase and tenecteplase dose by weight and indication, from the labels.
//
// Sources, DailyMed labels re-read October 12, 2026:
//   Activase (alteplase), Genentech, set c669f77c-..., version 15.
//     2.1 stroke: "0.9 mg/kg (not to exceed 90 mg total dose), with 10% of the total dose administered
//      as an initial intravenous bolus over 1 minute and the remainder infused over 60 minutes."
//     2.2 myocardial infarction, total "not to exceed 100 mg". Table 1, accelerated: over 67 kg,
//      15 mg bolus, 50 mg over the first 30 minutes, 35 mg over the next 60; 67 kg or less, 15 mg,
//      0.75 mg/kg, 0.50 mg/kg. Table 2, 3-hour: 65 kg or more, 6-10 mg bolus, 50-54 mg in the rest of
//      the first hour, 20 mg, 20 mg; under 65 kg, 0.075, 0.675, 0.25 and 0.25 mg/kg.
//     2.3 pulmonary embolism: "100 mg administered by IV infusion over 2 hours."
//     2.4: "may be administered as reconstituted at 1 mg/mL".
//   TNKase (tenecteplase), Genentech, set e647640d-..., version 4. Table 1, stroke: under 60 kg 15 mg
//     (3 mL); 60 to under 70 kg 17.5 mg (3.5 mL); 70 to under 80 kg 20 mg (4 mL); 80 to under 90 kg
//     22.5 mg (4.5 mL); 90 kg or more 25 mg (5 mL). Table 2, STEMI: the same bands at 30, 35, 40, 45
//     and 50 mg (6 to 10 mL). A single bolus over 5 seconds; 5 mg/mL as reconstituted.
//   Cathflo Activase, Genentech, set 91ecdef2-..., version 18: "Patients weighing >=30 kg: 2 mg in
//     2 mL. Patients weighing <30 kg: 110% of the internal lumen volume of the catheter, not to
//     exceed 2 mg in 2 mL. If catheter function is not restored at 120 minutes after 1 dose ..., a
//     second dose may be instilled."
//
// The TNKase label prints weight bands for stroke, not "0.25 mg/kg, maximum 25 mg"; the bands are
// what is used. Eligibility, timing windows and contraindications are not assessed here.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = {
  activase: { name: 'Activase', setId: 'c669f77c-fa48-478b-a14b-80b20a0139c2' },
  tnkase: { name: 'TNKase', setId: 'e647640d-c395-4b4b-a0be-1162f9c21d84' },
  cathflo: { name: 'Cathflo Activase', setId: '91ecdef2-95ff-42dd-a31c-c8a09cab3ad9' },
};
export const REGIMENS = [
  { value: 'alteplase-ischemic-stroke', text: 'Alteplase: acute ischemic stroke', label: 'activase' },
  { value: 'alteplase-mi-accelerated', text: 'Alteplase: myocardial infarction, accelerated infusion', label: 'activase' },
  { value: 'alteplase-mi-3-hour', text: 'Alteplase: myocardial infarction, 3-hour infusion', label: 'activase' },
  { value: 'alteplase-pulmonary-embolism', text: 'Alteplase: pulmonary embolism', label: 'activase' },
  { value: 'tenecteplase-ischemic-stroke', text: 'Tenecteplase: acute ischemic stroke', label: 'tnkase' },
  { value: 'tenecteplase-stemi', text: 'Tenecteplase: ST-elevation myocardial infarction', label: 'tnkase' },
  { value: 'cathflo-occluded-line', text: 'Cathflo Activase: catheter clearance', label: 'cathflo' },
];
// [upper weight bound in kg (exclusive), stroke mg, STEMI mg, the label's band]
const TNK = [[60, 15, 30, 'less than 60 kg'], [70, 17.5, 35, '60 kg to less than 70 kg'], [80, 20, 40, '70 kg to less than 80 kg'], [90, 22.5, 45, '80 kg to less than 90 kg'], [Infinity, 25, 50, '90 kg or more']];
const NOTE = 'The labeled dose arithmetic for the weight and indication chosen. It does not assess eligibility, the time window, contraindications or bleeding risk, and it is not an order.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');

export function thrombolyticDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const reg = REGIMENS.find((r) => r.value === String(o.regimen ?? '').trim());
  if (!reg) return { valid: false, message: 'Choose the drug and indication. Each has its own labeled dose.' };
  const needsWeight = reg.value !== 'alteplase-pulmonary-embolism';
  let kg = null;
  if (needsWeight || !blank(o.weight)) {
    const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
    if (f) return { valid: false, message: f };
    kg = Number(o.weight);
  }
  let lumen = null;
  if (reg.value === 'cathflo-occluded-line' && kg < 30) {
    const lf = inputFault([['the internal lumen volume of the catheter', o.lumenVolume, null, 10, 'mL']]);
    if (lf) return { valid: false, message: `${lf} Under 30 kg the label doses by 110% of it.` };
    lumen = Number(o.lumenVolume);
  }
  const L = LABELS[reg.label];
  const lr = labelRow(L.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The ${L.name} label figures are withheld: ${lr.why}. Read the dose from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };

  const notes = []; let band; let label; let total = null; const parts = [];
  const part = (name, mg, minutes) => { parts.push({ name, mg: Number(mg.toFixed(2)), minutes }); return `${name}: ${n1(mg)} mg (${n1(mg)} mL at 1 mg/mL)${minutes ? ` over ${minutes} minutes, ${n1(mg / (minutes / 60))} mL/hour` : ''}.`; };
  if (reg.value === 'alteplase-ischemic-stroke') {
    total = Math.min(0.9 * kg, 90); const bolus = total * 0.1;
    band = `Alteplase ${n1(total)} mg: ${n1(bolus)} mg bolus over 1 minute, then ${n1(total - bolus)} mg over 60 minutes.`; label = `${n1(total)} mg`;
    notes.push(`0.9 mg/kg × ${kg} kg = ${n1(0.9 * kg)} mg${0.9 * kg > 90 ? ', held to the label\'s maximum of 90 mg' : ''}.`);
    notes.push(`Bolus (10% of the total): ${n1(bolus)} mg (${n1(bolus)} mL at 1 mg/mL) over 1 minute.`, part('Infusion (the remainder)', total - bolus, 60));
    parts.unshift({ name: 'Bolus', mg: Number(bolus.toFixed(2)), minutes: 1 });
    notes.push(`From a 100 mg vial, ${n1(100 - total)} mL is not part of the dose.`);
  } else if (reg.value === 'alteplase-mi-accelerated') {
    const heavy = kg > 67; const a = heavy ? 50 : 0.75 * kg; const b = heavy ? 35 : 0.5 * kg; total = 15 + a + b;
    band = `Alteplase ${n1(total)} mg: 15 mg bolus, ${n1(a)} mg over 30 minutes, then ${n1(b)} mg over 60 minutes.`; label = `${n1(total)} mg`;
    notes.push(heavy ? `Over 67 kg: the label's fixed row, 15 mg, 50 mg and 35 mg.` : `67 kg or less: 15 mg, then 0.75 mg/kg and 0.50 mg/kg at ${kg} kg.`);
    notes.push('Bolus: 15 mg (15 mL at 1 mg/mL).', part('First 30 minutes', a, 30), part('Next 60 minutes', b, 60));
    parts.unshift({ name: 'Bolus', mg: 15, minutes: null });
    notes.push('The label\'s total for myocardial infarction is not to exceed 100 mg.', `From a 100 mg vial, ${n1(100 - total)} mL is not part of the dose.`);
  } else if (reg.value === 'alteplase-mi-3-hour') {
    if (kg >= 65) {
      total = 100; band = 'Alteplase 100 mg over 3 hours: 60 mg in the first hour (6 to 10 mg of it as a bolus), 20 mg in the second hour and 20 mg in the third.'; label = '100 mg';
      notes.push('65 kg or more: bolus 6 to 10 mg, then 50 to 54 mg over the rest of the first hour, so that the first hour totals 60 mg. The label gives the bolus as a range and does not pick a point in it.', 'Second hour: 20 mg (20 mL/hour at 1 mg/mL). Third hour: 20 mg (20 mL/hour).');
    } else {
      const b = 0.075 * kg; const r1 = 0.675 * kg; const h = 0.25 * kg; total = 1.25 * kg;
      band = `Alteplase ${n1(total)} mg over 3 hours (1.25 mg/kg): ${n2(b)} mg bolus, ${n2(r1)} mg over the rest of the first hour, then ${n2(h)} mg in each of the second and third hours.`; label = `${n1(total)} mg`;
      notes.push(`Under 65 kg: 0.075, 0.675, 0.25 and 0.25 mg/kg at ${kg} kg.`, `Bolus: ${n2(b)} mg. Rest of the first hour: ${n2(r1)} mg. Second hour: ${n2(h)} mg (${n2(h)} mL/hour at 1 mg/mL). Third hour: ${n2(h)} mg.`);
      parts.push({ name: 'Bolus', mg: Number(b.toFixed(2)), minutes: null }, { name: 'Rest of the first hour', mg: Number(r1.toFixed(2)), minutes: null }, { name: 'Second hour', mg: Number(h.toFixed(2)), minutes: 60 }, { name: 'Third hour', mg: Number(h.toFixed(2)), minutes: 60 });
    }
    notes.push('The label\'s total for myocardial infarction is not to exceed 100 mg.');
  } else if (reg.value === 'alteplase-pulmonary-embolism') {
    total = 100; band = 'Alteplase 100 mg by intravenous infusion over 2 hours (50 mL/hour at 1 mg/mL).'; label = '100 mg over 2 hours';
    parts.push({ name: 'Infusion', mg: 100, minutes: 120 });
    notes.push('The dose is the same at every weight.', 'Label: start parenteral anticoagulation near the end of or immediately after the infusion, when the partial thromboplastin time or thrombin time returns to twice normal or less.');
  } else if (reg.label === 'tnkase') {
    const stroke = reg.value === 'tenecteplase-ischemic-stroke';
    const row = TNK.find(([top]) => kg < top);
    total = stroke ? row[1] : row[2]; const vial = stroke ? 25 : 50;
    band = `Tenecteplase ${n1(total)} mg (${n1(total / 5)} mL at 5 mg/mL) as a single bolus over 5 seconds: the label's band for ${row[3]}.`; label = `${n1(total)} mg`;
    parts.push({ name: 'Bolus', mg: total, minutes: null });
    notes.push(stroke ? 'The label prints weight bands for stroke, to a maximum of 25 mg (5 mL), within 3 hours of symptom onset. It does not print a per-kilogram dose, and none is used.' : 'The label prints weight bands for STEMI, to a maximum of 50 mg (10 mL).');
    notes.push(`From a ${vial} mg vial reconstituted to 5 mg/mL, ${n1((vial - total) / 5)} mL (${n1(vial - total)} mg) is not part of the dose.`);
  } else {
    if (kg >= 30) { total = 2; band = 'Cathflo Activase 2 mg in 2 mL, instilled into the catheter (30 kg or more).'; }
    else {
      const ml = Math.min(1.1 * lumen, 2); total = ml;
      band = `Cathflo Activase ${n2(ml)} mL (${n2(ml)} mg at 1 mg/mL), instilled into the catheter: 110% of the ${lumen} mL lumen volume${1.1 * lumen > 2 ? ', held to the label\'s 2 mg in 2 mL' : ''} (under 30 kg).`;
    }
    label = `${n2(total)} mg`; parts.push({ name: 'Instillation', mg: Number(total.toFixed(2)), minutes: null });
    notes.push('Label: if catheter function is not restored at 120 minutes after one dose, a second dose of equal amount may be instilled. It has no information on more than 2 mg per dose.', `From a 2 mg vial reconstituted to 1 mg/mL, ${n2(2 - total)} mL is not part of the dose.`);
  }
  if (reg.label === 'activase') notes.push('Volumes are at 1 mg/mL as reconstituted; the label also allows dilution to 0.5 mg/mL, which doubles them.');
  notes.push(`Label: ${lr.edition}.`);
  return { valid: true, flag: 'dose', abnormal: false, labelUrl: lr.url, totalMg: Number(total.toFixed(2)), parts, band, bandLabel: label, notes, note: NOTE };
}
