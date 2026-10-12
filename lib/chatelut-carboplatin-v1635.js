// spec-v1635 tool 2: carboplatin clearance and dose by the Chatelut formula.
//
// Sources, re-read October 11, 2026:
//   Chatelut E, et al. Prediction of carboplatin clearance from standard morphological and biological
//   patient characteristics. J Natl Cancer Inst 1995;87:573-580 (PubMed abstract, PMID 7752255):
//     "Carboplatin clearance (mL/min) was found to be best predicted by the following formula:
//      0.134.weight + [218.weight.(1-0.00457.age).(1-0.314.sex)]creatinine expressed in micromolar
//      concentration (with weight in kg, age in years, and sex = 0 if male and sex = 1 if female)."
//     70 patients, ages 23 to 84: 34 (46 cycles) to derive it, 36 others (49 cycles) to test it.
//   The abstract prints no division sign before "creatinine". The division was read in Kinoshita A,
//   et al. Br J Cancer 2006;94:1267-1271 (PMC2361403, CC BY 4.0), which applies the formula as
//     CL = 0.134 x weight + (218 x weight x (1 - 0.00457 x age) x (1 - 0.314 x sex)) x 113 x 1.03
//          x 10^-4 / (s-Cr + 0.276)
//   with creatinine in mg/dL by the enzymatic method: 113 x 10^-4 is 1/88.4 (mg/dL to micromolar),
//   and 1.03 and 0.276 undo their conversion of enzymatic to Jaffe creatinine (Y = 0.97X + 0.27).
//   So the bracket is divided by creatinine in micromolar, and that study fed it Jaffe creatinine.
//   The full text of the 1995 paper was not read, so the assay it used is not confirmed here.
//
//   CL (mL/min) = 0.134 x weight + 218 x weight x (1 - 0.00457 x age) x (1 - 0.314 x sex) / creatinine
//   Dose (mg) = target AUC (mg/mL.min) x CL
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const SEXES = [
  { value: 'male', text: 'Male' },
  { value: 'female', text: 'Female' },
];
export const CREATININE_UNITS = [
  { value: 'micromol-l', text: 'µmol/L' },
  { value: 'mg-dl', text: 'mg/dL' },
];
const NOTE = 'A published prediction of carboplatin clearance, and the dose it gives for a target AUC. It was derived and tested in 70 adults and is not the Calvert formula on the carboplatin label. It does not say which formula or target AUC to use.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en-US');
const n0 = (x) => Math.round(x).toLocaleString('en-US');

export function chatelutCarboplatin(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = SEXES.find((s) => s.value === String(o.sex ?? '').trim());
  if (!sex) return { valid: false, message: 'Choose the sex: the formula carries a sex term (0 for male, 1 for female).' };
  const unit = CREATININE_UNITS.find((u) => u.value === String(o.creatinineUnit ?? '').trim());
  if (!unit) return { valid: false, message: 'Choose the creatinine unit: µmol/L or mg/dL.' };
  const mgdl = unit.value === 'mg-dl';
  const f = inputFault([['the weight', o.weight, 20, 300, 'kg'], ['the age', o.age, 18, 110, 'years'], ['the serum creatinine', o.creatinine, mgdl ? 0.2 : 18, mgdl ? 15 : 1326, mgdl ? 'mg/dL' : 'µmol/L'], ['the target AUC', o.targetAuc, 1, 10, 'mg/mL·min']]);
  if (f) return { valid: false, message: f };
  let gfr = null;
  if (!blank(o.gfr)) {
    const gf = inputFault([['the GFR', o.gfr, 5, 250, 'mL/min']]);
    if (gf) return { valid: false, message: gf };
    gfr = Number(o.gfr);
  }
  const kg = Number(o.weight); const age = Number(o.age); const auc = Number(o.targetAuc);
  const cr = mgdl ? Number(o.creatinine) * 88.4 : Number(o.creatinine);
  const s = sex.value === 'female' ? 1 : 0;
  const nonRenal = 0.134 * kg;
  const renal = 218 * kg * (1 - 0.00457 * age) * (1 - 0.314 * s) / cr;
  const cl = nonRenal + renal;
  const dose = auc * cl;
  const outside = age < 23 || age > 84;
  const notes = [
    `Clearance = 0.134 × ${kg} + 218 × ${kg} × (1 − 0.00457 × ${age}) × (1 − 0.314 × ${s}) ÷ ${n1(cr)} = ${n1(nonRenal)} + ${n1(renal)} = ${n1(cl)} mL/min.`,
    `Dose = ${auc} × ${n1(cl)} = ${n0(dose)} mg.`,
  ];
  if (mgdl) notes.push(`Creatinine ${Number(o.creatinine)} mg/dL × 88.4 = ${n1(cr)} µmol/L.`);
  if (outside) notes.push(`Age ${age} is outside the 23 to 84 years of the patients the formula was derived and tested in.`);
  if (gfr !== null) notes.push(`Calvert, with the GFR entered: ${auc} × (${gfr} + 25) = ${n0(auc * (gfr + 25))} mg, ${n0(dose - auc * (gfr + 25)) === '0' ? 'the same as' : `${n0(Math.abs(dose - auc * (gfr + 25)))} mg ${dose > auc * (gfr + 25) ? 'below' : 'above'}`} the Chatelut dose. No cap is applied to either figure here.`);
  notes.push('Creatinine assay: the 1995 paper\'s assay was not confirmed here (only its abstract was read). A later study applied the formula with Jaffé creatinine and converted enzymatic results first (Jaffé = 0.97 × enzymatic + 0.27 mg/dL). An enzymatic creatinine entered as it is gives a higher clearance and dose than that study would.');
  notes.push('The formula was derived in 34 patients (46 cycles) and tested in 36 others (49 cycles). The paper states no dose cap, and none is applied; the 125 mL/min cap in the Calvert tool belongs to an estimated GFR in that formula, not to this one.');
  return {
    valid: true, flag: outside ? 'age-outside-study' : 'dose', abnormal: outside,
    clearance: Number(cl.toFixed(1)), dose: Number(dose.toFixed(0)), calvertDose: gfr === null ? null : Number((auc * (gfr + 25)).toFixed(0)),
    band: `Carboplatin clearance ${n1(cl)} mL/min by the Chatelut formula; at a target AUC of ${auc}, ${n0(dose)} mg.`,
    bandLabel: `${n0(dose)} mg`, notes, note: NOTE,
  };
}
