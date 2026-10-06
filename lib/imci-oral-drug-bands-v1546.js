// spec-v1546 tool 2: IMCI home drug doses by weight (or age) for children 2-59 months.
//
// Sources, read October 6, 2026 (facts restated, nothing reproduced):
//   - CB14: WHO. IMCI chart booklet, March 2014 (all rights reserved), page images read: p. 12 amoxicillin
//     (250 mg tablet or 250 mg/5 mL syrup, twice daily for 5 days: 2-<12 months / 4-<10 kg 1 tablet or 5
//     mL; 12 months-<3 years / 10-<14 kg 2 or 10 mL; 3-<5 years / 14-19 kg 3 or 15 mL), cotrimoxazole
//     prophylaxis, ciprofloxacin (15 mg/kg twice daily for 3 days: under 6 months half a 250 mg tablet or a
//     quarter of 500 mg; 6 months-5 years 1 x 250 mg or half of 500 mg); p. 13 paracetamol for fever over
//     38.5 C or ear pain, every 6 hours (2 months-<3 years / 4-<14 kg 1 x 100 mg or a quarter of 500 mg; 3-<5
//     years / 14-<19 kg 1.5 x 100 mg or half of 500 mg) and albuterol (2 puffs of 100 micrograms with a
//     spacer, up to 3 times 15 minutes apart, before classifying pneumonia); p. 14 iron, daily for 14 days,
//     not with RUTF (iron syrup, ferrous fumarate 100 mg/5 mL, 20 mg/mL elemental: 2-<4 months / 4-<6 kg 1.00
//     mL; 4-<12 months / 6-<10 kg 1.25 mL; 12 months-<3 years / 10-<14 kg 2.00 mL; 3-<5 years / 14-19 kg
//     2.5 mL; iron/folate tablet, 60 mg elemental iron, half a tablet from 10 kg); the diarrhea page, zinc
//     20 mg tablet, half a tablet at 2-<6 months and 1 tablet from 6 months, daily for 14 days; p. 16
//     mebendazole 500 mg once from 1 year where hookworm or whipworm is a problem and no dose in 6 months.
//   - PD24: WHO guideline on management of pneumonia and diarrhoea in children up to 10 years, 2024:
//     amoxicillin at least 40 mg/kg per dose twice daily for 5 days; zinc 5 mg daily for up to 14 days
//     (conditional), for children up to 10 years.
//
// Stated rather than hidden: bands are as printed, with some top bands closed (14-19 kg) and some open
// (14-<19 kg); weight wins over age when both are given and they disagree. Antimalarials, vitamin A and
// cotrimoxazole for HIV go to their own tiles.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const DRUG_OPTIONS = [
  { value: 'amoxicillin', text: 'Amoxicillin (pneumonia, ear infection)' },
  { value: 'acetaminophen', text: 'Acetaminophen for high fever or ear pain' },
  { value: 'iron', text: 'Iron (anemia)' },
  { value: 'cipro', text: 'Ciprofloxacin (dysentery)' },
  { value: 'zinc', text: 'Zinc (diarrhea)' },
  { value: 'albuterol', text: 'Albuterol inhaler (wheeze)' },
  { value: 'mebendazole', text: 'Mebendazole' },
];
export const ZINC_OPTIONS = [{ value: 'cb14', text: 'IMCI chart 2014 (20 mg tablets)' }, { value: 'pd24', text: 'WHO guideline 2024 (5 mg daily)' }];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows the WHO IMCI chart booklet (2014) as printed, for children 2 months up to 5 years. Antimalarials, vitamin A and HIV cotrimoxazole have their own tiles.';

// Band index 0-3 for the four-band charts (by weight first).
function band4(kg, months, closedTop) {
  if (kg !== null) {
    if (kg < 4 || kg > 19 || (!closedTop && kg >= 19)) return { i: -1 };
    return { i: kg < 6 ? 0 : kg < 10 ? 1 : kg < 14 ? 2 : 3, by: 'weight' };
  }
  if (months < 2 || months >= 60) return { i: -1 };
  return { i: months < 4 ? 0 : months < 12 ? 1 : months < 36 ? 2 : 3, by: 'age' };
}
function ageBand(months) { return months < 4 ? 0 : months < 12 ? 1 : months < 36 ? 2 : 3; }

