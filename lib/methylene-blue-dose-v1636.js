// spec-v1636 backfill 3: the labeled methylene blue dose, shown beside the methemoglobin reading.
//
// Source, DailyMed label re-read October 12, 2026: PROVAYBLUE, American Regent (set 4f6848e5-...,
// version 28).
//   2.1: "Administer PROVAYBLUE 1 mg/kg intravenously over 5-30 minutes. If the methemoglobin level
//     remains greater than 30% or if clinical signs and symptoms persist, a repeat dose of
//     PROVAYBLUE 1 mg/kg may be given one hour after the first dose. If methemoglobinemia does not
//     resolve after 2 doses of PROVAYBLUE, consider initiating alternative interventions".
//   2.2: "in patients with moderate or severe renal impairment (eGFR 15-59 mL/min/1.73 m2) is a
//     single dose of 1 mg/kg."  8.6: "No dose adjustment is recommended in patients with mild renal
//     impairment (eGFR 60 - 89 mL/min/1.73 m2)."  The label states nothing below 15.
//   2.3: "may be diluted before use in a solution of 50 mL 5% Dextrose Injection ... Avoid diluting
//     with sodium chloride solutions".  3: 5 mg/mL (50 mg/10 mL and 10 mg/2 mL).
//   4: contraindicated in glucose-6-phosphate dehydrogenase deficiency.
//
// Kidney function not entered: both the 2.1 and the 2.2 statements are shown and neither is chosen.
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'PROVAYBLUE', setId: '4f6848e5-35ed-4046-b13c-3032b5ba3232' };
export const KIDNEY = [
  { value: '', text: 'Not entered' },
  { value: 'egfr-60-or-above', text: 'eGFR 60 mL/min/1.73 m² or above' },
  { value: 'egfr-15-to-59', text: 'eGFR 15 to 59 mL/min/1.73 m²' },
  { value: 'egfr-under-15', text: 'eGFR under 15 mL/min/1.73 m²' },
];
const r1 = (n) => Math.round(n * 10) / 10;
const REPEAT = 'If the level stays above 30% or signs and symptoms persist, the label allows one repeat of 1 mg/kg one hour after the first dose; if it has not resolved after 2 doses, the label says to consider alternative interventions.';
const SINGLE = 'At an eGFR of 15 to 59 mL/min/1.73 m² the label gives a single dose of 1 mg/kg; if the level stays above 30% or symptoms persist 1 hour after it, the label says to consider alternative interventions.';

export function methyleneBlueDose(input, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const fault = inputFault([['the weight', o.weight, 0.4, 300, 'kg']]);
  if (fault) return { valid: false, message: fault };
  const kidney = o.kidney === undefined || o.kidney === null ? '' : String(o.kidney);
  if (!KIDNEY.some((k) => k.value === kidney)) return { valid: false, message: 'Choose the kidney function from the list, or leave it not entered.' };
  const row = labelRow(LABEL.setId, now, table);
  if (!row.answers) return { valid: true, flag: 'withheld', doseNote: `No methylene blue dose is shown. ${row.why}` };
  if (o.g6pd === true) {
    return { valid: true, flag: 'contraindicated', doseNote: 'No methylene blue dose is shown: the PROVAYBLUE label contraindicates it in G6PD deficiency, because of the risk of hemolytic anemia.' };
  }
  if (kidney === 'egfr-under-15') {
    return { valid: true, flag: 'label-states-none', doseNote: 'No methylene blue dose is shown: the PROVAYBLUE label gives its kidney dosing for an eGFR of 15 to 59 mL/min/1.73 m² and states nothing below 15.' };
  }
  const mg = r1(Number(o.weight));
  const ml = r1(mg / 5);
  const after = kidney === 'egfr-15-to-59' ? SINGLE : kidney === 'egfr-60-or-above' ? REPEAT : `Kidney function was not entered, and the label differs by it. ${SINGLE} Otherwise: ${REPEAT.charAt(0).toLowerCase()}${REPEAT.slice(1)}`;
  return {
    valid: true, flag: kidney === '' ? 'kidney-not-entered' : 'dose', doseMg: mg, doseMl: ml,
    doseNote: `The PROVAYBLUE label dose: 1 mg/kg intravenously over 5 to 30 minutes, which at ${Number(o.weight)} kg is ${mg} mg (${ml} mL of 5 mg/mL). ${after} The label allows dilution in 50 mL of 5% dextrose and says to avoid sodium chloride solutions. This is the label's arithmetic, not a decision to give it.`,
  };
}
