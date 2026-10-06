// spec-v1560 tool 2: the diphtheria antitoxin (DAT) dose by disease, and the antibiotic by weight (WHO 2024).
//
// Source: WHO. Clinical management of diphtheria: guideline, 2 February 2024 (IRIS 10665/375887; CC BY-NC-SA 3.0
// IGO, facts restated, nothing reproduced), read October 6, 2026. Section 6.4: a single DAT dose chosen by disease
// and time since onset: laryngitis or pharyngitis under 48 hours 20,000 IU; nasopharyngeal disease with extensive
// membrane under 48 hours 40,000 IU; any of diffuse neck swelling, disease of 48 hours or more, or severe disease
// (respiratory distress, shock) 80,000 IU; given as soon as possible; no routine sensitivity test beforehand
// (section 6.3). Section 5: a macrolide in preference to penicillin: azithromycin once a day, children 10-12
// mg/kg (maximum 500 mg a day), adults 500 mg; or erythromycin 10-15 mg/kg every 6 hours (maximum 500 mg a dose, 2
// g a day). Penicillin only where no macrolide is available and the strain is susceptible: procaine benzylpenicillin
// 50 mg/kg IM once daily (maximum 1.2 g), aqueous benzylpenicillin 25,000 IU/kg every 6 hours (maximum 4 million IU
// a day), or penicillin V 10-15 mg/kg every 6 hours (maximum 500 mg a dose).
//
// Stated rather than hidden: the DAT dose depends on the disease, not on weight or age; no vial count is printed
// because vial strengths differ by product; the guideline states no antibiotic duration and none is printed.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const SITE_OPTIONS = [
  { value: 'throat', text: 'Throat or larynx (pharyngitis, laryngitis)' },
  { value: 'nose', text: 'Nose and throat with extensive membrane' },
];
export const DURATION_OPTIONS = [{ value: 'lt48', text: 'Under 48 hours' }, { value: 'ge48', text: '48 hours or more' }];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows WHO\'s February 2024 diphtheria clinical management guideline. Your national protocol may differ; follow it.';
const r0 = (x) => Math.round(x).toLocaleString('en-US');

export function diphtheriaAntitoxinDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const site = SITE_OPTIONS.find((x) => x.value === o.site);
  if (!site) return { valid: false, message: 'Choose where the disease is: throat or larynx, or nose and throat with extensive membrane.' };
  if (!DURATION_OPTIONS.some((x) => x.value === o.duration)) return { valid: false, message: 'Choose how long since symptoms began: under 48 hours, or 48 hours or more.' };
  if (!YES_NO.some((x) => x.value === o.neck)) return { valid: false, message: 'Choose whether there is diffuse swelling of the neck.' };
  if (!YES_NO.some((x) => x.value === o.severe)) return { valid: false, message: 'Choose whether the disease is severe (breathing difficulty or shock).' };
  const why = [];
  if (o.neck === 'yes') why.push('diffuse neck swelling');
  if (o.duration === 'ge48') why.push('48 hours or more since onset');
  if (o.severe === 'yes') why.push('severe disease');
  const iu = why.length ? 80000 : site.value === 'nose' ? 40000 : 20000;
  const reason = why.length ? why.join(', ') : site.value === 'nose' ? 'nose and throat with extensive membrane, under 48 hours' : 'throat or larynx, under 48 hours';
  const notes = ['Give it as soon as possible, without waiting for culture; no routine sensitivity test first. The dose depends on the disease, not on weight or age; draw it up from the product\'s vials by their strength.'];

  let w = null;
  if (!(o.weight === undefined || o.weight === null || String(o.weight).trim() === '')) {
    const f = inputFault([['the weight', o.weight, 1, 250, 'kg']]);
    if (f) return { valid: false, message: f };
    w = Number(o.weight);
  }
  if (w === null) {
    notes.push('Antibiotic, a macrolide first: azithromycin once a day (children 10-12 mg/kg, maximum 500 mg; adults 500 mg) or erythromycin 10-15 mg/kg every 6 hours (maximum 500 mg a dose, 2 g a day). No weight was entered, so no mg dose is given.');
  } else {
    const az = w >= 50 ? '500 mg once a day (the adult dose)' : `${r0(Math.min(w * 10, 500))}-${r0(Math.min(w * 12, 500))} mg once a day (10-12 mg/kg, maximum 500 mg)`;
    const er = `${r0(Math.min(w * 10, 500))}-${r0(Math.min(w * 15, 500))} mg every 6 hours (10-15 mg/kg, maximum 500 mg a dose and 2 g a day)`;
    notes.push(`Antibiotic, a macrolide first: azithromycin ${az}, or erythromycin ${er}.`);
  }
  notes.push('Penicillin only if no macrolide is available and the strain is susceptible: procaine benzylpenicillin 50 mg/kg IM once a day (maximum 1.2 g), aqueous benzylpenicillin 25,000 IU/kg every 6 hours (maximum 4 million IU a day), or penicillin V 10-15 mg/kg every 6 hours (maximum 500 mg a dose).');
  notes.push('The guideline states no antibiotic duration; follow your national protocol.');
  return { valid: true, band: `Diphtheria antitoxin ${iu.toLocaleString('en-US')} IU, a single dose (${reason}).`, bandLabel: `${iu.toLocaleString('en-US')} IU`, abnormal: true, notes, note: NOTE };
}
