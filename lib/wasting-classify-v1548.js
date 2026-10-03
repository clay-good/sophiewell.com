// spec-v1548 tool 2: severe or moderate acute malnutrition in a child 6 to 59 months, by MUAC, WHZ and edema.
//
// Source: WHO, Guideline on the prevention and management of wasting and nutritional oedema (acute
// malnutrition) in infants and children under 5 years, 2023 (IRIS 10665/376075; CC BY-NC-SA 3.0 IGO, so
// facts only, nothing reproduced). Read October 3, 2026, section 1, pp. 6-7:
//   - Severe acute malnutrition: nutritional edema, and/or WHZ (or WLZ) below -3, and/or MUAC below 115 mm.
//   - Moderate acute malnutrition: WHZ from -3 to below -2, and/or MUAC from 115 to below 125 mm, and no
//     edema. (Wasting is the same split without edema.)
// MUAC tape colors (UNICEF tape specification, 2020): red below 115 mm, yellow 115 to below 125, green 125
// or more. The tape prints 11.5 at the red/yellow join; the WHO definition decides 115 exactly is yellow.
// The 2014 IMCI chart booklet uses the same cutoffs and then splits severe acute malnutrition into
// complicated and uncomplicated by medical complications and an appetite test. This tool classifies by
// measurement only; where to treat is a separate decision (spec-v1548 tool 3, spec-v1564 D1).
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const EDEMA = [
  { value: 'none', text: 'None' },
  { value: '+', text: '+ (both feet)' },
  { value: '++', text: '++ (both feet, plus lower legs, hands or lower arms)' },
  { value: '+++', text: '+++ (generalized, including the face)' },
];
export const MUAC_UNITS = [{ value: 'mm', text: 'mm' }, { value: 'cm', text: 'cm' }];

const tape = (mm) => (mm < 115 ? 'red' : mm < 125 ? 'yellow' : 'green');

export function wastingClassify(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const af = inputFault([['the age in months', o.ageMonths, 0, 600, 'months']]);
  if (af) return { valid: false, message: af };
  const age = Number(o.ageMonths);
  if (age < 6) return { valid: false, message: 'These definitions are for children 6 to 59 months. Under 6 months, WHO 2023 assesses infants at risk of poor growth by other criteria.' };
  if (age >= 60) return { valid: false, message: 'These definitions are for children 6 to 59 months.' };
  const edema = EDEMA.find((e) => e.value === o.edema);
  if (!edema) return { valid: false, message: 'Check for edema of both feet and choose none or its grade: edema alone is severe acute malnutrition, so it is never assumed absent.' };

  let mm = null;
  if (String(o.muac ?? '').trim()) {
    const unit = o.muacUnit === 'cm' ? 'cm' : 'mm';
    const f = inputFault([['the MUAC', o.muac, unit === 'cm' ? 8 : 80, unit === 'cm' ? 25 : 250, unit]]);
    if (f) return { valid: false, message: f };
    mm = unit === 'cm' ? Math.round(Number(o.muac) * 100) / 10 : Number(o.muac);
  }
  let whz = null;
  if (String(o.whz ?? '').trim()) {
    const f = inputFault([['the weight-for-height (or weight-for-length) z-score', o.whz, -6, 5, '']]);
    if (f) return { valid: false, message: f };
    whz = Number(o.whz);
  }
  if (mm === null && whz === null && edema.value === 'none') {
    return { valid: false, message: 'Enter the MUAC or the weight-for-height z-score (or both): with no edema, one of them is needed.' };
  }

  const severeBy = [];
  const moderateBy = [];
  if (edema.value !== 'none') severeBy.push(`edema of both feet (${edema.value})`);
  if (whz !== null) { if (whz < -3) severeBy.push(`WHZ ${whz} (below −3)`); else if (whz < -2) moderateBy.push(`WHZ ${whz} (−3 to below −2)`); }
  if (mm !== null) { if (mm < 115) severeBy.push(`MUAC ${mm} mm (below 115)`); else if (mm < 125) moderateBy.push(`MUAC ${mm} mm (115 to below 125)`); }

  const notes = [];
  if (mm !== null) notes.push(`MUAC ${mm} mm is in the ${tape(mm)} band of the tape (red below 115 mm, yellow 115 to below 125, green 125 or more).`);
  if (mm === null && edema.value === 'none') notes.push('MUAC was not measured; the weight-for-height z-score alone was used.');
  if (whz === null && edema.value === 'none') notes.push('The weight-for-height z-score was not measured; MUAC alone was used.');
  if (mm !== null && whz !== null && (mm < 125) !== (whz < -2)) notes.push('MUAC and weight-for-height disagree. WHO counts either one, so the worse decides; both are shown.');

  let band;
  let label;
  if (severeBy.length) {
    label = 'Severe acute malnutrition';
    band = `Severe acute malnutrition, by ${severeBy.join('; ')}.`;
    notes.push('The 2014 IMCI chart uses the same cutoffs and then splits this into complicated or uncomplicated by medical complications and an appetite test, which this tool does not assess.');
  } else if (moderateBy.length) {
    label = 'Moderate acute malnutrition';
    band = `Moderate acute malnutrition (moderate wasting), by ${moderateBy.join('; ')}, with no edema.`;
  } else {
    label = 'No acute malnutrition';
    const measured = [whz !== null ? `WHZ ${whz} (−2 or more)` : null, mm !== null ? `MUAC ${mm} mm (125 or more)` : null].filter(Boolean).join(' and ');
    band = `No acute malnutrition by these measures: ${measured}, with no edema.`;
  }
  return {
    valid: true,
    classification: label,
    band,
    bandLabel: label,
    abnormal: label !== 'No acute malnutrition',
    notes,
    note: 'This follows the WHO 2023 wasting guideline. It classifies by measurement; it does not decide where to treat. Your national protocol may differ; follow it.',
  };
}
