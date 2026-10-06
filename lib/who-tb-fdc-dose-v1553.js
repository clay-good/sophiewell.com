// spec-v1553 tool 3: first-line TB tablets by weight, from WHO's child dispersible and adult fixed-dose
// combination (FDC) tables, and the 4-month HPMZ regimen.
//
// Sources, read October 6, 2026 (CC BY-NC-SA 3.0 IGO; facts restated, nothing reproduced):
//   - WHO operational handbook on tuberculosis, Module 5: children and adolescents, 2022 (IRIS 10665/352523):
//     Table 5.3 target doses (H 10, 7-15; R 15, 10-20; Z 35, 30-40; E 20, 15-25 mg/kg); Table 5.5 dispersible
//     tablets by weight (4 to under 8 kg 1, 8 to under 12 kg 2, 12 to under 16 kg 3, 16 to under 25 kg 4 of
//     HRZ 50/75/150 and E 100 in the intensive phase and HR 50/75 in the continuation phase; 25 kg or more
//     adult doses; 7.9 kg is dosed in the 4 to under 8 kg band; dissolve in about 50 mL of water and finish
//     within 10 minutes; ethambutol for extensive disease, HIV, or high HIV or isoniazid-resistance settings);
//     Table 5.7 adult FDCs from 25 kg; Table 5.8 HPMZ doses; pyridoxine 0.5-1 mg/kg/day for children living
//     with HIV or malnourished (half a 25 mg tablet up to 25 kg).
//   - WHO consolidated operational handbook, Module 4: treatment and care, April 2025 (IRIS 10665/381095):
//     Annex 4 A4.1 adult bands (25 to under 30, 30 to under 35, 35 to under 50, 50 to under 65, 65 kg or
//     more: 2, 3, 4, 4, 5 tablets of HRZE 75/150/400/275, HRE or HR 75/150) and the loose-drug rows; section
//     4.1 HPMZ eligibility (12 years or older, over 40 kg) and exclusions (under 40 kg, severe extrapulmonary
//     TB, CD4 under 100, under 12, pregnant, breastfeeding or postpartum).
//
// Edges stated rather than hidden: the 35-to-50 and 50-to-65 kg adult bands both give 4 tablets, as printed;
// under 4 kg is below the child table and refused; for HPMZ the handbook says "more than 40 kg" but doses
// from 40 kg and excludes "less than 40 kg", so exactly 40 kg is read as eligible.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const PHASE_OPTIONS = [
  { value: 'intensive', text: 'Intensive phase (first 2 months)' },
  { value: 'continuation', text: 'Continuation phase' },
];
export const REGIMEN_OPTIONS = [
  { value: 'standard', text: 'Standard (2HRZ(E)/4HR, or the 4-month 2HRZ(E)/2HR)' },
  { value: 'hpmz', text: '4-month HPMZ (12 years or older, 40 kg or more)' },
];

const CHILD = [[4, 1], [8, 2], [12, 3], [16, 4]];
const ADULT = [[25, 2], [30, 3], [35, 4], [50, 4], [65, 5]];
const ADULT_TEXT = ['25 to under 30 kg', '30 to under 35 kg', '35 to under 50 kg', '50 to under 65 kg', '65 kg or more'];
const CHILD_TEXT = ['4 to under 8 kg', '8 to under 12 kg', '12 to under 16 kg', '16 to under 25 kg'];
// Loose tablets per adult band (Module 4 Annex 4).
const LOOSE = [['isoniazid 300 mg', [0.5, 1, 1, 1, 1.25]], ['rifampicin 300 mg', [1, 1.5, 2, 2, 2.5]], ['ethambutol 400 mg', [1.5, 2, 3, 3, 4]], ['pyrazinamide 400 mg', [2, 3, 4, 4, 5]], ['pyrazinamide 500 mg', [1.5, 2.5, 3, 3, 4]]];
const NOTE = 'This follows WHO\'s TB operational handbooks (Module 5, 2022; Module 4, April 2025). Your national protocol may differ; follow it.';
const r1 = (x) => String(Math.round(x * 10) / 10);
const idx = (bands, w) => bands.map((b) => b[0]).filter((lo) => w >= lo).length - 1;
const tabs = (n) => `${n} tablet${n === 1 ? '' : 's'}`;

