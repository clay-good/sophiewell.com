// spec-v1632 tool 8: metformin, SGLT2 inhibitors and DPP-4 inhibitors by eGFR, read from each label
// through lib/label-dose.js.
//
// Seven label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Metformin hydrochloride tablets (Zydus, DailyMed version 17), sections 2.3 and 2.4:
//     "contraindicated in patients with an estimated glomerular filtration rate (eGFR) below 30";
//     "Initiation ... in patients with an eGFR between 30 ... to 45 ... is not recommended"; "whose
//     eGFR later falls below 45 ..., assess the benefit risk of continuing therapy. Discontinue ...
//     if the patient's eGFR later falls below 30". Contrast: discontinue at or before an iodinated
//     contrast procedure at an eGFR between 30 and 60; re-evaluate eGFR 48 hours after.
//   Jardiance (empagliflozin; Boehringer Ingelheim, version 31), sections 2.1 and 8.6: "Use for
//     glycemic control is not recommended in patients with an eGFR less than 30". Section 2 gives no
//     eGFR limit for the other indications; 8.6: trials "did not enroll adult patients with an eGFR
//     less than 20".
//   Farxiga (dapagliflozin; AstraZeneca, version 49), sections 2.2 and 2.3: glycemic control "not
//     recommended ... with an eGFR less than 45"; other indications, "Initiation ... is not
//     recommended in patients with an eGFR less than 25"; "If the eGFR falls below 25 ... patients
//     may continue FARXIGA 10 mg orally once daily".
//   Invokana (canagliflozin; Janssen, version 32), Table 1: "eGFR 30 to less than 60: The maximum
//     recommended dosage is 100 mg orally once daily"; "eGFR less than 30: Initiation is not
//     recommended. Adult patients taking INVOKANA with albuminuria greater than 300 mg/day may
//     continue INVOKANA 100 mg once daily".
//   Januvia (sitagliptin; Merck, version 71): eGFR 45 to less than 90, no dosage adjustment; 30 to
//     less than 45, 50 mg once daily; less than 30 or ESRD requiring hemodialysis or peritoneal
//     dialysis, 25 mg once daily, "without regard to the timing of dialysis".
//   Saxagliptin tablets (Mylan, version 4): eGFR 45 or above, the usual dosage; below 45, "which
//     includes ... end-stage renal disease (ESRD) requiring hemodialysis", 2.5 mg once daily.
//   Nesina (alogliptin; Takeda, version 22), by creatinine clearance, not eGFR: CrCl 60 or above, no
//     adjustment; 30 to below 60, 12.5 mg once daily; below 30 or ESRD, 6.25 mg once daily; "has not
//     been studied in patients undergoing peritoneal dialysis".
//
// Starting and continuing are separate rows where the label separates them. Adults only.
//
// Pure: no DOM, no network; `now` is passed in.

import { bandToolAnswer, DIALYSIS } from './label-dose.js';

const D = 'dose'; const NA = 'no-adjustment'; const NR = 'not-recommended'; const CI = 'contraindicated'; const NG = 'no-recommendation-given';
const ge = (from, text, flag = NA) => ({ from, to: null, text, flag });
const half = (from, to, text, flag = D) => ({ from, to, toExclusive: true, text, flag });
const lt = (to, text, flag = D) => ({ from: null, to, toExclusive: true, text, flag });
const EGFR = { unit: 'mL/min/1.73 m²', measure: 'eGFR' };

export const LABELS = {
  metformin: { brand: 'metformin', setId: 'c82a10fa-1e8e-46b6-890a-737de3f34ee1', ...EGFR },
  empagliflozin: { brand: 'Jardiance', setId: 'faf3dd6a-9cd0-39c2-0d2e-232cb3f67565', ...EGFR },
  dapagliflozin: { brand: 'Farxiga', setId: '72ad22ae-efe6-4cd6-a302-98aaee423d69', ...EGFR },
  canagliflozin: { brand: 'Invokana', setId: 'b9057d3b-b104-4f09-8a61-c61ef9d4a3f3', ...EGFR },
  sitagliptin: { brand: 'Januvia', setId: 'f85a48d0-0407-4c50-b0fa-7673a160bf01', ...EGFR },
  saxagliptin: { brand: 'saxagliptin', setId: '6e8d8c4f-96eb-4b64-9c8c-4a5448a23a78', ...EGFR },
  alogliptin: { brand: 'Nesina', setId: 'a3768c7e-aa4c-44d3-bc53-43bb7346c0b0', unit: 'mL/min', measure: 'creatinine clearance' },
};
const MET_CI = 'contraindicated at an eGFR below 30 mL/minute/1.73 m²';
const MET_DIALYSIS = { text: `no separate line for dialysis; metformin is ${MET_CI}`, flag: CI };
const SITA_DIALYSIS = { text: '25 mg once daily, given without regard to the timing of dialysis', flag: D };

