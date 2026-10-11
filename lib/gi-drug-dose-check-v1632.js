// spec-v1632 tool 17: famotidine and metoclopramide adjustments, read from each label.
//
// Two label rows (spec-v1628 section 1), each re-read on October 11, 2026:
//   Famotidine tablets (Teva, DailyMed version 21), section 2.2, Table 2, recommended MAXIMUM dosage
//     by indication at a creatinine clearance of 30 to 60 mL/minute and below 30 (FAMOTIDINE below),
//     with footnotes a ("An alternate dosage regimen is 10 mg once daily", needing another
//     formulation), d (hypersecretory doses "may exceed the maximum doses evaluated") and e
//     ("Recommended dosage regimen is 10 mg every other day").
//   Reglan (metoclopramide tablets; ANI, version 8), Tables 1 and 2. Reflux: adults 10 to 15 mg four
//     times daily, maximum 60 mg; "Moderate or severe hepatic impairment (Child-Pugh B or C)",
//     "CYP2D6 poor metabolizers", "strong CYP2D6 inhibitors" and "creatinine clearance less than or
//     equal to 60 mL/minute": 5 mg four times daily or 10 mg three times daily, maximum 30 mg; ESRD
//     "including those treated with hemodialysis and continuous ambulatory peritoneal dialysis": 5 mg
//     four times daily or 10 mg twice daily, maximum 20 mg. Diabetic gastroparesis: 10 mg four times
//     daily, maximum 40 mg; the same groups (there the table reads "less than 60 mL/minute"), 5 mg
//     four times daily, maximum 20 mg; ESRD, 5 mg twice daily, maximum 10 mg. Mild hepatic impairment
//     and elderly patients: the adult dosage, with 5 mg four times daily to start in the elderly.
//
// The two Reglan tables put the renal edge differently (60 inclusive for reflux, exclusive for
// gastroparesis), and the tool follows each as printed. Adults.
//
// Pure: no DOM, no network; `now` is passed in.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';
import { bandToolAnswer, DIALYSIS } from './label-dose.js';