export function whoTbFdcDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 1, 250, 'kg']]);
  if (f) return { valid: false, message: f };
  const phase = PHASE_OPTIONS.find((x) => x.value === o.phase);
  if (!phase) return { valid: false, message: 'Choose the phase: intensive or continuation.' };
  const regimen = REGIMEN_OPTIONS.find((x) => x.value === (o.regimen || 'standard'));
  if (!regimen) return { valid: false, message: 'Choose the regimen from the list.' };
  const w = Number(o.weight);
  const notes = [];
  if (!o.regimen) notes.push('No regimen was entered, so this is the standard regimen.');

  if (regimen.value === 'hpmz') {
    const fa = inputFault([['the age', o.age, 0, 120, 'years']]);
    if (fa) return { valid: false, message: `${fa} HPMZ is only for people 12 years or older.` };
    const age = Number(o.age);
    if (age < 12 || w < 40) {
      return { valid: true, band: `Not eligible for HPMZ: it is for people 12 years or older weighing 40 kg or more (${age < 12 ? `age ${r1(age)}` : `${r1(w)} kg`}). Use the standard regimen.`, bandLabel: 'Not eligible for HPMZ', abnormal: true, notes: [], note: NOTE };
    }
    const z = w >= 65 ? '2,000 mg' : '1,500 to 1,600 mg (depending on 400 or 500 mg tablets)';
    notes.push('Not for: CD4 under 100, severe extrapulmonary TB (meningitis, disseminated, bone and joint, abdominal), or pregnancy, breastfeeding or the postpartum period.');
    if (w === 40) notes.push('Exactly 40 kg: the handbook says "more than 40 kg" but doses from 40 kg and excludes only under 40 kg, so 40 kg is read as eligible.');
    return {
      valid: true,
      band: phase.value === 'intensive'
        ? `HPMZ intensive phase (2 months) for ${r1(w)} kg: isoniazid 300 mg, rifapentine 1,200 mg, moxifloxacin 400 mg and pyrazinamide ${z}, once a day.`
        : `HPMZ continuation phase (2 months) for ${r1(w)} kg: isoniazid 300 mg, rifapentine 1,200 mg and moxifloxacin 400 mg, once a day (no pyrazinamide).`,
      bandLabel: 'HPMZ',
      abnormal: false,
      notes,
      note: NOTE,
    };
  }

  if (w < 4) return { valid: false, message: 'WHO\'s child table starts at 4 kg. Below 4 kg, dose by mg/kg with specialist advice.' };
  if (w < 25) {
    const i = idx(CHILD, w);
    const n = CHILD[i][1];
    let band;
    if (phase.value === 'intensive') {
      band = `${r1(w)} kg (band ${CHILD_TEXT[i]}), intensive phase: ${tabs(n)} of HRZ 50/75/150 mg dispersible once a day; add ${tabs(n)} of ethambutol 100 mg dispersible if indicated.`;
      notes.push('Ethambutol is added for extensive disease, for a child living with HIV, or where HIV or isoniazid resistance is common.');
      notes.push(`Achieved: isoniazid ${r1(50 * n / w)}, rifampicin ${r1(75 * n / w)}, pyrazinamide ${r1(150 * n / w)} and ethambutol ${r1(100 * n / w)} mg/kg (WHO targets 10 (7-15), 15 (10-20), 35 (30-40), 20 (15-25)).`);
    } else {
      band = `${r1(w)} kg (band ${CHILD_TEXT[i]}), continuation phase: ${tabs(n)} of HR 50/75 mg dispersible once a day.`;
      notes.push(`Achieved: isoniazid ${r1(50 * n / w)} and rifampicin ${r1(75 * n / w)} mg/kg (WHO targets 10 (7-15) and 15 (10-20)).`);
    }
    notes.push('Dissolve the tablets in about 50 mL of water and give it all within 10 minutes; less liquid if the child cannot finish it. Re-dose by weight as the child grows.');
    notes.push('Pyridoxine 0.5 to 1 mg/kg a day for a child living with HIV or malnourished (half a 25 mg tablet up to 25 kg).');
    return { valid: true, band, bandLabel: tabs(n), abnormal: false, notes, note: NOTE };
  }

  const i = idx(ADULT, w);
  const n = ADULT[i][1];
  const band = phase.value === 'intensive'
    ? `${r1(w)} kg (band ${ADULT_TEXT[i]}), intensive phase: ${tabs(n)} of HRZE 75/150/400/275 mg once a day.`
    : `${r1(w)} kg (band ${ADULT_TEXT[i]}), continuation phase: ${tabs(n)} of HR 75/150 mg once a day.`;
  if (i === 2 || i === 3) notes.push('WHO prints 4 tablets for both the 35 to under 50 kg and the 50 to under 65 kg bands.');
  const loose = LOOSE.filter(([name]) => phase.value === 'intensive' || /isoniazid|rifampicin/.test(name)).map(([name, row]) => `${name} ${row[i]}`).join(', ');
  notes.push(`Without FDCs, loose tablets for this band: ${loose}.`);
  return { valid: true, band, bandLabel: tabs(n), abnormal: false, notes, note: NOTE };
}
