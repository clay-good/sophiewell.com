// spec-v1552 tool 4: the seasonal malaria chemoprevention (SMC) dose of sulfadoxine-pyrimethamine plus
// amodiaquine (SP+AQ) by age, and whether a contraindication stops it.
//
// Source: WHO. Seasonal malaria chemoprevention with SP+AQ in children: a field guide, 2nd ed., 2023 (IRIS
// 10665/368123; CC BY-NC-SA 3.0 IGO, facts restated, nothing reproduced), section 2.5 (p. 3) and the
// distributor steps, read October 6, 2026: 3 to under 12 months, one SP 250/12.5 mg tablet plus three AQ 75 mg
// base tablets; 12-59 months, one SP 500/25 mg tablet plus three AQ 150 mg base tablets; SP and the first AQ
// tablet on day 1, AQ on days 2 and 3; over 60 months no blister pack, so by weight: SP 25/1.25 mg/kg once
// (range 25-70/1.25-3.5) and AQ 10 mg/kg (7.5-15) daily for 3 days. Not for a child with acute fever or severe
// illness (refer), on cotrimoxazole, given SP or AQ in the previous 4 weeks (the distributor steps add an ACT
// in the previous 28 days), or allergic to SP or AQ. Vomited within 30 minutes: rest 10 minutes, then a
// replacement dose. Cycles 28 days apart, never shortened.
//
// Stated rather than hidden: the infant SP dose is a whole 250/12.5 mg tablet, as printed; the guide's
// "60 months" boundary is read as 60 months and older dosed by weight.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const CONTRA_OPTIONS = [
  { value: 'none', text: 'None' },
  { value: 'ill', text: 'Fever, acute febrile illness or severe illness' },
  { value: 'ctx', text: 'Takes cotrimoxazole' },
  { value: 'recent', text: 'SP, AQ or an ACT in the past 28 days' },
  { value: 'allergy', text: 'Allergic to SP or AQ (or a sulfa drug)' },
];
const NOTE = 'This follows WHO\'s 2023 SMC field guide. Your national program sets the ages and cycles; follow it.';
const r1 = (x) => String(Math.round(x * 10) / 10);

export function smcSpaqDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the age', o.age, 0, 180, 'months']]);
  if (f) return { valid: false, message: f };
  const contra = CONTRA_OPTIONS.find((x) => x.value === o.contra);
  if (!contra) return { valid: false, message: 'Choose whether a contraindication applies: fever or severe illness, cotrimoxazole, SP/AQ/ACT in the past 28 days, or an allergy.' };
  const m = Number(o.age);
  let w = null;
  if (!(o.weight === undefined || o.weight === null || String(o.weight).trim() === '')) {
    const fw = inputFault([['the weight', o.weight, 2, 80, 'kg']]);
    if (fw) return { valid: false, message: fw };
    w = Number(o.weight);
  }
  if (m < 3) return { valid: true, band: 'Not for infants under 3 months: SMC starts at 3 months.', bandLabel: 'Under 3 months', abnormal: false, notes: [], note: NOTE };
  if (contra.value !== 'none') {
    const why = { ill: 'a child with fever or severe illness needs referral for care (or testing and treatment), not SMC', ctx: 'a child on cotrimoxazole does not get SMC', recent: 'SP, AQ or an ACT in the past 28 days', allergy: 'an allergy to SP or AQ' }[contra.value];
    return { valid: true, band: `Do not give SMC this cycle: ${why}.`, bandLabel: 'Not this cycle', abnormal: true, notes: [], note: NOTE };
  }
  const notes = [];
  let band;
  let label;
  if (m >= 60) {
    if (w === null) return { valid: false, message: 'Enter the weight in kg: there is no blister pack at 60 months or older, so SMC is dosed by weight.' };
    band = `By weight (no blister pack at 60 months or older), ${r1(w)} kg: sulfadoxine-pyrimethamine ${Math.round(w * 25)}/${r1(w * 1.25)} mg once on day 1, and amodiaquine ${Math.round(w * 10)} mg base on days 1, 2 and 3.`;
    label = 'By weight';
    notes.push('Targets: SP 25/1.25 mg/kg (range 25-70/1.25-3.5) once; AQ 10 mg/kg (range 7.5-15) a day for 3 days.');
  } else {
    const infant = m < 12;
    band = infant
      ? 'Infant pack (3 to under 12 months): one SP 250/12.5 mg tablet and the first of three AQ 75 mg tablets on day 1, then one AQ 75 mg tablet on day 2 and on day 3.'
      : 'Child pack (12-59 months): one SP 500/25 mg tablet and the first of three AQ 150 mg tablets on day 1, then one AQ 150 mg tablet on day 2 and on day 3.';
    label = infant ? 'Infant pack' : 'Child pack';
    if (w !== null) {
      const [sp, aq] = infant ? [250, 75] : [500, 150];
      notes.push(`At ${r1(w)} kg that is sulfadoxine ${r1(sp / w)} mg/kg (target 25, range 25-70) and amodiaquine ${r1(aq / w)} mg/kg a day (target 10, range 7.5-15).`);
    } else {
      notes.push('No weight was entered, so the mg/kg check is not shown; the pack goes by age.');
    }
  }
  notes.push('Dissolve the day-1 tablets in water and watch the caregiver give them. If the child vomits within 30 minutes, let them rest 10 minutes and give a replacement dose.');
  notes.push('The next cycle is 28 days after the first dose of this one; do not shorten the interval.');
  return { valid: true, band, bandLabel: label, abnormal: false, notes, note: NOTE };
}
