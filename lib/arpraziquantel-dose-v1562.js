// spec-v1562 tool 4: arpraziquantel 150 mg dispersible tablets for preschool children with schistosomiasis
// (tablets by weight).
//
// Sources, read October 6, 2026 (facts restated):
//   - EMA. Arpraziquantel 150 mg dispersible tablets: product information (EU-M4all scientific opinion,
//     December 2023), sections 4.1-4.4: children 3 months to 6 years weighing at least 5 kg; a single dose
//     after a meal, dispersed in water (at least 10 mL for 1-5 tablets, 20 mL for 6-11). S. mansoni, target 50
//     mg/kg: 5.0-6.9 kg 2 tablets; 7.0-9.9 3; 10.0-12.9 4; 13.0-16.9 5; 17.0-22.9 7; 23.0-30.0 9. S.
//     haematobium, target 60 mg/kg: 5.0-5.9 2; 6.0-7.9 3; 8.0-10.9 4; 11.0-13.9 5; 14.0-18.9 7; 19.0-23.9 9;
//     24.0-30.0 11. Mixed infection: the S. haematobium dose is expected to work (not evaluated).
//     Contraindications: hypersensitivity; known or suspected cysticercosis; known or suspected acute
//     schistosomiasis; strong CYP inducers (rifampicin, carbamazepine, phenytoin). Caution with severe hepatic
//     insufficiency or hepatosplenic schistosomiasis.
//   - WHO. The selection and use of essential medicines, 2025: arpraziquantel 150 mg dispersible listed on the
//     children's list as a therapeutic alternative to praziquantel.
//
// Stated rather than hidden: the spec's "8 kg from 2 years" was the trial's enrollment rule, not the label;
// the label floor is 5 kg from 3 months. Bands are as printed (closed at 30.0 kg). High volatility (new
// product).
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const SPECIES_OPTIONS = [
  { value: 'mansoni', text: 'S. mansoni' },
  { value: 'haematobium', text: 'S. haematobium' },
  { value: 'mixed', text: 'Both (mixed infection)' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const MANSONI = [[5, 2], [7, 3], [10, 4], [13, 5], [17, 7], [23, 9]];
const HAEM = [[5, 2], [6, 3], [8, 4], [11, 5], [14, 7], [19, 9], [24, 11]];
const NOTE = 'This follows the EMA product information for arpraziquantel 150 mg dispersible tablets (EU-M4all, 2023), listed on the 2025 WHO children\'s essential medicines list.';

export function arpraziquantelDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sp = SPECIES_OPTIONS.find((x) => x.value === o.species);
  if (!sp) return { valid: false, message: 'Choose the species: S. mansoni, S. haematobium, or both.' };
  const f = inputFault([['the weight', o.weight, 1, 60, 'kg'], ['the age', o.age, 0, 20, 'years']]);
  if (f) return { valid: false, message: f };
  const kg = Number(o.weight);
  const years = Number(o.age);
  const notes = [];
  const out = (band, label, abnormal = false) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (years < 0.25 || kg < 5) return out('Not for a child under 3 months or under 5 kg: safety and efficacy are not established.', 'Below the label', true);
  if (years > 6 || kg > 30) return out('Outside the label (3 months to 6 years, up to 30 kg): use praziquantel for an older or heavier child.', 'Outside the label', true);
  for (const [k, why] of [['cysticercosis', 'known or suspected cysticercosis'], ['acute', 'known or suspected acute schistosomiasis'], ['inducer', 'a strong CYP inducer (rifampicin, carbamazepine, phenytoin)']]) {
    if (o[k] === 'yes') return out(`Do not give arpraziquantel: ${why} is a contraindication.`, 'Contraindicated', true);
  }
  const open = ['cysticercosis', 'acute', 'inducer'].filter((k) => o[k] !== 'yes' && o[k] !== 'no');
  if (open.length) notes.push('Contraindications not all entered: rule out cysticercosis (especially with seizures or other CNS symptoms), acute schistosomiasis and strong CYP inducers first.');
  const table = sp.value === 'mansoni' ? MANSONI : HAEM;
  let tabs = table[0][1];
  for (const [lo, n] of table) if (kg >= lo) tabs = n;
  if (sp.value === 'mixed') notes.push('Mixed infection was not evaluated; the S. haematobium dose (60 mg/kg) is expected to work.');
  notes.push(`Disperse in at least ${tabs <= 5 ? 10 : 20} mL of water, stir until uniform, and give at once by cup or syringe, after a meal, under adult supervision.`);
  notes.push('Use with caution in severe hepatic insufficiency or hepatosplenic schistosomiasis.');
  return out(`Arpraziquantel ${tabs} × 150 mg dispersible tablets (${tabs * 150} mg, target ${sp.value === 'mansoni' ? 50 : 60} mg/kg) as a single dose.`, `${tabs} tablets once`);
}
