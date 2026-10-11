// spec-v1632 tool 10: the dofetilide initiation algorithm on the Tikosyn label.
//
// Tikosyn (dofetilide; Pfizer, DailyMed version 30), Dosage and Administration, "Instructions for
// Individualized Dose Initiation", a label row (spec-v1628 section 1), re-read on October 11, 2026:
//   Step 1: "If the QTc or QT is greater than 440 msec (500 msec in patients with ventricular
//     conduction abnormalities), TIKOSYN is contraindicated. If heart rate is less than 60 beats per
//     minute, QT interval should be used ... Patients with heart rates <50 beats per minute have not
//     been studied."
//   Step 2: creatinine clearance by Cockcroft-Gault with actual body weight.
//   Step 3: ">60 mL/min 500 mcg twice daily; 40 to 60 mL/min 250 mcg twice daily; 20 to <40 mL/min
//     125 mcg twice daily; <20 mL/min Tikosyn is contraindicated".
//   Step 5: 2 to 3 hours after the first dose, "If the QTc or QT has increased by greater than 15%
//     compared to the baseline ... OR if the QTc or QT is greater than 500 msec (550 msec in patients
//     with ventricular conduction abnormalities)", step down: 500 to 250 mcg twice daily; 250 to
//     125 mcg twice daily; 125 mcg twice daily to 125 mcg once a day.
//   Step 6: "No further down titration ... is recommended. NOTE: If at any time after the second dose
//     ... the QTc or QT is greater than 500 msec (550 msec ...), Tikosyn should be discontinued."
//
// The tool walks the label's steps with the values entered and reports the step reached. It does not
// start, adjust or stop the drug.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { findBands } from './label-dose.js';

export const LABEL = { setId: '02438044-d6a3-49e9-a1ac-3aad21ef2c8c' };
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
// Step 3. dose in mcg twice daily; 0 is the label's contraindication.
export const STARTING = [
  { from: 60, fromExclusive: true, to: null, dose: 500 },
  { from: 40, to: 60, dose: 250 },
  { from: 20, to: 40, toExclusive: true, dose: 125 },
  { from: null, to: 20, toExclusive: true, dose: 0 },
];
// Step 5: the adjusted regimen for each starting dose.
export const STEP_DOWN = { 500: '250 mcg twice daily', 250: '125 mcg twice daily', 125: '125 mcg once a day' };
const NOTE = 'The label requires initiation with continuous ECG monitoring for at least three days. This walks its algorithm with the values entered; it does not start, adjust or stop the drug. Patients with heart rates below 50 beats per minute were not studied.';

const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const sig = (x) => Number(Number(x).toPrecision(3));

export function dofetilideDoseAlgorithm(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const conduction = String(o.conduction ?? '').trim();
  if (conduction !== 'no' && conduction !== 'yes') return { valid: false, message: 'Say whether there is a ventricular conduction abnormality: the label\'s QT limits are 500 and 550 msec with one, 440 and 500 without.' };
  const f = inputFault([['the baseline QTc or QT', o.baselineQt, 200, 800, 'msec'], ['the creatinine clearance', o.crcl, 0, 250, 'mL/min']]);
  if (f) return { valid: false, message: f };
  const opt = [];
  if (!blank(o.firstDoseQt)) opt.push(['the QTc or QT after the first dose', o.firstDoseQt, 200, 800, 'msec']);
  if (!blank(o.laterQt)) opt.push(['the QTc or QT after a later dose', o.laterQt, 200, 800, 'msec']);
  const of = opt.length ? inputFault(opt) : null;
  if (of) return { valid: false, message: of };
  const row = labelRow(LABEL.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, band: 'The Tikosyn label\'s algorithm is withheld, so no step is worked out.', bandLabel: 'Withheld', notes: [`The Tikosyn label algorithm is withheld: ${row.why}.`, 'Work the steps from the label in hand.'], note: NOTE };
  }
  const base = Number(o.baselineQt); const crcl = Number(o.crcl);
  const baseLimit = conduction === 'yes' ? 500 : 440; const doseLimit = conduction === 'yes' ? 550 : 500;
  const tail = [`The label uses the QT interval, not the QTc, when the heart rate is below 60 beats per minute, and Cockcroft-Gault with actual body weight for the clearance.`, `Label: ${row.edition}.`];
  const stop = (step, band, notes) => ({ valid: true, step, flag: 'contraindicated', abnormal: true, band, bandLabel: 'Contraindicated', notes: [...notes, ...tail], note: NOTE });
  if (base > baseLimit) return stop(1, `Step 1: a baseline of ${base} msec is above the label's ${baseLimit} msec${conduction === 'yes' ? ' for a ventricular conduction abnormality' : ''}, and the label says Tikosyn is contraindicated.`, []);
  const notes = [`Step 1: baseline ${base} msec is not above the label's ${baseLimit} msec${conduction === 'yes' ? ' (ventricular conduction abnormality)' : ''}.`];
  const start = findBands(STARTING, crcl).rows[0];
  if (start.dose === 0) return stop(3, `Step 3: at a creatinine clearance of ${crcl} mL/min, below 20, the label says Tikosyn is contraindicated.`, notes);
  const band3 = start.dose === 500 ? 'above 60' : start.dose === 250 ? '40 to 60' : '20 to below 40';
  notes.push(`Step 3: creatinine clearance ${crcl} mL/min is ${band3} mL/min, so the starting dose is ${start.dose} mcg twice daily.`);
  const out = { valid: true, step: 3, startingDose: start.dose, flag: 'dose' };
  let current = `${start.dose} mcg twice daily`;
  let band = `Step 3: the label's starting dose is ${current}.`;
  if (!blank(o.firstDoseQt)) {
    const first = Number(o.firstDoseQt); const pct = ((first - base) / base) * 100;
    const byPct = pct > 15; const byLimit = first > doseLimit;
    out.step = 5; out.percentChange = sig(pct);
    if (byPct || byLimit) {
      current = STEP_DOWN[start.dose]; out.adjustedDose = current;
      const why = [byPct ? `it rose ${sig(pct)}% from baseline, more than 15%` : null, byLimit ? `it is above ${doseLimit} msec` : null].filter(Boolean).join(' and ');
      notes.push(`Step 5: the interval 2 to 3 hours after the first dose is ${first} msec; ${why}. The label adjusts ${start.dose} mcg twice daily to ${current}.`);
      band = `Step 5: the label adjusts the dose to ${current}.`;
    } else {
      notes.push(`Step 5: the interval 2 to 3 hours after the first dose is ${first} msec, a change of ${sig(pct)}% from baseline (not more than 15%) and not above ${doseLimit} msec, so the label continues ${current}.`);
      band = `Step 5: the label continues ${current}.`;
    }
  }
  if (!blank(o.laterQt)) {
    const later = Number(o.laterQt);
    out.step = 6;
    if (later > doseLimit) {
      notes.push(`Step 6: an interval of ${later} msec after the second dose or later is above ${doseLimit} msec. The label says Tikosyn should be discontinued; it gives no further down-titration.`);
      return { ...out, flag: 'discontinue', abnormal: true, band: `Step 6: at ${later} msec, above ${doseLimit}, the label says Tikosyn should be discontinued.`, bandLabel: 'Discontinue', notes: [...notes, ...tail], note: NOTE };
    }
    notes.push(`Step 6: an interval of ${later} msec after a later dose is not above ${doseLimit} msec; the label gives no further down-titration and continues ${current}.`);
    band = `Step 6: the label continues ${current}.`;
  }
  return { ...out, currentDose: current, abnormal: false, band, bandLabel: current, notes: [...notes, ...tail], note: NOTE };
}
