// spec-v1632 tool 13: allopurinol and colchicine by kidney function, read from each label through
// lib/label-dose.js.
//
// Two label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Allopurinol tablets (Dr. Reddy's, DailyMed version 15), which key on eGFR. Table 1, initial
//     dosage in gout: "> 60 mL/minute No dosage modification; > 30 to 60 mL/minute 50 mg daily; > 15
//     to 30 mL/minute 50 mg every other day; 5 to 15 mL/minute 50 mg twice weekly; < 5 mL/minute
//     50 mg once weekly". "The maximum dosage ... is not defined at different eGFR levels"; increase
//     "in 50 mg/day increments every 2 weeks to 4 weeks". Hyperuricemia with cancer therapy: "> 20
//     mL/min to 60 mL/min No dosage modification; 10 mL/min to 20 mL/min 200 mg/day; < 10 mL/min
//     100 mg/day; On dialysis 50 mg every 12 hours, or 100 mg every 24 hours".
//   Colchicine tablets (Amneal, version 18), section 2.5, by creatinine clearance (mild 50 to 80,
//     moderate 30 to 50, severe below 30 mL/min). Prophylaxis: mild to moderate, "adjustment of the
//     recommended dose is not required"; severe, "the starting dose should be 0.3 mg/day"; dialysis,
//     "0.3 mg given twice a week". Flare treatment: mild to moderate, no adjustment; severe, the dose
//     unchanged but "a treatment course should be repeated no more than once every two weeks";
//     dialysis, "a single dose of 0.6 mg (one tablet)", not repeated more than once every two weeks.
//     FMF: below 30 mL/min, "start with 0.3 mg/day"; dialysis, "0.3 mg (half tablet) per day".
//     "Treatment of gout flares ... is not recommended in patients with renal impairment who are
//     receiving colchicine ... for prophylaxis." Section 4: renal or hepatic impairment with a P-gp
//     or strong CYP3A4 inhibitor is a contraindication.
//
// Adults only.
//
// Pure: no DOM, no network; `now` is passed in.

import { bandToolAnswer, DIALYSIS } from './label-dose.js';

const D = 'dose'; const NA = 'no-adjustment';
const lt = (to, text, flag = D) => ({ from: null, to, toExclusive: true, text, flag });
const gt = (from, to, text, flag = D) => ({ from, to, fromExclusive: true, text, flag });
const ge = (from, text, flag = NA) => ({ from, to: null, text, flag });
const line = (text, flag = D) => ({ text, flag });

export const LABELS = {
  allopurinol: { brand: 'allopurinol', setId: '19a138b8-d225-03e6-f762-abe71560204b', unit: 'mL/min', measure: 'eGFR' },
  colchicine: { brand: 'colchicine', setId: '7daef7e2-888d-4116-81a9-2c02b9ef97ef', unit: 'mL/min', measure: 'creatinine clearance' },
};
const COL_MILD = 'no adjustment of the recommended dose (mild to moderate impairment), with close monitoring for adverse effects';
const ALLO_DIALYSIS = line('50 mg every 12 hours, or 100 mg every 24 hours');

export const REGIMENS = [
  { value: 'allopurinol-gout', drug: 'allopurinol', text: 'Allopurinol: gout, initial dosage (by eGFR)', bands: [gt(60, null, 'no dosage modification', NA), gt(30, 60, '50 mg daily'), gt(15, 30, '50 mg every other day'), { from: 5, to: 15, text: '50 mg twice weekly', flag: D }, lt(5, '50 mg once weekly')] },
  { value: 'allopurinol-cancer', drug: 'allopurinol', text: 'Allopurinol: hyperuricemia with cancer therapy (by eGFR)', bands: [gt(60, null, 'no renal row above 60 mL/min (its table starts at 60)', NA), gt(20, 60, 'no dosage modification', NA), { from: 10, to: 20, text: '200 mg/day', flag: D }, lt(10, '100 mg/day')], hd: ALLO_DIALYSIS, pd: ALLO_DIALYSIS },
  { value: 'colchicine-prophylaxis', drug: 'colchicine', text: 'Colchicine: prophylaxis of gout flares', bands: [ge(30, COL_MILD), lt(30, 'a starting dose of 0.3 mg/day, with any increase made under close monitoring')], hd: line('a starting dose of 0.3 mg twice a week, with close monitoring'), pd: line('a starting dose of 0.3 mg twice a week, with close monitoring') },
  { value: 'colchicine-flare', drug: 'colchicine', text: 'Colchicine: treatment of a gout flare', bands: [ge(30, COL_MILD), lt(30, 'the usual dose, with a treatment course repeated no more than once every two weeks')], hd: line('a single dose of 0.6 mg (one tablet), the course not repeated more than once every two weeks'), pd: line('a single dose of 0.6 mg (one tablet), the course not repeated more than once every two weeks') },
  { value: 'colchicine-fmf', drug: 'colchicine', text: 'Colchicine: familial Mediterranean fever', bands: [ge(30, 'no fixed reduction: mild and moderate impairment should be monitored closely, and dose reduction may be necessary'), lt(30, 'a start at 0.3 mg/day, with any increase made under adequate monitoring')], hd: line('a starting dose of 0.3 mg (half a tablet) per day, increased only with close monitoring'), pd: line('a starting dose of 0.3 mg (half a tablet) per day, increased only with close monitoring') },
];
export { DIALYSIS };
const NOTE = 'This reports the row the label gives for the values entered. It is not a recommendation and it covers adults only.';

function notesFor(reg) {
  if (reg.value === 'allopurinol-gout') return ['The allopurinol label keys on eGFR. It says to increase in 50 mg/day increments every 2 to 4 weeks in renal impairment, and that the maximum dosage is not defined at different eGFR levels.'];
  if (reg.drug === 'allopurinol') return ['The allopurinol label keys on eGFR.'];
  const notes = ['Contraindication on the same label: renal or hepatic impairment together with a P-gp or strong CYP3A4 inhibitor.'];
  if (reg.value === 'colchicine-flare') notes.unshift('The label says treating a flare is not recommended in a patient with renal impairment who is taking colchicine for prophylaxis.');
  return notes;
}

export function goutDrugRenalDose(input = {}, now, table) {
  return bandToolAnswer({ regimens: REGIMENS, labels: LABELS, note: NOTE, notesFor }, input, now, table);
}
