// spec-v1635 tool 5: dexrazoxane dose from the doxorubicin dose, as the label states it.
//
// Source: Dexrazoxane for Injection label, Eugia US, DailyMed set id cb72203a-..., version 2, re-read
// October 11, 2026:
//   1    indicated in women with metastatic breast cancer "who have received a cumulative doxorubicin
//        dose of 300 mg/m2 and who will continue to receive doxorubicin therapy"; "Do not use with
//        the initiation of doxorubicin therapy".
//   2.1  "The recommended dosage ratio of dexrazoxane for injection to doxorubicin is 10:1 (e.g., 500
//        mg/m2 dexrazoxane for injection to 50 mg/m2 doxorubicin). Do not administer doxorubicin
//        before dexrazoxane for injection. Administer doxorubicin within 30 minutes after the
//        completion of dexrazoxane for injection infusion."
//   2.2  creatinine clearance less than 40 mL/min: reduce by 50% (ratio 5:1, such as 250 mg/m2 to
//        50 mg/m2).
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'Dexrazoxane for Injection', setId: 'cb72203a-0b09-42d5-bf51-7f479feb3adb' };
export const UNITS = [{ value: 'mg-m2', text: 'mg/m²' }, { value: 'mg', text: 'mg' }];
const NOTE = 'The label\'s ratio applied to the doxorubicin dose entered. It does not check the doxorubicin dose, and the indication on this label is narrow (cardiomyopathy reduction after a cumulative 300 mg/m² of doxorubicin in metastatic breast cancer); the extravasation product is a different label with a different dose.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');

export function dexrazoxaneRatioDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = UNITS.find((u) => u.value === String(o.unit ?? '').trim());
  const f = inputFault([['the doxorubicin dose', o.doxorubicinDose, null, 1000, '']]);
  if (f) return { valid: false, message: f };
  if (!unit) return { valid: false, message: 'Choose the unit of the doxorubicin dose: mg/m² or mg. The dexrazoxane dose comes out in the same unit.' };
  const cf = inputFault([['the creatinine clearance', o.crcl, 0, 300, 'mL/min']]);
  if (cf) return { valid: false, message: `${cf} The ratio is 5:1 below 40 mL/min and 10:1 otherwise, so it is not assumed.` };
  let cumulative = null;
  if (!blank(o.cumulativeDoxorubicin)) {
    const xf = inputFault([['the cumulative doxorubicin dose to date', o.cumulativeDoxorubicin, 0, 2000, 'mg/m²']]);
    if (xf) return { valid: false, message: xf };
    cumulative = Number(o.cumulativeDoxorubicin);
  }
  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The dexrazoxane label figures are withheld: ${lr.why}. Read the ratio from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };
  const reduced = Number(o.crcl) < 40; const ratio = reduced ? 5 : 10;
  const dose = ratio * Number(o.doxorubicinDose);
  const notes = [`${ratio}:1 × doxorubicin ${Number(o.doxorubicinDose)} ${unit.text} = ${n1(dose)} ${unit.text}.${reduced ? ` Creatinine clearance ${Number(o.crcl)} mL/min is below 40, so the label halves the dose (5:1).` : ` Creatinine clearance ${Number(o.crcl)} mL/min is 40 or more, so the ratio is 10:1.`}`,
    'Timing on the label: do not give doxorubicin before dexrazoxane; give doxorubicin within 30 minutes after the dexrazoxane infusion is complete.'];
  const early = cumulative !== null && cumulative < 300;
  if (early) notes.push(`Cumulative doxorubicin ${cumulative} mg/m² is below 300 mg/m²: the labeled indication starts after a cumulative 300 mg/m², and the label says not to use it with the initiation of doxorubicin therapy.`);
  else if (cumulative === null) notes.push('The labeled indication starts after a cumulative doxorubicin dose of 300 mg/m²; the cumulative dose was not entered.');
  notes.push(`Label: ${lr.edition}.`);
  return { valid: true, flag: early ? 'below-indication' : reduced ? 'renal-ratio' : 'ratio', abnormal: early, labelUrl: lr.url, ratio, dose: Number(dose.toFixed(1)), band: `Dexrazoxane ${n1(dose)} ${unit.text} (${ratio}:1 to doxorubicin ${Number(o.doxorubicinDose)} ${unit.text}).${early ? ' The cumulative doxorubicin dose is below the label\'s 300 mg/m².' : ''}`, bandLabel: `${n1(dose)} ${unit.text}`, notes, note: NOTE };
}
