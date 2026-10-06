// spec-v1552 tool 1: the single low dose of primaquine given with an ACT to cut falciparum transmission, and
// whether it is indicated here.
//
// Source: WHO guidelines for malaria, 10 September 2026 (doi:10.2471/B09879; CC BY-NC-SA 3.0 IGO, facts
// restated, nothing reproduced), section 5.2.1.3 (2026 recommendation), read October 6, 2026: in
// low-transmission areas, a single 0.25 mg/kg base dose on the first day with the ACT, without G6PD testing,
// except in pregnancy, infants under 1 month and women breastfeeding infants under 1 month; not recommended in
// moderate to high transmission. Dosing table for 7.5 mg base tablets: 5 to under 25 kg 3.75 mg, 25 to under
// 50 kg 7.5 mg, 50 to 100 kg 15 mg; dosing under 10 kg is limited by tablet sizes.
//
// Stated rather than hidden: under 5 kg and over 100 kg are outside WHO's table and refused; there is no WHO
// age-band table and none is built.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
const NOTE = 'This follows the WHO guidelines for malaria of 10 September 2026, a living guideline. Your national protocol may differ; follow it.';
const ask = (v) => !YES_NO.some((x) => x.value === v);

export function primaquineSingleLowDose(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 0.5, 250, 'kg']]);
  if (f) return { valid: false, message: f };
  if (ask(o.lowTransmission)) return { valid: false, message: 'Choose whether this is a low-transmission area: single low-dose primaquine is only for those.' };
  if (ask(o.pregnant)) return { valid: false, message: 'Choose whether the patient is pregnant.' };
  if (ask(o.infant)) return { valid: false, message: 'Choose whether the patient is an infant under 1 month.' };
  if (ask(o.breastfeeding)) return { valid: false, message: 'Choose whether the patient is breastfeeding an infant under 1 month.' };
  const w = Number(o.weight);
  if (o.lowTransmission === 'no') {
    return { valid: true, band: 'Not recommended: single low-dose primaquine is not recommended in moderate to high transmission areas, including areas with antimalarial resistance.', bandLabel: 'Not recommended', abnormal: false, notes: [], note: NOTE };
  }
  const excl = [];
  if (o.pregnant === 'yes') excl.push('pregnancy');
  if (o.infant === 'yes') excl.push('an infant under 1 month');
  if (o.breastfeeding === 'yes') excl.push('breastfeeding an infant under 1 month');
  if (excl.length) return { valid: true, band: `Do not give primaquine: ${excl.join(', ')}.`, bandLabel: 'Excluded', abnormal: true, notes: [], note: NOTE };
  if (w < 5 || w > 100) return { valid: false, message: `${w} kg is outside WHO's primaquine table, which runs from 5 to 100 kg. Follow your national protocol.` };
  const [mg, tabs] = w < 25 ? [3.75, 'half a 7.5 mg tablet'] : w < 50 ? [7.5, 'one 7.5 mg tablet'] : [15, 'two 7.5 mg tablets'];
  const notes = [`That is ${Math.round(mg / w * 100) / 100} mg/kg; WHO's target is 0.25 mg/kg.`];
  if (w < 10) notes.push('WHO notes that dosing under 10 kg is limited by the tablet sizes available.');
  notes.push('No G6PD test is needed for this single low dose.');
  return { valid: true, band: `Primaquine ${mg} mg base, ${tabs}, once on the first day with the ACT (${w} kg).`, bandLabel: `${mg} mg once`, abnormal: false, notes, note: NOTE };
}
