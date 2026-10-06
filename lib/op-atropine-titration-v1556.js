// spec-v1556 tool 7: organophosphorus pesticide poisoning: the next atropine bolus by dose doubling, and the
// hourly infusion once the patient is atropinized (Eddleston 2008).
//
// Source: Eddleston M, Buckley NA, Eyer P, Dawson AH. Management of acute organophosphorus pesticide
// poisoning. Lancet. 2008;371(9612):597-607, panel 2 (PMC2493390; author manuscript, facts restated). Read
// October 6, 2026: atropine 1-3 mg IV by severity; after 5 minutes check pulse, blood pressure, pupils,
// sweating and chest; if no improvement give double the dose, reviewing every 5 minutes; once parameters
// begin to improve stop doubling (similar or smaller doses can follow). Targets: heart rate over 80, systolic
// over 80 mm Hg, a clear chest (atropine will not clear focal aspiration); sweating usually stops. A fast
// heart rate is not a contraindication; pupils are not an early endpoint, but very dilated pupils suggest
// toxicity. Once stable, infuse about 10-20% of the total stabilizing dose every hour; too much gives
// agitation, fever, absent bowel sounds and urinary retention (stop for 30-60 minutes, restart lower).
// Fluids for systolic over 80 and urine over 0.5 mL/kg/h. Pralidoxime chloride 2 g IV over 20-30 minutes,
// then 0.5-1 g an hour.
//
// Stated rather than hidden: adults only (the protocol is adult); WHO's weight-based pralidoxime regimen was
// not read in a WHO source and is not printed.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const CHEST_OPTIONS = [{ value: 'clear', text: 'Clear' }, { value: 'wet', text: 'Crackles or wheeze' }];
export const PUPIL_OPTIONS = [{ value: 'normal', text: 'Not very dilated' }, { value: 'wide', text: 'Very dilated' }];

const NOTE = 'This follows Eddleston et al., Lancet 2008, panel 2 (an adult protocol). Review every 5 minutes while loading.';
const mg = (x) => `${Math.round(x * 10) / 10} mg`;

export function opAtropineTitration(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (o.adult !== 'yes' && o.adult !== 'no') return { valid: false, message: 'Choose whether the patient is an adult: this dose-doubling protocol is for adults.' };
  if (o.adult === 'no') return { valid: false, message: 'This dose-doubling protocol is for adults only; use a pediatric protocol for a child.' };
  const f = inputFault([['the last atropine bolus', o.last, 0.5, 100, 'mg'], ['the total atropine given so far', o.total, 0.5, 2000, 'mg'], ['the heart rate', o.hr, 20, 250, 'beats/min'], ['the systolic blood pressure', o.sbp, 30, 250, 'mm Hg']]);
  if (f) return { valid: false, message: f };
  const last = Number(o.last);
  const total = Number(o.total);
  if (total < last) return { valid: false, message: 'Enter a total that includes the last bolus: it cannot be smaller than it.' };
  if (o.chest !== 'clear' && o.chest !== 'wet') return { valid: false, message: 'Choose the chest: clear, or crackles or wheeze.' };
  const hr = Number(o.hr);
  const sbp = Number(o.sbp);
  const met = { hr: hr > 80, sbp: sbp > 80, chest: o.chest === 'clear' };
  const missing = [met.hr ? null : 'heart rate over 80', met.sbp ? null : 'systolic over 80 mm Hg', met.chest ? null : 'a clear chest'].filter(Boolean);
  const notes = ['Pralidoxime chloride 2 g IV over 20-30 minutes into a second line, then 0.5-1 g an hour.', 'Fluids to keep the systolic over 80 mm Hg and urine over 0.5 mL/kg an hour.'];
  if (hr > 120) notes.push('A fast heart rate is not a reason to stop atropine: it has many causes.');
  if (o.pupils === 'wide') notes.push('Very dilated pupils suggest too much atropine.');
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });

  if (!missing.length) {
    notes.unshift('Too much shows as agitation, fever, absent bowel sounds and urinary retention: stop the infusion for 30-60 minutes and restart lower. Too little lets cholinergic signs return.');
    return out(`Atropinized (heart rate ${hr}, systolic ${sbp}, chest clear). Start an infusion of ${mg(0.1 * total)}-${mg(0.2 * total)} an hour (10-20% of the ${mg(total)} total) and check often.`, 'Start infusion', false);
  }
  if (o.improving === 'yes') return out(`Improving but not at target (${missing.join(', ')}): stop doubling; give a similar or smaller bolus (up to ${mg(last)}) and review in 5 minutes.`, 'Stop doubling', true);
  if (o.improving !== 'no') return { valid: false, message: 'Choose whether the pulse, pressure, chest and sweating have begun to improve since the last bolus: it decides whether to double.' };
  return out(`Not improving and not at target (${missing.join(', ')}): give ${mg(2 * last)} IV now (double the last ${mg(last)}), then review in 5 minutes. The total will be ${mg(total + 2 * last)}.`, `Give ${mg(2 * last)}`, true);
}
