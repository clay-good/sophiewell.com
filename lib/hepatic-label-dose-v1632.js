// spec-v1632 tool 18: what the label gives for a Child-Pugh class.
//
// Fourteen label rows (spec-v1628 section 1). Each hepatic sentence was re-read on October 11, 2026
// in the label's own section; the cells below are close to verbatim:
//   Vfend 2.5; Cancidas 2.4; Tygacil 2.2; ondansetron tablets (Dr. Reddy's) 2.2; Strattera 2.4;
//   Pristiq 2.3; Reglan Tables 1 and 2; Entresto section 2 and 8.6; Myrbetriq Table 3; solifenacin
//   tablets (Glenmark) 2.3; argatroban 2.4; Paxlovid 2.4; Vimpat 2.5; Baraclude 2.5.
//
// A class the label has no sentence for returns no dose, with a sentence saying so. Where a label
// speaks of mild, moderate and severe impairment without Child-Pugh (lacosamide), the tool shows the
// label's words and does not map them to a class. Adults.
//
// Pure: no DOM, no network; `now` is passed in.

import { labelRow } from './label-row.js';

const D = 'dose'; const NA = 'no-adjustment'; const NR = 'not-recommended'; const NG = 'no-recommendation-given';
const c = (text, flag) => ({ text, flag });
const NONE = c('no row: the label\'s dosing section has no hepatic sentence for this class', NG);

// rows: { A, B, C } by Child-Pugh class.
export const DRUGS = [
  { value: 'voriconazole', text: 'Voriconazole (Vfend)', brand: 'Vfend', setId: 'ce3ef5cf-3087-4d92-9d94-9eb8287228db', rows: { A: c('the usual loading dose regimen, with the maintenance dose halved', D), B: c('the usual loading dose regimen, with the maintenance dose halved', D), C: c('no dose: there are no pharmacokinetic data to allow dosage recommendations in severe hepatic impairment', NG) } },
  { value: 'caspofungin', text: 'Caspofungin (Cancidas)', brand: 'Cancidas', setId: '3bad23a6-09a6-4194-9182-093ed61bc71c', rows: { A: c('no dosage adjustment (Child-Pugh score 5 to 6)', NA), B: c('35 mg once daily, with a 70 mg loading dose on day 1 where appropriate (Child-Pugh score 7 to 9)', D), C: c('no dose: there is no clinical experience in severe hepatic impairment (Child-Pugh score greater than 9)', NG) } },
  { value: 'tigecycline', text: 'Tigecycline (Tygacil)', brand: 'Tygacil', setId: '2ccdb48e-c14a-4eeb-348c-4920ccfd7465', rows: { A: c('no dosage adjustment', NA), B: c('no dosage adjustment', NA), C: c('an initial dose of 100 mg, then a reduced maintenance dose of 25 mg every 12 hours, with caution and monitoring for response', D) } },
  { value: 'ondansetron', text: 'Ondansetron tablets', brand: 'ondansetron', setId: '162f2088-9fb1-47e7-b88c-45104be7e7bb', rows: { A: NONE, B: NONE, C: c('a total daily dose not above 8 mg (severe hepatic impairment, Child-Pugh score of 10 or greater)', D) } },
  { value: 'atomoxetine', text: 'Atomoxetine (Strattera)', brand: 'Strattera', setId: '309de576-c318-404a-bc15-660c2b1876fb', rows: { A: c('the same initial and target dosage as with normal hepatic function', NA), B: c('an initial and target dosage of 50% of that with normal hepatic function', D), C: c('an initial and target dosage of 25% of that with normal hepatic function', D) } },
  { value: 'desvenlafaxine', text: 'Desvenlafaxine (Pristiq)', brand: 'Pristiq', setId: '0f43610c-f290-46ea-d186-4f998ed99fce', rows: { A: NONE, B: c('50 mg per day; dose escalation above 100 mg per day is not recommended (moderate to severe, Child-Pugh score 7 to 15)', D), C: c('50 mg per day; dose escalation above 100 mg per day is not recommended (moderate to severe, Child-Pugh score 7 to 15)', D) } },
  { value: 'metoclopramide', text: 'Metoclopramide (Reglan)', brand: 'Reglan', setId: 'de55c133-eb08-4a35-91a2-5dc093027397', rows: { A: c('the adult dosage (mild hepatic impairment sits with adult patients in its tables)', NA), B: c('a reduced dose: reflux, 5 mg four times daily or 10 mg three times daily, maximum 30 mg a day; diabetic gastroparesis, 5 mg four times daily, maximum 20 mg a day', D), C: c('a reduced dose: reflux, 5 mg four times daily or 10 mg three times daily, maximum 30 mg a day; diabetic gastroparesis, 5 mg four times daily, maximum 20 mg a day', D) } },
  { value: 'sacubitril-valsartan', text: 'Sacubitril-valsartan (Entresto)', brand: 'Entresto', setId: '000dc81d-ab91-450c-8eae-8eb74e72296f', rows: { A: c('no starting dose adjustment', NA), B: c('a start at half the usually recommended starting dose, then the usual dose escalation', D), C: c('not recommended: no studies have been conducted in severe hepatic impairment', NR) } },
  { value: 'mirabegron', text: 'Mirabegron (Myrbetriq)', brand: 'Myrbetriq', setId: 'ba9e9e15-e666-4c56-9271-2e24739cfa2d', rows: { A: c('a starting dose of 25 mg once daily, with a maximum of 50 mg', D), B: c('a starting dose of 25 mg once daily, with a maximum of 25 mg', D), C: c('not recommended', NR) } },
  { value: 'solifenacin', text: 'Solifenacin tablets', brand: 'solifenacin', setId: '010c0657-c907-477f-8bd7-5d455a5f50eb', rows: { A: NONE, B: c('a dose not above 5 mg once daily', D), C: c('do not use in severe hepatic impairment', NR) } },
  { value: 'argatroban', text: 'Argatroban (heparin-induced thrombocytopenia)', brand: 'argatroban', setId: '0cdf3f67-5bf3-4d58-b330-03febdc652bf', rows: { A: NONE, B: c('an initial dose of 0.5 mcg/kg/min (moderate or severe hepatic impairment)', D), C: c('an initial dose of 0.5 mcg/kg/min (moderate or severe hepatic impairment)', D) } },
  { value: 'nirmatrelvir-ritonavir', text: 'Nirmatrelvir with ritonavir (Paxlovid)', brand: 'Paxlovid', setId: '8a99d6d6-fd9e-45bb-b1bf-48c7f761232a', rows: { A: c('no dosage adjustment', NA), B: c('no dosage adjustment', NA), C: c('not recommended: no pharmacokinetic or safety data in severe hepatic impairment', NR) } },
  { value: 'lacosamide', text: 'Lacosamide (Vimpat)', brand: 'Vimpat', setId: '9e79b42c-38a3-4b2c-a196-a5a1948250e2', undefinedTerms: true, words: 'for mild or moderate hepatic impairment, a reduction of 25% of the maximum dosage is recommended; use is not recommended in severe hepatic impairment.' },
  { value: 'entecavir', text: 'Entecavir (Baraclude)', brand: 'Baraclude', setId: '046e61c9-9298-4b2e-b76e-b26b81fecd20', rows: { A: c('no dosage adjustment for hepatic impairment', NA), B: c('no dosage adjustment for hepatic impairment', NA), C: c('no dosage adjustment for hepatic impairment', NA) } },
];
export const CLASSES = [
  { value: 'A', text: 'Child-Pugh A (score 5 to 6)' },
  { value: 'B', text: 'Child-Pugh B (score 7 to 9)' },
  { value: 'C', text: 'Child-Pugh C (score 10 to 15)' },
];
const NOTE = 'This reports the hepatic row of the label for the class entered. It is not a recommendation and it covers adults. A class the label has no sentence for is reported as that, not filled in from a neighbor.';
const SHORT = { dose: 'Dose given', 'no-adjustment': 'No adjustment', 'not-recommended': 'Not recommended', 'no-recommendation-given': 'No row given' };

