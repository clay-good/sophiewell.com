// spec-v1632 tool 12: spironolactone and eplerenone by potassium and kidney function, from each label.
//
// Two label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Aldactone (spironolactone; Pfizer, DailyMed version 25), section 2.2, heart failure: "In patients
//     with serum potassium <=5.0 mEq/L and eGFR >50 mL/min/1.73 m2, initiate treatment at 25 mg once
//     daily. Patients who tolerate 25 mg once daily may have their dosage increased to 50 mg once
//     daily ... Patients who develop hyperkalemia on 25 mg once daily may have their dosage reduced
//     to 25 mg every other day ... In patients with an eGFR between 30 and 50 ..., consider
//     initiating therapy at 25 mg every other day".
//   Inspra (eplerenone; Viatris, version 6), section 2.1, Table 1 (heart failure after MI), by serum
//     potassium: <5.0, step up (25 mg every other day to 25 mg once daily; 25 mg once daily to 50 mg
//     once daily); 5.0-5.4, no adjustment; 5.5-5.9, step down (50 to 25 mg once daily; 25 mg once
//     daily to 25 mg every other day; 25 mg every other day to withhold); >=6.0, "Withhold and restart
//     at 25 mg every other day when potassium levels fall to <5.5 mEq/L". Section 4: contraindicated
//     in all patients with potassium >5.5 mEq/L at initiation, creatinine clearance <=30 mL/min, or a
//     strong CYP3A inhibitor; and for hypertension with type 2 diabetes with microalbuminuria, serum
//     creatinine >2.0 mg/dL in males or >1.8 mg/dL in females, creatinine clearance <50 mL/min, or
//     potassium supplements or potassium-sparing diuretics.
//
// Table 1 prints potassium to one decimal (5.0-5.4, then 5.5-5.9), so the value is read to one decimal
// and the result says so. The tool reports the label's step; it starts, changes and stops nothing.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABELS = { spironolactone: { brand: 'Aldactone', setId: '0fed2822-3a03-4b64-9857-c682fcd462bc' }, eplerenone: { brand: 'Inspra', setId: '1a52bedc-8e2c-4116-a296-a87770676b4a' } };
export const MODES = [
  { value: 'spironolactone-hf', text: 'Spironolactone: starting for heart failure' },
  { value: 'eplerenone-adjust', text: 'Eplerenone: dose adjustment in heart failure after MI' },
  { value: 'eplerenone-start-hf', text: 'Eplerenone: before starting, heart failure after MI' },
  { value: 'eplerenone-start-htn', text: 'Eplerenone: before starting, hypertension' },
];
export const EPLERENONE_DOSES = [
  { value: '25-qod', text: '25 mg every other day' },
  { value: '25-daily', text: '25 mg once daily' },
  { value: '50-daily', text: '50 mg once daily' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const SEXES = [{ value: 'male', text: 'Male' }, { value: 'female', text: 'Female' }];
const NOTE = 'This reports the step the label gives for the values entered. It is not a recommendation, and it starts, changes and stops nothing. The labels say to measure serum potassium before starting and periodically after.';
const yn = (v) => String(v ?? '').trim();
const one = (x) => Math.round(Number(x) * 10) / 10;

function spironolactone(o) {
  const f = inputFault([['the serum potassium', o.potassium, 1, 10, 'mEq/L'], ['the eGFR', o.egfr, 0, 250, 'mL/min/1.73 m²']]);
  if (f) return { fault: f };
  const k = Number(o.potassium); const egfr = Number(o.egfr);
  const tail = ['Same section: a patient who tolerates 25 mg once daily may go to 50 mg once daily, and one who develops hyperkalemia on 25 mg once daily may go to 25 mg every other day.'];
  if (k <= 5.0 && egfr > 50) return { flag: 'dose', text: 'The Aldactone label gives a start at 25 mg once daily.', rule: `Potassium ${k} mEq/L is 5.0 or below and eGFR ${egfr} is above 50.`, notes: tail };
  if (k <= 5.0 && egfr >= 30) return { flag: 'dose', text: 'The Aldactone label says to consider starting at 25 mg every other day, because of the risk of hyperkalemia.', rule: `eGFR ${egfr} is between 30 and 50; potassium ${k} mEq/L is 5.0 or below.`, notes: tail };
  const why = [k > 5.0 ? `potassium ${k} mEq/L is above 5.0` : null, egfr < 30 ? `eGFR ${egfr} is below 30` : null].filter(Boolean).join(' and ');
  return { flag: 'no-recommendation-given', text: 'The Aldactone label gives its heart failure starting doses for a potassium of 5.0 mEq/L or below and an eGFR of 30 or above; it gives none for these values.', rule: `Here ${why}.`, notes: tail };
}

function eplerenoneAdjust(o) {
  const dose = EPLERENONE_DOSES.find((d) => d.value === yn(o.currentDose));
  if (!dose) return { fault: 'Choose the current eplerenone dose: the label\'s table steps from it.' };
  const f = inputFault([['the serum potassium', o.potassium, 1, 10, 'mEq/L']]);
  if (f) return { fault: f };
  const k = one(o.potassium); const i = EPLERENONE_DOSES.indexOf(dose);
  const notes = [];
  if (Number(o.potassium) !== k) notes.push(`The potassium is read to one decimal, as the table prints its bands: ${k} mEq/L.`);
  if (k >= 6.0) return { flag: 'hold', text: 'The Inspra label\'s Table 1 says to withhold eplerenone and restart at 25 mg every other day when the potassium falls below 5.5 mEq/L.', rule: `Potassium ${k} mEq/L is 6.0 or above.`, notes };
  if (k >= 5.5) {
    const text = i === 0 ? `The Inspra label's Table 1 steps ${dose.text} down to withhold.` : `The Inspra label's Table 1 steps ${dose.text} down to ${EPLERENONE_DOSES[i - 1].text}.`;
    return { flag: i === 0 ? 'hold' : 'dose', next: i === 0 ? 'withhold' : EPLERENONE_DOSES[i - 1].value, text, rule: `Potassium ${k} mEq/L is 5.5 to 5.9.`, notes };
  }
  if (k >= 5.0) return { flag: 'no-adjustment', next: dose.value, text: `The Inspra label's Table 1 gives no adjustment: ${dose.text} continues.`, rule: `Potassium ${k} mEq/L is 5.0 to 5.4.`, notes };
  if (i === 2) return { flag: 'no-adjustment', next: dose.value, text: 'The Inspra label\'s Table 1 has no step above 50 mg once daily, its recommended dose.', rule: `Potassium ${k} mEq/L is below 5.0.`, notes };
  return { flag: 'dose', next: EPLERENONE_DOSES[i + 1].value, text: `The Inspra label's Table 1 steps ${dose.text} up to ${EPLERENONE_DOSES[i + 1].text}.`, rule: `Potassium ${k} mEq/L is below 5.0.`, notes };
}

function eplerenoneStart(o, htn) {
  const f = inputFault([['the serum potassium', o.potassium, 1, 10, 'mEq/L'], ['the creatinine clearance', o.crcl, 0, 250, 'mL/min']]);
  if (f) return { fault: f };
  if (yn(o.cyp3a) !== 'no' && yn(o.cyp3a) !== 'yes') return { fault: 'Say whether the patient takes a strong CYP3A inhibitor: the label lists it as a contraindication.' };
  const k = Number(o.potassium); const crcl = Number(o.crcl);
  const met = [];
  if (k > 5.5) met.push(`serum potassium ${k} mEq/L is above 5.5 at initiation`);
  if (crcl <= 30) met.push(`creatinine clearance ${crcl} mL/min is 30 or below`);
  if (yn(o.cyp3a) === 'yes') met.push('a strong CYP3A inhibitor is in use');
  if (htn) {
    const sex = yn(o.sex);
    if (sex !== 'male' && sex !== 'female') return { fault: 'Choose the sex: for hypertension the label\'s serum creatinine limit is 2.0 mg/dL in males and 1.8 mg/dL in females.' };
    const cf = inputFault([['the serum creatinine', o.creatinine, 0.1, 20, 'mg/dL']]);
    if (cf) return { fault: cf };
    for (const [key, ask] of [['microalbuminuria', 'type 2 diabetes with microalbuminuria'], ['potassiumSparing', 'a potassium supplement or potassium-sparing diuretic']]) {
      if (yn(o[key]) !== 'no' && yn(o[key]) !== 'yes') return { fault: `Say whether the patient has ${ask}: for hypertension the label lists it as a contraindication.` };
    }
    const scr = Number(o.creatinine); const lim = sex === 'male' ? 2.0 : 1.8;
    if (yn(o.microalbuminuria) === 'yes') met.push('type 2 diabetes with microalbuminuria');
    if (scr > lim) met.push(`serum creatinine ${scr} mg/dL is above ${lim.toFixed(1)} (${sex})`);
    if (crcl < 50 && crcl > 30) met.push(`creatinine clearance ${crcl} mL/min is below 50`);
    if (yn(o.potassiumSparing) === 'yes') met.push('a potassium supplement or potassium-sparing diuretic is in use');
  }
  const start = htn ? '50 mg once daily' : '25 mg once daily, titrated to 50 mg once daily, preferably within 4 weeks';
  if (met.length) return { flag: 'contraindicated', contraindications: met, text: `The Inspra label lists ${met.length === 1 ? 'a contraindication' : `${met.length} contraindications`} that the values entered meet.`, rule: `Met: ${met.join('; ')}.`, notes: [] };
  return { flag: 'dose', contraindications: [], text: `None of the Inspra label's contraindications ${htn ? 'for hypertension ' : ''}is met by the values entered; its starting dose is ${start}.`, rule: 'Checked: potassium above 5.5, creatinine clearance 30 or below, a strong CYP3A inhibitor' + (htn ? ', type 2 diabetes with microalbuminuria, the serum creatinine limit, creatinine clearance below 50, and potassium supplements or potassium-sparing diuretics.' : '.'), notes: ['The label\'s section 4 is the list checked here; its warnings and other interactions are not.'] };
}

export function mraPotassiumDoseCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const mode = MODES.find((m) => m.value === yn(o.mode));
  if (!mode) return { valid: false, message: 'Choose the drug and the question: spironolactone starting, eplerenone adjustment, or eplerenone before starting.' };
  const L = LABELS[mode.value.startsWith('spironolactone') ? 'spironolactone' : 'eplerenone'];
  const r = mode.value === 'spironolactone-hf' ? spironolactone(o) : mode.value === 'eplerenone-adjust' ? eplerenoneAdjust(o) : eplerenoneStart(o, mode.value === 'eplerenone-start-htn');
  if (r.fault) return { valid: false, message: r.fault };
  const row = labelRow(L.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, band: `The ${L.brand} label's rule is withheld, so no step is reported.`, bandLabel: 'Withheld', notes: [`The ${L.brand} label rule is withheld: ${row.why}.`, 'Read the step from the label in hand.'], note: NOTE };
  }
  const { text, rule, notes, flag, ...extra } = r;
  const short = { dose: 'Step given', 'no-adjustment': 'No adjustment', hold: 'Withhold', contraindicated: 'Contraindicated', 'no-recommendation-given': 'No dose given' }[flag];
  return { valid: true, mode: mode.value, flag, ...extra, abnormal: flag === 'hold' || flag === 'contraindicated' || flag === 'no-recommendation-given', band: text, bandLabel: short, notes: [rule, ...notes, `Label: ${row.edition}.`], note: NOTE };
}