export const REGIMENS = [
  { value: 'metformin-starting', drug: 'metformin', text: 'Metformin: starting', bands: [ge(45, 'no renal limit on starting at this eGFR (its limits start at 45)'), { from: 30, to: 45, text: 'initiation is not recommended at an eGFR between 30 and 45', flag: NR }, lt(30, MET_CI, CI)], hd: MET_DIALYSIS, pd: MET_DIALYSIS },
  { value: 'metformin-continuing', drug: 'metformin', text: 'Metformin: already taking it', bands: [ge(45, 'no renal limit at this eGFR (its limits start below 45)'), half(30, 45, 'an assessment of the benefit and risk of continuing therapy, the eGFR having fallen below 45'), lt(30, `discontinue: metformin is ${MET_CI}`, CI)], hd: MET_DIALYSIS, pd: MET_DIALYSIS },
  { value: 'empagliflozin-glycemic', drug: 'empagliflozin', text: 'Empagliflozin (Jardiance): glycemic control', bands: [ge(30, 'no eGFR limit at this value for glycemic control (its limit starts below 30)'), lt(30, 'use for glycemic control is not recommended at an eGFR below 30', NR)] },
  { value: 'empagliflozin-other', drug: 'empagliflozin', text: 'Empagliflozin (Jardiance): heart failure, CKD or cardiovascular indication', anyValue: true, bands: [{ from: null, to: null, text: 'no eGFR limit in its dosing section for the heart failure, chronic kidney disease or cardiovascular indications (10 mg once daily)', flag: NA }] },
  { value: 'dapagliflozin-glycemic', drug: 'dapagliflozin', text: 'Dapagliflozin (Farxiga): glycemic control', bands: [ge(45, 'no eGFR limit at this value for glycemic control (its limit starts below 45)'), lt(45, 'not recommended to improve glycemic control at an eGFR below 45', NR)] },
  { value: 'dapagliflozin-other-starting', drug: 'dapagliflozin', text: 'Dapagliflozin (Farxiga): other indications, starting', bands: [ge(25, '10 mg once daily, the same dosage at an eGFR of 25 or above', D), lt(25, 'initiation is not recommended at an eGFR below 25', NR)] },
  { value: 'dapagliflozin-other-continuing', drug: 'dapagliflozin', text: 'Dapagliflozin (Farxiga): other indications, already taking it', bands: [ge(25, '10 mg once daily, the same dosage at an eGFR of 25 or above', D), lt(25, 'continuation of 10 mg once daily (patients may continue if the eGFR falls below 25 during treatment)')] },
  { value: 'canagliflozin-starting', drug: 'canagliflozin', text: 'Canagliflozin (Invokana): starting', bands: [ge(60, 'no renal limit at this eGFR (its table starts below 60)'), half(30, 60, 'a maximum of 100 mg once daily'), lt(30, 'initiation is not recommended at an eGFR below 30', NR)] },
  { value: 'canagliflozin-continuing', drug: 'canagliflozin', text: 'Canagliflozin (Invokana): already taking it', bands: [ge(60, 'no renal limit at this eGFR (its table starts below 60)'), half(30, 60, 'a maximum of 100 mg once daily'), lt(30, 'continuation of 100 mg once daily for adults with albuminuria above 300 mg/day; the table gives no other row below 30')] },
  { value: 'sitagliptin', drug: 'sitagliptin', text: 'Sitagliptin (Januvia)', bands: [ge(45, 'no dosage adjustment (eGFR 45 to less than 90)'), half(30, 45, '50 mg once daily'), lt(30, '25 mg once daily')], hd: SITA_DIALYSIS, pd: SITA_DIALYSIS },
  { value: 'saxagliptin', drug: 'saxagliptin', text: 'Saxagliptin', bands: [ge(45, 'the same dosage as with normal renal function'), lt(45, '2.5 mg once daily')], hd: { text: '2.5 mg once daily (the label\'s row below 45 includes end-stage renal disease requiring hemodialysis)', flag: D } },
  { value: 'alogliptin', drug: 'alogliptin', text: 'Alogliptin (Nesina; by creatinine clearance)', bands: [ge(60, 'no dose adjustment'), half(30, 60, '12.5 mg once daily'), lt(30, '6.25 mg once daily')], hd: { text: '6.25 mg once daily, given without regard to the timing of dialysis', flag: D }, pd: { text: 'no dose: alogliptin has not been studied in patients undergoing peritoneal dialysis', flag: NG } },
];
export { DIALYSIS };
const NOTE = 'This reports the rule the label gives for the values entered. It is not a recommendation and it covers adults only. Three different kidney measures appear in this class; the result names the one each label uses.';

function notesFor(reg) {
  if (reg.drug === 'metformin') return ['Iodinated contrast (same label): stop metformin at or before the procedure at an eGFR between 30 and 60, with a history of liver disease, alcoholism or heart failure, or with intra-arterial contrast; re-evaluate eGFR 48 hours after and restart if renal function is stable.'];
  if (reg.value === 'empagliflozin-other') return ['Section 8.6 of the label says its efficacy and safety trials did not enroll adults with an eGFR below 20 mL/min/1.73 m². The tool states no cutoff the label does not give.'];
  if (reg.drug === 'alogliptin') return ['The Nesina label uses creatinine clearance, not eGFR.'];
  if (reg.drug === 'canagliflozin') return ['The continuing row applies to adults with albuminuria above 300 mg/day, as the label states it.'];
  return [];
}

export function diabetesDrugEgfrCheck(input = {}, now, table) {
  return bandToolAnswer({ regimens: REGIMENS, labels: LABELS, note: NOTE, notesFor }, input, now, table);
}
