// spec-v1551 tool 2: the injectable antimalarial dose for severe malaria at a weight.
//
// Sources, read October 3, 2026 (facts restated, nothing reproduced):
//   - WHO guidelines for malaria, 10 September 2026 (doi:10.2471/B09879), section 5.2.2: parenteral
//     artesunate first line for adults, children, infants and pregnant women in all trimesters; 3 mg/kg per
//     dose under 20 kg, 2.4 mg/kg at 20 kg or more; IM artemether 3.2 mg/kg then 1.6 mg/kg daily if
//     artesunate is unavailable; quinine dihydrochloride 20 mg salt/kg loading, then 10 mg salt/kg every
//     8 hours starting 8 hours after the first dose, reduced by a third to every 12 hours if there is no
//     improvement in 48 hours; infused over 4 hours, never faster than 5 mg salt/kg an hour, never as a
//     bolus; IM only into the anterior thigh, the first dose split 10 mg/kg into each thigh, diluted to
//     60-100 mg/mL. Artesunate is diluted in about 5 mL of 5% dextrose; no other volume is given.
//   - WHO, Management of severe malaria: a practical handbook, 2012, p. 41: artesunate at admission (0 h),
//     12 h and 24 h, then once a day (the 2026 guideline does not restate the times); parenteral treatment
//     for at least 24 hours and until oral medication is tolerated.
// No mL is printed: reconstitution volumes depend on the product, and the guideline gives none.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const DRUGS = [
  { value: 'artesunate', text: 'Artesunate, IV or IM' },
  { value: 'artemether', text: 'Artemether, IM (if artesunate is not available)' },
  { value: 'quinine', text: 'Quinine dihydrochloride (if artesunate is not available)' },
];

const mg = (x) => {
  const r = x >= 100 ? Math.round(x) : Math.round(x * 10) / 10;
  return `${r.toLocaleString('en-US')} mg`;
};

export function severeMalariaInjectable(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = DRUGS.find((d) => d.value === o.drug);
  if (!drug) return { valid: false, message: 'Choose the injectable drug: artesunate is first line, artemether or quinine only if it is not available.' };
  const f = inputFault([['the weight', o.weight, 0.5, 150, 'kg']]);
  if (f) return { valid: false, message: f };
  const w = Number(o.weight);
  const notes = [];
  let band;
  let label;
  if (drug.value === 'artesunate') {
    const perKg = w < 20 ? 3 : 2.4;
    const dose = w * perKg;
    label = `${mg(dose)} per dose`;
    band = `Artesunate ${mg(dose)} per dose for ${w} kg (${perKg} mg/kg, the dose ${w < 20 ? 'under' : 'from'} 20 kg), IV or IM, at admission, 12 hours and 24 hours, then once a day.`;
    notes.push('WHO gives 3 mg/kg per dose under 20 kg and 2.4 mg/kg from 20 kg, so that small children reach the same drug exposure.');
    notes.push('Give it for at least 24 hours and until the patient can take oral medication, then a full 3-day ACT.');
    notes.push('Reconstitute freshly for each dose (artesunic acid in 5% sodium bicarbonate, then about 5 mL of 5% dextrose) and do not store it. The volume to draw up depends on the product: follow its insert.');
    notes.push('The times (0, 12 and 24 hours, then daily) are from WHO\'s 2012 severe malaria handbook, which the 2026 guideline does not restate.');
  } else if (drug.value === 'artemether') {
    label = `${mg(w * 3.2)} first dose`;
    band = `Artemether IM ${mg(w * 3.2)} as the first dose (3.2 mg/kg), then ${mg(w * 1.6)} once a day (1.6 mg/kg), into the anterior thigh.`;
    notes.push('WHO uses IM artemether only when parenteral artesunate is not available.');
    notes.push('Give parenteral treatment for at least 24 hours and until oral medication is tolerated, then a full 3-day ACT.');
  } else {
    label = `${mg(w * 20)} salt loading`;
    band = `Quinine dihydrochloride ${mg(w * 20)} salt as the loading dose (20 mg salt/kg), then ${mg(w * 10)} salt (10 mg salt/kg) every 8 hours, starting 8 hours after the first dose. All doses are salt, not base.`;
    notes.push(`Infuse each dose over 4 hours, diluted in saline or 5% dextrose, never faster than 5 mg salt/kg an hour (${mg(w * 5)} an hour here). Never give it as an IV bolus: rapid injection can cause lethal hypotension.`);
    notes.push(`If the patient has not improved by 48 hours, reduce by a third, to ${mg(w * 10)} salt every 12 hours.`);
    notes.push(`If it cannot be infused, give it IM into the anterior thigh, never the buttock: split the first dose, ${mg(w * 10)} into each thigh, diluted to 60 to 100 mg/mL.`);
    notes.push('Reduce the loading dose only on clear evidence of adequate treatment before arrival.');
  }
  return {
    valid: true,
    band,
    bandLabel: label,
    abnormal: false,
    notes,
    note: 'This follows the WHO guidelines for malaria of 10 September 2026 for severe malaria. Your national protocol may differ; follow it.',
  };
}
