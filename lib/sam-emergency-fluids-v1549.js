// spec-v1549 tool 3: rehydration, shock and low blood sugar in a child with severe acute malnutrition: the
// volumes for a weight.
//
// Source: WHO. Training course on the inpatient management of severe acute malnutrition, 2021, module 3 (initial
// management; IRIS 10665/352677; CC BY-NC-SA 3.0 IGO, facts restated, nothing reproduced), sections 3, 5 and 6,
// read October 6, 2026:
//   - Low blood sugar (below 3 mmol/L, 54 mg/dL), treated on suspicion: 50 mL of 10% glucose or sucrose by mouth,
//     under the tongue or by nasogastric tube; stuporous, unconscious or convulsing, 5 mL/kg of sterile 10%
//     glucose IV, then 50 mL by tube (not needed while IV fluids for shock run); 50% glucose diluted 1 part to 4
//     parts water; start F-75 2-hourly and recheck at 2 hours.
//   - Shock (stuporous or unconscious AND cold hands, plus slow capillary refill over 3 seconds OR a weak or fast
//     pulse): 10% glucose 5 mL/kg IV, oxygen 1-2 L/min, IV fluid 15 mL/kg over 1 hour (half-strength Darrow's
//     with 5% dextrose, else Ringer's lactate with 5% glucose, else 0.45% saline with 5% glucose); check
//     breathing and pulse every 5-10 minutes; if better, 15 mL/kg over another hour, then ReSoMal 5-10 mL/kg in
//     alternate hours with F-75 up to 10 hours; if not better after 1 hour, septic shock: maintenance 4 mL/kg/h
//     and fresh whole blood 10 mL/kg over 3 hours (packed cells in heart failure); stop the infusion if breathing
//     rises by 5 a minute or the pulse by 15, the liver enlarges, crackles, raised JVP or a gallop rhythm.
//   - Dehydration without shock: ReSoMal 5 mL/kg every 30 minutes for 2 hours, then 5-10 mL/kg/h in alternate
//     hours with F-75 for up to 10 hours, stopping at the target weight (pre-diarrhea weight, or a presumed 5%
//     loss); by cup, slowly; monitored every 30 minutes for 2 hours, then hourly. Profuse watery diarrhea or
//     cholera: standard low-osmolarity ORS, not ReSoMal.
//
// Corrected from the spec: the 2021 module stops the infusion when the pulse rises by 15 (not 25) and lists
// half-strength Darrow's first. Not built: the per-stool volumes and the temperature rows (not in this module).
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const SCENARIO_OPTIONS = [
  { value: 'dehydrated', text: 'Dehydrated, not in shock' },
  { value: 'shock', text: 'Shock' },
  { value: 'hypoglycemia', text: 'Low blood sugar' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const CONSCIOUS_OPTIONS = [
  { value: 'alert', text: 'Alert (drinking or not)' },
  { value: 'impaired', text: 'Stuporous, unconscious or convulsing' },
];

const NOTE = 'This follows WHO\'s 2021 SAM training course, module 3. Your national protocol may differ; follow it.';
const ml = (x) => `${Math.round(x).toLocaleString('en-US')} mL`;

export function samEmergencyFluids(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 1, 40, 'kg']]);
  if (f) return { valid: false, message: f };
  const sc = SCENARIO_OPTIONS.find((x) => x.value === o.scenario);
  if (!sc) return { valid: false, message: 'Choose the emergency: dehydration without shock, shock, or low blood sugar.' };
  const w = Number(o.weight);
  const notes = [];

  if (sc.value === 'hypoglycemia') {
    const c = CONSCIOUS_OPTIONS.find((x) => x.value === o.conscious);
    if (!c) return { valid: false, message: 'Choose whether the child is alert, or stuporous, unconscious or convulsing: it decides oral or IV glucose.' };
    notes.push('Treat on suspicion, without waiting for a test: it does no harm. If only 50% glucose is available, dilute 1 part in 4 parts sterile or boiled water.');
    notes.push('Start F-75 every 2 hours at once and recheck the blood glucose after 2 hours.');
    if (c.value === 'alert') {
      return { valid: true, band: 'Low blood sugar, alert: 50 mL of 10% glucose or 10% sucrose by mouth (or by nasogastric tube if alert but not drinking).', bandLabel: '50 mL by mouth', abnormal: true, notes, note: NOTE };
    }
    notes.push('If the IV dose cannot be given at once, give the tube dose first. A child on IV fluids for shock needs no tube bolus after the IV glucose.');
    return { valid: true, band: `Low blood sugar, stuporous, unconscious or convulsing: 10% glucose ${ml(w * 5)} IV (5 mL/kg), then 50 mL of 10% glucose or sucrose by nasogastric tube.`, bandLabel: `${ml(w * 5)} IV`, abnormal: true, notes, note: NOTE };
  }

  if (sc.value === 'shock') {
    notes.push('Shock in severe malnutrition means stuporous, semi-conscious or unconscious AND cold hands, plus slow capillary refill (over 3 seconds) or a weak or fast pulse. Without those, do not give IV fluid.');
    notes.push(`First give 10% glucose ${ml(w * 5)} IV (5 mL/kg) and oxygen at 1-2 L a minute; keep the child warm.`);
    notes.push('Fluid, in order of preference: half-strength Darrow\'s with 5% dextrose, Ringer\'s lactate with 5% glucose, or 0.45% saline with 5% glucose.');
    notes.push(`Check breathing and pulse every 5-10 minutes. If better: ${ml(w * 15)} over a second hour, then ReSoMal ${ml(w * 5)}-${ml(w * 10)} (5-10 mL/kg) in alternate hours with F-75 for up to 10 hours, and start F-75.`);
    notes.push(`If not better after 1 hour, treat for septic shock: maintenance IV fluid ${ml(w * 4)} an hour (4 mL/kg/h) while waiting for blood, then fresh whole blood ${ml(w * 10)} slowly over 3 hours (10 mL/kg; packed cells if in heart failure), and antibiotics.`);
    notes.push('Stop the infusion if breathing rises by 5 a minute or the pulse by 15, the liver enlarges, fine crackles appear, the neck veins fill, or a gallop rhythm develops.');
    return { valid: true, band: `Shock: IV fluid ${ml(w * 15)} over 1 hour (15 mL/kg, ${ml(w * 15)} an hour).`, bandLabel: `${ml(w * 15)} over 1 hour`, abnormal: true, notes, note: NOTE };
  }

  if (!YES_NO.some((x) => x.value === o.profuse)) return { valid: false, message: 'Choose whether there is profuse watery diarrhea or suspected cholera: then standard ORS replaces ReSoMal.' };
  if (o.profuse === 'yes') {
    notes.push('ReSoMal does not carry enough sodium to replace cholera losses.');
    return { valid: true, band: 'Profuse watery diarrhea or suspected cholera: use standard WHO low-osmolarity ORS, made up normally (not diluted), not ReSoMal.', bandLabel: 'Standard ORS, not ReSoMal', abnormal: true, notes, note: NOTE };
  }
  notes.push(`Then, if still dehydrated: ${ml(w * 5)}-${ml(w * 10)} an hour (5-10 mL/kg) in alternate hours with F-75, for up to 10 hours.`);
  notes.push('Stop at the target weight: the weight before the diarrhea, or presume a 5% loss if it is not known. Give it slowly by cup; a tube is discouraged.');
  notes.push('Check every 30 minutes for the first 2 hours, then hourly.');
  return { valid: true, band: `Dehydration without shock: ReSoMal ${ml(w * 5)} (5 mL/kg) every 30 minutes for the first 2 hours.`, bandLabel: `${ml(w * 5)} every 30 min`, abnormal: true, notes, note: NOTE };
}
