// spec-v1636 tool 12: hepatitis B, varicella and tetanus immune globulin doses, from the labels.
//
// Sources, DailyMed labels re-read October 12, 2026:
//   HyperHEP B, Grifols (set cda35690-..., version 26) and Nabi-HB, ADMA (set 47fe1a99-..., version
//     8): after exposure, "an injection of 0.06 mL/kg of body weight should be administered
//     intramuscularly as soon as possible after exposure and within 24 hours, if possible" (its
//     value beyond 7 days is unclear); the newborn of an HBsAg-positive mother, 0.5 mL "after
//     physiologic stabilization of the infant and preferably within 12 hours of birth".
//   VARIZIG, Kamada (set f367f996-..., version 5), Table 1: 2.0 kg or less, 62.5 IU (0.5 vial,
//     0.6 mL); 2.1-10.0 kg, 125 IU (1 vial, 1.2 mL); 10.1-20.0 kg, 250 IU (2 vials, 2.4 mL);
//     20.1-30.0 kg, 375 IU (3 vials, 3.6 mL); 30.1-40.0 kg, 500 IU (4 vials, 4.8 mL); 40.1 kg or
//     more, 625 IU (5 vials, 6.0 mL). "as soon as possible ..., ideally within 96 hours"; "Do not
//     exceed 3 mL per injection site". The text also says the maximum 625 IU is "for all patients
//     greater than 40 kilograms", and the highlights print the last row as ">40.1".
//   HyperTET, Grifols (set 393fa198-..., version 20): "Adults and children 7 years and older: ...
//     250 units"; "Children less than 7 years old: ... may be calculated by the body weight
//     (4.0 units/kg). However, it may be advisable to administer the entire contents of the syringe
//     ... (250 units) regardless of the child's size". 250 units per 1 mL.
//
// The VARIZIG table is printed to one decimal, so a weight between two rows (10.05 kg) returns both.
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = {
  hyperhepb: { name: 'HyperHEP B', setId: 'cda35690-672f-46cd-8520-e37f4d66a8d7' },
  nabihb: { name: 'Nabi-HB', setId: '47fe1a99-5078-4b89-84fa-9e8387baec5c' },
  varizig: { name: 'VARIZIG', setId: 'f367f996-aafa-4b8b-8cb4-63a009cd2015' },
  hypertet: { name: 'HyperTET', setId: '393fa198-7e07-4162-bd0a-9d873f1544a9' },
};
export const PRODUCTS = [
  { value: 'hbig-after-exposure', text: 'Hepatitis B immune globulin: after an exposure', labels: ['hyperhepb', 'nabihb'] },
  { value: 'hbig-newborn', text: 'Hepatitis B immune globulin: newborn of an HBsAg-positive mother', labels: ['hyperhepb', 'nabihb'] },
  { value: 'varizig', text: 'Varicella zoster immune globulin (VARIZIG)', labels: ['varizig'] },
  { value: 'tetanus-immune-globulin', text: 'Tetanus immune globulin (HyperTET), prophylaxis', labels: ['hypertet'] },
];
// [low kg, high kg, IU, vials, mL]
const VZ = [[0, 2.0, 62.5, 0.5, 0.6], [2.1, 10.0, 125, 1, 1.2], [10.1, 20.0, 250, 2, 2.4], [20.1, 30.0, 375, 3, 3.6], [30.1, 40.0, 500, 4, 4.8], [40.1, Infinity, 625, 5, 6.0]];
const NOTE = 'The labeled dose for the product and patient entered. Whether immune globulin is indicated after an exposure (vaccination history, the source, the time elapsed) is decided from the label\'s own tables and public health guidance, not here.';
const n2 = (x) => (Math.round(x * 100) / 100).toLocaleString('en-US');
const vzName = ([lo, hi, iu, vials, ml]) => `${hi === Infinity ? `${lo} kg or more` : lo === 0 ? `${hi.toFixed(1)} kg or less` : `${lo.toFixed(1)} to ${hi.toFixed(1)} kg`}: ${iu} international units (${vials} vial${vials <= 1 ? '' : 's'}, ${ml.toFixed(1)} mL)`;