export function imciOralDrugBands(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const d = DRUG_OPTIONS.find((x) => x.value === o.drug);
  if (!d) return { valid: false, message: 'Choose the drug.' };
  let kg = null;
  let months = null;
  if (String(o.weight ?? '').trim() !== '') {
    const f = inputFault([['the weight', o.weight, 1, 60, 'kg']]);
    if (f) return { valid: false, message: f };
    kg = Number(o.weight);
  }
  if (String(o.age ?? '').trim() !== '') {
    const f = inputFault([['the age', o.age, 0, 120, 'months']]);
    if (f) return { valid: false, message: f };
    months = Number(o.age);
  }
  const notes = [];
  const out = (band, label, abnormal = false) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });

  if (d.value === 'albuterol') return out('Albuterol 100 micrograms per puff with a spacer: 2 puffs, repeated up to 3 times 15 minutes apart, before classifying pneumonia.', '2 puffs with spacer');
  if (d.value === 'zinc' && o.edition === 'pd24') return out('Zinc 5 mg once a day for up to 14 days (WHO 2024, children up to 10 years).', '5 mg daily');
  if (months === null && kg === null) return { valid: false, message: 'Enter the weight (preferred) or the age in months.' };
  if (months !== null && (months < 2 || months >= 60) && d.value !== 'mebendazole') return { valid: false, message: 'Enter an age from 2 up to 59 months: the IMCI chart covers 2 months up to 5 years.' };

  if (d.value === 'mebendazole') {
    if (months === null) return { valid: false, message: 'Enter the age in months: mebendazole is from 1 year.' };
    if (months < 12) return out('No mebendazole under 1 year.', 'Not under 1 year');
    return out('Mebendazole 500 mg as a single dose in the clinic, if hookworm or whipworm is a problem locally and the child has not had a dose in the past 6 months.', '500 mg once');
  }
  if (d.value === 'zinc') {
    if (months === null) return { valid: false, message: 'Enter the age in months: the IMCI zinc dose is by age.' };
    if (o.edition !== 'cb14') notes.push('Edition: not entered, so the 2014 chart is used. WHO\'s 2024 guideline gives 5 mg daily instead.');
    return out(`Zinc ${months < 6 ? 'half a 20 mg tablet (10 mg)' : '1 tablet of 20 mg'} once a day for 14 days (IMCI 2014).`, months < 6 ? '½ tablet daily' : '1 tablet daily');
  }
  if (d.value === 'cipro') {
    if (months === null) return { valid: false, message: 'Enter the age in months: the IMCI ciprofloxacin dose is by age.' };
    if (kg !== null) notes.push(`For ${kg} kg, 15 mg/kg is ${Math.round(15 * kg)} mg a dose.`);
    return out(`Ciprofloxacin ${months < 6 ? 'half a 250 mg tablet (or a quarter of a 500 mg tablet)' : '1 tablet of 250 mg (or half of a 500 mg tablet)'} twice a day for 3 days.`, months < 6 ? '½ × 250 mg' : '1 × 250 mg');
  }

  if (kg === null) notes.push('Weight: not entered, so the age band is used (the chart prefers weight).');
  const closed = d.value !== 'acetaminophen';
  const b = band4(kg, months, closed);
  if (b.i < 0) return { valid: false, message: kg !== null ? `The chart covers ${closed ? '4 to 19 kg' : '4 to under 19 kg'}; this weight is outside it.` : 'Enter an age from 2 up to 59 months.' };
  if (kg !== null && months !== null && months >= 2 && months < 60) {
    const grp = (i) => (d.value === 'amoxicillin' ? Math.max(1, i) - 1 : d.value === 'acetaminophen' ? Number(i >= 3) : i);
    const mismatch = grp(ageBand(months)) !== grp(b.i);
    if (mismatch) notes.push('Weight and age fall in different bands: the weight is used.');
  }

  if (d.value === 'amoxicillin') {
    const idx = Math.max(1, b.i) - 1;
    const tabs = [1, 2, 3][idx];
    const ml = [5, 10, 15][idx];
    if (kg !== null) notes.push(`That is ${Math.round((250 * tabs) / kg)} mg/kg a dose; WHO 2024 gives at least 40 mg/kg a dose twice a day.`);
    return out(`Amoxicillin ${tabs} tablet${tabs > 1 ? 's' : ''} of 250 mg (or ${ml} mL of 250 mg/5 mL syrup) twice a day for 5 days.`, `${tabs} tablet${tabs > 1 ? 's' : ''} twice daily`);
  }
  if (d.value === 'acetaminophen') {
    const small = b.i < 3;
    return out(`Acetaminophen ${small ? '1 tablet of 100 mg (or a quarter of a 500 mg tablet)' : '1½ tablets of 100 mg (or half of a 500 mg tablet)'} every 6 hours, for fever over 38.5 °C or ear pain, until it is gone.`, small ? '100 mg every 6 h' : '150 mg every 6 h');
  }
  // Iron.
  if (o.rutf === 'yes') return out('No iron: a child with severe acute malnutrition on RUTF already gets enough iron from it.', 'No iron on RUTF');
  if (o.rutf !== 'no') notes.push('On RUTF: not entered. A child on RUTF gets no iron.');
  const syrup = ['1.00', '1.25', '2.00', '2.5'][b.i];
  const tab = b.i >= 2 ? ' or half an iron/folate tablet (60 mg elemental iron per tablet)' : '';
  return out(`Iron syrup ${syrup} mL (ferrous fumarate 100 mg/5 mL)${tab} once a day for 14 days.`, `${syrup} mL daily`);
}
