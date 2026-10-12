// spec-v1635 tool 9: intrathecal methotrexate dose by age, as the Methotrexate Injection label states it.
//
// Source: Methotrexate Injection, USP label, Accord Healthcare, DailyMed set id dd035a9f-...,
// version 7, re-read October 11, 2026, section 2.4:
//   "Use only preservative-free Methotrexate Injection for intrathecal use. Prior to administration,
//    dilute preservative-free Methotrexate Injection to a concentration of 1 mg/mL in
//    preservative-free 0.9% Sodium Chloride Injection, USP."
//   less than 1 year: 6 mg; 1 to less than 2 years: 8 mg; 2 to less than 3 years: 10 mg;
//   3 to less than 9 years: 12 mg; greater than or equal to 9 years: 12 to 15 mg.
//   "For treatment of meningeal leukemia, intrathecal methotrexate may be given at intervals of 2 or
//    more days up to twice weekly; however, administration at intervals of less than 1 week may
//    result in increased subacute toxicity. For meningeal leukemia prophylaxis, Methotrexate
//    Injection is administered no more than once weekly. For patients with Down Syndrome, administer
//    leucovorin rescue with intrathecal Methotrexate Injection."
// The top band is a range and stays one: the label does not say where in 12 to 15 mg a patient falls.
// Older labeling read "3 years and over: 12 mg"; a protocol may still follow it.
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'Methotrexate Injection', setId: 'dd035a9f-cd40-4314-b9d8-2294b8a924e2' };
export const AGE_UNITS = [
  { value: 'months', text: 'months' },
  { value: 'years', text: 'years' },
];
// [upper age bound in months (exclusive), low mg, high mg, the label's wording]
const BANDS = [
  [12, 6, 6, 'less than 1 year'],
  [24, 8, 8, '1 to less than 2 years'],
  [36, 10, 10, '2 to less than 3 years'],
  [108, 12, 12, '3 to less than 9 years'],
  [Infinity, 12, 15, '9 years or older'],
];
const NOTE = 'The label\'s intrathecal dose for the age entered, for meningeal leukemia prophylaxis and treatment. A treatment protocol may set a different dose; this reports the label and does not choose between them.';

export function itMethotrexateAgeDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = AGE_UNITS.find((u) => u.value === String(o.ageUnit ?? '').trim());
  if (!unit) return { valid: false, message: 'Choose whether the age is in months or years.' };
  const f = inputFault([['the age', o.age, 0, unit.value === 'months' ? 1440 : 120, unit.value]]);
  if (f) return { valid: false, message: f };
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The Methotrexate Injection label figures are withheld: ${lr.why}. Read the dose from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const months = unit.value === 'months' ? Number(o.age) : Number(o.age) * 12;
  const [, lo, hi, words] = BANDS.find(([top]) => months < top - 1e-9);
  const range = lo !== hi;
  const dose = range ? `${lo} to ${hi} mg` : `${lo} mg`;
  const notes = [
    `Age ${Number(o.age)} ${unit.value}: the label's band is ${words}, ${dose}.`,
    range ? 'The label gives this band as a range and does not say where in it a patient falls; no single figure is picked here.' : null,
    `Use only preservative-free methotrexate for intrathecal use, diluted to 1 mg/mL in preservative-free 0.9% sodium chloride: ${range ? `${lo} to ${hi} mL` : `${lo} mL`} at that concentration. Formulations with benzyl alcohol can cause severe central nervous system toxicity.`,
    'Interval, treatment of meningeal leukemia: every 2 or more days, up to twice weekly; the label warns that intervals under 1 week may increase subacute toxicity.',
    'Interval, prophylaxis: no more than once weekly.',
    'Down syndrome: the label says to give leucovorin rescue with intrathecal methotrexate.',
    'Older labeling read "3 years and over: 12 mg"; this label gives 12 to 15 mg from 9 years.',
    `Label: ${lr.edition}.`,
  ].filter(Boolean);
  return {
    valid: true, flag: range ? 'range' : 'dose', labelUrl: lr.url, doseLowMg: lo, doseHighMg: hi, band: `Intrathecal methotrexate ${dose} (age ${words}), preservative-free, at 1 mg/mL.`,
    bandLabel: dose, notes, note: NOTE,
  };
}