export function passiveImmunizationDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const p = PRODUCTS.find((x) => x.value === String(o.product ?? '').trim());
  if (!p) return { valid: false, message: 'Choose the product and situation. Each label doses differently.' };
  let kg = null; let age = null;
  if (p.value === 'hbig-after-exposure' || p.value === 'varizig') {
    const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
    if (f) return { valid: false, message: f };
    kg = Number(o.weight);
  }
  if (p.value === 'tetanus-immune-globulin') {
    const f = inputFault([['the age', o.age, 0, 120, 'years']]);
    if (f) return { valid: false, message: f };
    age = Number(o.age);
    if (age < 7) {
      const wf = inputFault([['the weight', o.weight, 0.4, 150, 'kg']]);
      if (wf) return { valid: false, message: `${wf} Under 7 years the label allows a dose by body weight.` };
      kg = Number(o.weight);
    }
  }
  const rows = p.labels.map((k) => labelRow(LABELS[k].setId, now, table));
  const bad = rows.findIndex((r) => !r.answers);
  if (bad >= 0) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: rows[bad].url, band: `The ${LABELS[p.labels[bad]].name} label figures are withheld: ${rows[bad].why}. Read the dose from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const tail = [`Label${rows.length > 1 ? 's' : ''}: ${rows.map((r) => r.edition).join('; ')}.`];
  const base = { valid: true, flag: 'dose', abnormal: false, labelUrl: rows[0].url, note: NOTE };

  if (p.value === 'hbig-after-exposure') {
    const ml = 0.06 * kg;
    return { ...base, volumeMl: Number(ml.toFixed(2)), band: `Hepatitis B immune globulin ${n2(ml)} mL intramuscularly (0.06 mL/kg × ${kg} kg), as soon as possible after exposure and within 24 hours if possible.`, bandLabel: `${n2(ml)} mL`,
      notes: ['Both labels (HyperHEP B and Nabi-HB) give 0.06 mL/kg, and say the value of a dose more than 7 days after exposure is unclear.', 'The Nabi-HB label gives a second dose one month later to people who refuse hepatitis B vaccine or are known non-responders.', 'Whether immune globulin, vaccine or both are given follows each label\'s table by the exposed person\'s vaccination status and the source.', ...tail] };
  }
  if (p.value === 'hbig-newborn') {
    return { ...base, volumeMl: 0.5, band: 'Hepatitis B immune globulin 0.5 mL intramuscularly to the newborn of an HBsAg-positive mother, after physiologic stabilization and preferably within 12 hours of birth.', bandLabel: '0.5 mL',
      notes: ['Both labels state the 0.5 mL dose. The HyperHEP B label adds that efficacy decreases markedly if treatment is delayed beyond 48 hours.', 'The hepatitis B vaccine series is started at the same time, at a different site.', ...tail] };
  }
  if (p.value === 'varizig') {
    const row = VZ.find(([lo, hi]) => kg >= lo && kg <= hi);
    const timing = 'Label: give as soon as possible after exposure, ideally within 96 hours; intramuscularly, divided between sites so that no site receives more than 3 mL; discard partial vials.';
    if (row) {
      return { ...base, units: row[2], vials: row[3], volumeMl: row[4], band: `VARIZIG ${row[2]} international units: ${row[3]} vial${row[3] <= 1 ? '' : 's'}, ${row[4].toFixed(1)} mL (the label's row for ${vzName(row).split(':')[0]}).`, bandLabel: `${row[2]} units`,
        notes: [timing, row[4] > 3 ? `${row[4].toFixed(1)} mL is more than 3 mL, so it is divided between at least 2 sites.` : null, 'The label says to consider a second full dose for high-risk patients with a further exposure more than 3 weeks after the first.', ...tail].filter(Boolean) };
    }
    const below = [...VZ].reverse().find(([, hi]) => hi < kg); const above = VZ.find(([lo]) => lo > kg);
    return { ...base, flag: 'between-rows', abnormal: true, band: `${kg} kg falls between two rows of the label's table, which is printed to one decimal: ${vzName(below)} and ${vzName(above)}. Both are shown; none is chosen.`, bandLabel: 'Two rows shown',
      notes: [above[1] === Infinity ? 'The label\'s text says the maximum of 625 international units is "for all patients greater than 40 kilograms", while its table starts that row at 40.1 kg.' : null, timing, ...tail].filter(Boolean) };
  }
  if (age >= 7) return { ...base, units: 250, volumeMl: 1, band: 'Tetanus immune globulin 250 units (1 mL) by deep intramuscular injection: the label\'s routine prophylactic dose for adults and children 7 years and older.', bandLabel: '250 units',
    notes: ['Label: tetanus and diphtheria toxoid is given at the same time, in a different extremity and with a separate syringe.', ...tail] };
  const byWeight = 4 * kg;
  return { ...base, flag: 'label-gives-two-doses', abnormal: true, unitsByWeight: Number(byWeight.toFixed(1)), units: 250, band: `Under 7 years the label gives two doses and does not choose: by body weight, 4.0 units/kg × ${kg} kg = ${n2(byWeight)} units (${n2(byWeight / 250)} mL); or the entire 250-unit syringe (1 mL) regardless of the child's size.`, bandLabel: `${n2(byWeight)} or 250 units`,
    notes: ['The label\'s reason for the whole syringe: the same amount of toxin is produced in a child\'s body as in an adult\'s.', 'Label: the age-appropriate tetanus toxoid vaccine is given at the same time, at a different site.', ...tail] };
}
