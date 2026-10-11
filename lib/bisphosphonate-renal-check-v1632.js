// spec-v1632 tool 14: zoledronic acid dose and bisphosphonate clearance cutoffs, read from each label
// through lib/label-dose.js.
//
// Four label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Zoledronic acid injection 4 mg (Heritage, DailyMed version 22), section 2: multiple myeloma and
//     bone metastases, creatinine clearance (Cockcroft-Gault) "greater than 60 mL/min is 4 mg"; Table
//     1, "50 to 60 3.5; 40 to 49 3.3; 30 to 39 3". Hypercalcemia of malignancy: 4 mg; "Dose
//     adjustments ... are not necessary ... (serum creatinine ... less than 4.5 mg/dL)"; retreatment
//     "after a minimum of 7 days".
//   Reclast (zoledronic acid 5 mg; Sandoz, version 3): "contraindicated in patients with creatinine
//     clearance less than 35 mL/min and in those with evidence of acute renal impairment"; "A 5 mg
//     dose ... is recommended for patients with creatinine clearance greater than or equal to 35";
//     clearance "based on actual body weight using Cockcroft-Gault formula before each Reclast dose".
//   Fosamax (alendronate; Organon, version 10), section 8.6: "not recommended for patients with
//     creatinine clearance less than 35 mL/min"; "No dosage adjustment is necessary ... 35-60".
//   Actonel (risedronate; version 31), section 8: "not recommended for use in patients with severe
//     renal impairment (creatinine clearance less than 30 mL/min)"; no adjustment at 30 or above.
//
// None of these labels has a line for dialysis, and the tool says so when asked. Adults only.
//
// Pure: no DOM, no network; `now` is passed in.

import { bandToolAnswer, DIALYSIS } from './label-dose.js';

const D = 'dose'; const NA = 'no-adjustment'; const NR = 'not-recommended'; const CI = 'contraindicated'; const NG = 'no-recommendation-given';
const b = (from, to, text, flag = D) => ({ from, to, text, flag });
const lt = (to, text, flag = D) => ({ from: null, to, toExclusive: true, text, flag });
const ge = (from, text, flag = NA) => ({ from, to: null, text, flag });
const CRCL = { unit: 'mL/min', measure: 'creatinine clearance' };

export const LABELS = {
  zoledronic4: { brand: 'zoledronic acid 4 mg', setId: '00a5bd5a-e5ee-4bad-b510-a4d4485485c8', ...CRCL },
  reclast: { brand: 'Reclast', setId: '5a9b3737-9ce6-4a89-b76e-6aab79eba9cf', ...CRCL },
  alendronate: { brand: 'Fosamax', setId: '14e931fd-2c5f-4d90-b7db-5980706f4a56', ...CRCL },
  risedronate: { brand: 'Actonel', setId: '24ed00e0-25e2-49a8-97fc-66c1b417dc0b', ...CRCL },
};

export const REGIMENS = [
  { value: 'zoledronic-4mg-bone', drug: 'zoledronic4', text: 'Zoledronic acid 4 mg: multiple myeloma or bone metastases', bands: [{ from: 60, fromExclusive: true, to: null, text: '4 mg, infused over no less than 15 minutes every 3 to 4 weeks', flag: D }, b(50, 60, '3.5 mg'), b(40, 49, '3.3 mg'), b(30, 39, '3 mg'), lt(30, 'no dose: the label\'s table of reduced doses stops at 30 mL/min', NG)] },
  { value: 'zoledronic-4mg-hcm', drug: 'zoledronic4', text: 'Zoledronic acid 4 mg: hypercalcemia of malignancy (by serum creatinine)', anyValue: true, bands: [{ from: null, to: null, text: '4 mg as a single dose, with no dose adjustment for mild-to-moderate renal impairment before treatment (serum creatinine less than 4.5 mg/dL); retreatment with 4 mg after a minimum of 7 days', flag: D }] },
  { value: 'reclast', drug: 'reclast', text: 'Zoledronic acid 5 mg (Reclast)', bands: [ge(35, '5 mg, with no dose adjustment at a creatinine clearance of 35 mL/min or above', D), lt(35, 'contraindicated below a creatinine clearance of 35 mL/min, and with evidence of acute renal impairment', CI)] },
  { value: 'alendronate', drug: 'alendronate', text: 'Alendronate (Fosamax)', bands: [ge(35, 'no dosage adjustment (the label states this for 35 to 60 mL/min)'), lt(35, 'not recommended below a creatinine clearance of 35 mL/min', NR)] },
  { value: 'risedronate', drug: 'risedronate', text: 'Risedronate (Actonel)', bands: [ge(30, 'no dosage adjustment at a creatinine clearance of 30 mL/min or above'), lt(30, 'not recommended below a creatinine clearance of 30 mL/min (severe renal impairment)', NR)] },
];
export { DIALYSIS };
const NOTE = 'This reports the dose or the cutoff the label gives for the values entered. It is not a recommendation and it covers adults only.';

function notesFor(reg) {
  if (reg.value === 'zoledronic-4mg-bone') return ['The label calculates the clearance with the Cockcroft-Gault formula, and says to measure serum creatinine before each dose and withhold treatment for renal deterioration.'];
  if (reg.value === 'zoledronic-4mg-hcm') return ['This row is by serum creatinine, not creatinine clearance; the label does not give a reduced dose for it.'];
  if (reg.drug === 'reclast') return ['The Reclast label calculates the clearance with Cockcroft-Gault on actual body weight, before each dose.'];
  return [];
}

export function bisphosphonateRenalCheck(input = {}, now, table) {
  return bandToolAnswer({ regimens: REGIMENS, labels: LABELS, note: NOTE, notesFor }, input, now, table);
}