export function hepaticLabelDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = DRUGS.find((d) => d.value === String(o.drug ?? '').trim());
  if (!drug) return { valid: false, message: 'Choose the drug. Each label gives its own hepatic row.' };
  const cls = CLASSES.find((k) => k.value === String(o.childPugh ?? '').trim().toUpperCase());
  if (!cls) return { valid: false, message: 'Choose the Child-Pugh class: A, B or C.' };
  const row = labelRow(drug.setId, now, table);
  if (!row.answers) {
    return { valid: true, withheld: true, labelUrl: row.url, drug: drug.value, band: `The ${drug.brand} label's hepatic row is withheld, so nothing is reported.`, bandLabel: 'Withheld', notes: [`The ${drug.brand} label row is withheld: ${row.why}.`, 'Read the row from the label in hand.'], note: NOTE };
  }
  if (drug.undefinedTerms) {
    return {
      valid: true, drug: drug.value, childPugh: cls.value, flag: 'not-by-child-pugh', abnormal: false,
      band: `The ${drug.brand} label does not state its hepatic rows by Child-Pugh class, so none is picked for class ${cls.value}. Its words: ${drug.words}`,
      bandLabel: 'Not by Child-Pugh',
      notes: ['The label speaks of mild, moderate and severe hepatic impairment without defining them; this tool does not map them to a class.', `Label: ${row.edition}.`], note: NOTE,
    };
  }
  const cell = drug.rows[cls.value];
  const plain = cell.flag === 'dose' || cell.flag === 'no-adjustment';
  const notes = [];
  if (drug.value === 'ondansetron' || drug.value === 'desvenlafaxine' || drug.value === 'caspofungin') notes.push(`The ${drug.brand} label states its hepatic rows by Child-Pugh score.`);
  notes.push(`Label: ${row.edition}.`);
  return {
    valid: true, drug: drug.value, childPugh: cls.value, flag: cell.flag, abnormal: cell.flag === 'not-recommended' || cell.flag === 'no-recommendation-given',
    band: plain ? `The ${drug.brand} label gives ${cell.text} for Child-Pugh ${cls.value}.` : `The ${drug.brand} label's row for Child-Pugh ${cls.value} reads: ${cell.text}.`,
    bandLabel: SHORT[cell.flag], notes, note: NOTE,
  };
}
