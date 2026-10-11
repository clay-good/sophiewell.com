// spec-v1632 tool 11: sotalol, atenolol, lisinopril, sacubitril-valsartan and rosuvastatin, the
// renal row each label gives, read through lib/label-dose.js.
//
// Five label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Betapace (sotalol; Covis, DailyMed version 6), Table 1, dosing interval by creatinine clearance:
//     ">60 12; 30-59 24; 10-29 36-48; <10 Dose should be individualized". "Dose escalations in renal
//     impairment should be done after administration of at least 5 doses"; "specific advice is
//     unavailable on dosing patients on dialysis"; initial dose 80 mg.
//   Tenormin (atenolol; version 2), by creatinine clearance in mL/min/1.73 m2: 15-35, maximum 50 mg
//     daily; <15, 25 mg daily; "Patients on hemodialysis should be given 25 mg or 50 mg after each
//     dialysis ... under hospital supervision".
//   Zestril (lisinopril; version 2): "No dose adjustment ... creatinine clearance > 30 mL/min"; ">= 10
//     mL/min and <= 30 mL/min, reduce the initial dose ... to half of the usual recommended dose i.e.,
//     hypertension, 5 mg; systolic heart failure, 2.5 mg and acute MI, 2.5 mg. Up titrate as tolerated
//     to a maximum of 40 mg daily"; "on hemodialysis or creatinine clearance < 10 mL/min, the
//     recommended initial dose is 2.5 mg once daily".
//   Entresto (sacubitril and valsartan; Novartis, version 25), by eGFR: "eGFR less than 30 ..., start
//     ENTRESTO at half the usually recommended starting dose"; no starting dose adjustment for mild
//     or moderate renal impairment. Hepatic: Child-Pugh B, half the starting dose; Child-Pugh C,
//     "not recommended"; mild, no adjustment.
//   Crestor (rosuvastatin; AstraZeneca, version 19), by CLcr in mL/min/1.73 m2: "less than 30 ... not
//     on hemodialysis, the recommended starting dosage is 5 mg orally once daily and should not
//     exceed 10 mg"; no recommendations for mild and moderate impairment.
//
// Where a label states a limit only below a clearance, the row above says the label gives no renal
// limit there. Adults only.
//
// Pure: no DOM, no network; `now` is passed in.

import { bandToolAnswer, DIALYSIS } from './label-dose.js';

const D = 'dose'; const NA = 'no-adjustment'; const NG = 'no-recommendation-given';
const b = (from, to, text, flag = D) => ({ from, to, text, flag });
const lt = (to, text, flag = D) => ({ from: null, to, toExclusive: true, text, flag });
const gt = (from, text, flag = NA) => ({ from, to: null, fromExclusive: true, text, flag });
const ge = (from, text, flag = NA) => ({ from, to: null, text, flag });
const CRCL = { unit: 'mL/min', measure: 'creatinine clearance' };
const NORM = { unit: 'mL/min/1.73 m²', measure: 'creatinine clearance' };

export const LABELS = {
  sotalol: { brand: 'Betapace', setId: 'afce2787-8899-4098-87c8-f1e8dd19e6dd', ...CRCL },
  atenolol: { brand: 'Tenormin', setId: '6e850b1e-28a4-4ff8-8ed7-bb0b29faa28a', ...NORM },
  lisinopril: { brand: 'Zestril', setId: '838c2d78-d2d8-4981-9ec9-e50ef9e1a5d8', ...CRCL },
  entresto: { brand: 'Entresto', setId: '000dc81d-ab91-450c-8eae-8eb74e72296f', unit: 'mL/min/1.73 m²', measure: 'eGFR' },
  rosuvastatin: { brand: 'Crestor', setId: '325a5d0e-9a72-4015-9fcd-1655fb504cee', ...NORM },
};
const lisinopril = (value, text, half) => ({
  value, drug: 'lisinopril', text,
  bands: [gt(30, 'no dose adjustment'), b(10, 30, `an initial dose of ${half} mg (half the usual starting dose), titrated as tolerated to a maximum of 40 mg daily`), lt(10, 'an initial dose of 2.5 mg once daily')],
  hd: { text: 'an initial dose of 2.5 mg once daily', flag: D },
});

export const REGIMENS = [
  { value: 'sotalol', drug: 'sotalol', text: 'Sotalol (Betapace): dosing interval', bands: [gt(60, 'a dosing interval of 12 hours', D), b(30, 59, 'a dosing interval of 24 hours'), b(10, 29, 'a dosing interval of 36 to 48 hours'), lt(10, 'no interval: below 10 mL/min the dose should be individualized', NG)], hd: { text: 'no dose: sotalol is partly removed by dialysis and specific advice on dosing patients on dialysis is unavailable', flag: NG }, pd: { text: 'no dose: sotalol is partly removed by dialysis and specific advice on dosing patients on dialysis is unavailable', flag: NG } },
  { value: 'atenolol', drug: 'atenolol', text: 'Atenolol (Tenormin): maximum dose', bands: [gt(35, 'no renal maximum at this clearance (its limits start at 35 mL/min/1.73 m²)'), b(15, 35, 'a maximum of 50 mg daily'), lt(15, 'a maximum of 25 mg daily')], hd: { text: '25 mg or 50 mg after each dialysis, under hospital supervision because marked falls in blood pressure can occur', flag: D } },
  lisinopril('lisinopril-hypertension', 'Lisinopril (Zestril): hypertension', '5'),
  lisinopril('lisinopril-heart-failure', 'Lisinopril (Zestril): systolic heart failure', '2.5'),
  lisinopril('lisinopril-acute-mi', 'Lisinopril (Zestril): acute MI', '2.5'),
  { value: 'sacubitril-valsartan', drug: 'entresto', text: 'Sacubitril-valsartan (Entresto; by eGFR)', bands: [ge(30, 'no starting dose adjustment for mild or moderate renal impairment'), lt(30, 'a start at half the usually recommended starting dose, then the usual dose escalation')] },
  { value: 'rosuvastatin', drug: 'rosuvastatin', text: 'Rosuvastatin (Crestor)', bands: [ge(30, 'no dosage adjustment recommendation for mild and moderate renal impairment'), lt(30, 'a starting dosage of 5 mg once daily, not to exceed 10 mg once daily (severe impairment, not on hemodialysis)')] },
];
export { DIALYSIS };
const NOTE = 'This reports the renal row the label gives for the values entered. It is not a recommendation and it covers adults only.';

function notesFor(reg) {
  if (reg.drug === 'sotalol') return ['The label gives an initial dose of 80 mg at the interval shown, and says dose escalations in renal impairment should come after at least 5 doses at that interval, with close monitoring of heart rate and QTc.'];
  if (reg.drug === 'atenolol') return ['The Tenormin label states this clearance per 1.73 m².'];
  if (reg.drug === 'entresto') return ['Hepatic impairment, same label: Child-Pugh B, start at half the usually recommended starting dose; Child-Pugh C, not recommended; mild impairment, no starting dose adjustment.'];
  if (reg.drug === 'rosuvastatin') return ['The Crestor label states this clearance per 1.73 m², and its limit is for patients not on hemodialysis.'];
  return [];
}

export function cardiacRenalDoseCheck(input = {}, now, table) {
  return bandToolAnswer({ regimens: REGIMENS, labels: LABELS, note: NOTE, notesFor }, input, now, table);
}
