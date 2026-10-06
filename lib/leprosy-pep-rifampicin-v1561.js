// spec-v1561 tool 2: single-dose rifampicin (SDR) for contacts of leprosy patients (WHO 2018).
//
// Source: WHO SEARO. Guidelines for the diagnosis, treatment and prevention of leprosy, 2018 (IRIS 10665/274127;
// CC BY-NC-SA 3.0 IGO, facts restated, nothing reproduced), section 3.1 and Table 5 (p. 21), read October 6, 2026:
// SDR for contacts, adults and children 2 years and older, after excluding leprosy and TB disease and with no other
// contraindication, where programs can manage contacts and the index case consents to disclosure. 15 years and
// above 600 mg; 10-14 years 450 mg; children 6-9 years weighing 20 kg or more 300 mg; children under 20 kg (2 years
// or older) 10-15 mg/kg.
//
// Stated rather than hidden: a child under 20 kg takes the weight row whatever the age; a child under 6 years
// weighing 20 kg or more fits no row of the table and is refused.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

const NOTE = 'This follows WHO\'s 2018 leprosy guidelines (Table 5). Your national program may differ; follow it.';

export function leprosyPepRifampicin(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the age', o.age, 0, 120, 'years'], ['the weight', o.weight, 2, 250, 'kg']]);
  if (f) return { valid: false, message: f };
  const age = Number(o.age);
  const w = Number(o.weight);
  const notes = ['First exclude leprosy and TB disease in the contact; give it only with no other contraindication, where the program can manage contacts and the index patient agrees to disclosure.'];
  if (age < 2) return { valid: true, band: 'Not given under 2 years of age.', bandLabel: 'Under 2 years', abnormal: false, notes: [], note: NOTE };
  let band;
  let label;
  if (w < 20 && age < 15) {
    const lo = Math.round(w * 10);
    const hi = Math.round(w * 15);
    band = `Rifampicin ${lo}-${hi} mg once (10-15 mg/kg; under 20 kg, the weight row applies at any age from 2 years).`;
    label = `${lo}-${hi} mg once`;
  } else if (age >= 15) {
    band = 'Rifampicin 600 mg once (15 years and above).';
    label = '600 mg once';
  } else if (age >= 10) {
    band = 'Rifampicin 450 mg once (10-14 years).';
    label = '450 mg once';
  } else if (age >= 6) {
    band = 'Rifampicin 300 mg once (6-9 years, 20 kg or more).';
    label = '300 mg once';
  } else {
    return { valid: false, message: 'WHO\'s table has no row for a child under 6 years weighing 20 kg or more. Follow your national program.' };
  }
  return { valid: true, band, bandLabel: label, abnormal: false, notes, note: NOTE };
}
