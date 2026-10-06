// spec-v1556 tool 4: spider bite severity and antivenom in Brazil (Phoneutria, Loxosceles, Latrodectus).
//
// Source: Brasil, Ministério da Saúde. Guia de Vigilância em Saúde, 6th ed. revised, vol. 3, 2024 (CC
// BY-NC-SA 4.0, facts restated; owner decision D3), "Araneísmo" and Quadro 4 (p. 1141, adapted from FUNASA
// 2001). Read October 6, 2026:
//   - Phoneutria (armed spider): mild, local pain, swelling, redness, sweating, no antivenom; moderate,
//     intense local pain, sweating, occasional vomiting, agitation, high blood pressure, 2-4 vials of SAAr;
//     severe, profuse sweating, drooling, profuse vomiting, priapism, shock, acute pulmonary edema, 5-10.
//   - Loxosceles (brown spider): mild, spider identified, nonspecific lesion, no systemic signs, no
//     antivenom; moderate, suggestive or typical lesion with nonspecific systemic signs (rash, fever), no
//     hemolysis, 5 vials of SALox (or SAAr); severe, typical lesion with hemolysis, 10. Moderate and severe
//     also get prednisone, adults 40 mg a day, children 1 mg/kg a day, for 5 days.
//   - Latrodectus (widow spider): supportive treatment and observation for at least 24 hours.
//
// Stated rather than hidden: the Latrodectus drug doses are not printed (the child calcium gluconate dose
// reads as a unit error; it waits for the 2001 primary). A sign left blank is not assessed.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const SPIDER_OPTIONS = [
  { value: 'phoneutria', text: 'Phoneutria (armed spider, armadeira)' },
  { value: 'loxosceles', text: 'Loxosceles (brown spider, aranha-marrom)' },
  { value: 'latrodectus', text: 'Latrodectus (widow spider, viúva-negra)' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const AGE_OPTIONS = [{ value: 'adult', text: 'Adult' }, { value: 'child', text: 'Child' }];

const NOTE = 'This follows Brazil\'s Guia de Vigilância em Saúde (2024), Quadro 4. Vial counts are for Brazilian public antivenoms only.';
const k = (v) => v === 'yes' || v === 'no';

export function brazilSpiderAntivenom(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sp = SPIDER_OPTIONS.find((x) => x.value === o.spider);
  if (!sp) return { valid: false, message: 'Choose the spider: Phoneutria, Loxosceles or Latrodectus.' };
  const notes = [];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (sp.value === 'latrodectus') return out('Latrodectus (widow spider): supportive treatment, and observe for at least 24 hours.', 'Supportive, 24 h', true);
  if (![o.moderate, o.severe].some(k)) return { valid: false, message: 'Choose whether the moderate and severe signs are present.' };

  if (sp.value === 'phoneutria') {
    if (o.severe === 'yes') return out('Severe Phoneutria bite: 5 to 10 vials of SAAr, with intensive support.', 'Severe: 5-10 vials', true);
    if (o.moderate === 'yes') {
      if (!k(o.severe)) notes.push('Severe signs: not assessed. Any would make this severe (5 to 10 vials).');
      return out(`${k(o.severe) ? 'Moderate' : 'At least moderate'} Phoneutria bite: 2 to 4 vials of SAAr.`, `${k(o.severe) ? 'Moderate' : 'At least moderate'}: 2-4 vials`, true);
    }
    if (!k(o.moderate) || !k(o.severe)) return out('Not decided: moderate or severe signs not fully assessed.', 'Not decided', false);
    notes.push('Relieve the pain with local or regional lidocaine 2% without vasoconstrictor.');
    return out('Mild Phoneutria bite: no antivenom; treat the pain.', 'Mild: no antivenom', false);
  }

  // Loxosceles.
  const pred = () => {
    const age = AGE_OPTIONS.find((x) => x.value === o.ageGroup);
    if (age?.value === 'adult') notes.push('Prednisone 40 mg a day for 5 days.');
    else if (age?.value === 'child') {
      const f = inputFault([['the weight', o.weight, 2, 150, 'kg']]);
      notes.push(f ? 'Prednisone 1 mg/kg a day for 5 days (weight: not entered, so no mg dose).' : `Prednisone ${Math.round(Number(o.weight))} mg a day (1 mg/kg) for 5 days.`);
    } else notes.push('Prednisone for 5 days: adults 40 mg a day, children 1 mg/kg a day (age group: not entered).');
  };
  if (o.severe === 'yes') { pred(); return out('Severe Loxosceles bite (typical lesion with hemolysis): 10 vials of SALox (or SAAr), plus prednisone.', 'Severe: 10 vials', true); }
  if (o.moderate === 'yes') {
    pred();
    if (!k(o.severe)) notes.push('Hemolysis: not assessed. With it the bite is severe (10 vials).');
    return out(`${k(o.severe) ? 'Moderate' : 'At least moderate'} Loxosceles bite (suggestive or typical lesion, nonspecific systemic signs, no hemolysis): 5 vials of SALox (or SAAr), plus prednisone.`, `${k(o.severe) ? 'Moderate' : 'At least moderate'}: 5 vials`, true);
  }
  if (!k(o.moderate) || !k(o.severe)) return out('Not decided: moderate or severe signs not fully assessed.', 'Not decided', false);
  return out('Mild Loxosceles bite (nonspecific lesion, no systemic signs): no antivenom. Follow the lesion.', 'Mild: no antivenom', false);
}