const D = 'dose'; const NA = 'no-adjustment'; const NR = 'not-recommended';
const ALT = ' (an alternate regimen is 10 mg once daily, which needs another famotidine formulation)';
const fam = (value, text, mid, low, midFlag = D, lowFlag = D) => ({
  value, drug: 'famotidine', text,
  bands: [{ from: 60, fromExclusive: true, to: null, text: 'no renal maximum above 60 mL/minute (its table covers 60 and below)', flag: NA }, { from: 30, to: 60, text: mid, flag: midFlag }, { from: null, to: 30, toExclusive: true, text: low, flag: lowFlag }],
});
export const FAMOTIDINE = [
  fam('famotidine-du', 'Famotidine: active duodenal ulcer', 'a maximum of 20 mg once daily, or 40 mg every other day', `a maximum of 20 mg every other day${ALT}`),
  fam('famotidine-gu', 'Famotidine: active gastric ulcer', 'a maximum of 20 mg once daily, or 40 mg every other day', `a maximum of 20 mg every other day${ALT}`),
  fam('famotidine-gerd', 'Famotidine: symptomatic nonerosive GERD', 'a maximum of 20 mg once daily', `a maximum of 20 mg every other day${ALT}`),
  fam('famotidine-erosive-20', 'Famotidine: erosive esophagitis, 20 mg twice daily regimen', 'a maximum of 20 mg once daily, or 40 mg every other day', `a maximum of 20 mg every other day${ALT}`),
  fam('famotidine-erosive-40', 'Famotidine: erosive esophagitis, 40 mg twice daily regimen', 'a maximum of 40 mg once daily', 'a maximum of 20 mg once daily'),
  fam('famotidine-hypersecretory', 'Famotidine: pathological hypersecretory conditions', 'avoid use: the doses needed may exceed the maximum evaluated in renal impairment', 'avoid use: the doses needed may exceed the maximum evaluated in renal impairment', NR, NR),
  fam('famotidine-du-recurrence', 'Famotidine: reduction of the risk of duodenal ulcer recurrence', `a maximum of 20 mg every other day${ALT}`, '10 mg every other day, which needs another famotidine formulation'),
];
export const METOCLOPRAMIDE = [
  { value: 'metoclopramide-gerd', text: 'Metoclopramide (Reglan): gastroesophageal reflux', usual: ['10 to 15 mg four times daily', 60], adjusted: ['5 mg four times daily, or 10 mg three times daily', 30], esrd: ['5 mg four times daily, or 10 mg twice daily', 20], renalInclusive: true },
  { value: 'metoclopramide-gastroparesis', text: 'Metoclopramide (Reglan): diabetic gastroparesis', usual: ['10 mg four times daily', 40], adjusted: ['5 mg four times daily', 20], esrd: ['5 mg twice daily', 10], renalInclusive: false },
];
export const REGIMENS = [...FAMOTIDINE.map(({ value, text }) => ({ value, text })), ...METOCLOPRAMIDE.map(({ value, text }) => ({ value, text }))];
export const LABELS = {
  famotidine: { brand: 'famotidine', setId: '4c6f4f9e-f3f5-4ecf-9f40-887e037e8847', unit: 'mL/min', measure: 'creatinine clearance' },
  metoclopramide: { brand: 'Reglan', setId: 'de55c133-eb08-4a35-91a2-5dc093027397' },
};
export const HEPATIC = [
  { value: 'none-or-a', text: 'None, or mild (Child-Pugh A)' },
  { value: 'b-or-c', text: 'Moderate or severe (Child-Pugh B or C)' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export { DIALYSIS };
const NOTE = 'This reports the label\'s row and maximum daily dose for the values entered. It is not a recommendation and it covers adults.';
const yn = (v) => String(v ?? '').trim();

function metoclopramide(reg, o, now, table) {
  const dialysis = yn(o.dialysis);
  if (!DIALYSIS.some((d) => d.value === dialysis)) return { valid: false, message: 'Say whether the patient is on dialysis: the Reglan label has its own row for end-stage renal disease.' };
  const hepatic = yn(o.hepatic);
  if (!HEPATIC.some((h) => h.value === hepatic)) return { valid: false, message: 'Choose the hepatic function: the Reglan label lowers the dose for Child-Pugh B or C.' };
  for (const [key, ask] of [['poorMetabolizer', 'is a CYP2D6 poor metabolizer'], ['inhibitor', 'takes a strong CYP2D6 inhibitor']]) {
    if (yn(o[key]) !== 'no' && yn(o[key]) !== 'yes') return { valid: false, message: `Say whether the patient ${ask}: the Reglan label lowers the dose for it.` };
  }
  let crcl = null;
  if (dialysis === 'none') {
    const f = inputFault([['the creatinine clearance', o.kidney, 0, 250, 'mL/min']]);
    if (f) return { valid: false, message: f };
    crcl = Number(o.kidney);
  }
  const L = LABELS.metoclopramide;
  const row = labelRow(L.setId, now, table);
  if (!row.answers) return { valid: true, withheld: true, labelUrl: row.url, regimen: reg.value, band: 'The Reglan label\'s rows are withheld, so no dose is reported.', bandLabel: 'Withheld', notes: [`The Reglan label rows are withheld: ${row.why}.`, 'Read the dose from the label in hand.'], note: NOTE };
  const why = [];
  if (hepatic === 'b-or-c') why.push('moderate or severe hepatic impairment (Child-Pugh B or C)');
  if (yn(o.poorMetabolizer) === 'yes') why.push('a CYP2D6 poor metabolizer');
  if (yn(o.inhibitor) === 'yes') why.push('a strong CYP2D6 inhibitor');
  const renal = crcl !== null && (reg.renalInclusive ? crcl <= 60 : crcl < 60);
  if (renal) why.push(`creatinine clearance ${crcl} mL/min is ${reg.renalInclusive ? '60 or below' : 'below 60'}`);
  const [text, max, rule] = dialysis !== 'none' ? [...reg.esrd, 'End-stage renal disease on dialysis.']
    : why.length ? [...reg.adjusted, `The label's reduced-dose group applies: ${why.join('; ')}.`]
      : [...reg.usual, 'None of the label\'s reduced-dose criteria is met (Child-Pugh B or C, CYP2D6 poor metabolizer, strong CYP2D6 inhibitor, the renal row).'];
  const notes = [rule];
  if (dialysis === 'none' && !why.length) notes.push('For elderly patients the label says to consider 5 mg four times daily to start, titrated to the adult dosage.');
  if (reg.value === 'metoclopramide-gastroparesis' && yn(o.inhibitor) === 'yes') notes.push('The gastroparesis table names quinidine as the strong CYP2D6 inhibitor and says to avoid use with bupropion, fluoxetine and paroxetine.');
  if (crcl === 60) notes.push('The label\'s two tables differ at exactly 60 mL/min: the reflux table lowers the dose at 60 or below, the gastroparesis table below 60.');
  notes.push('The label says to avoid treatment for longer than 12 weeks.', `Label: ${row.edition}.`);
  return { valid: true, regimen: reg.value, drug: 'metoclopramide', flag: 'dose', reducedGroup: dialysis !== 'none' || why.length > 0, maxDaily: max, abnormal: false, band: `The Reglan label gives ${text}, with a maximum of ${max} mg a day.`, bandLabel: `Maximum ${max} mg/day`, notes, note: NOTE };
}

export function giDrugDoseCheck(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const id = yn(o.regimen);
  const meto = METOCLOPRAMIDE.find((r) => r.value === id);
  if (meto) return metoclopramide(meto, o, now, table);
  return bandToolAnswer({ regimens: FAMOTIDINE, labels: LABELS, note: NOTE, notesFor: () => ['The famotidine table is the recommended maximum dosage; the label says to use the lowest effective dose. It is for adults and for pediatric patients of 40 kg and more.'] }, o, now, table);
}
