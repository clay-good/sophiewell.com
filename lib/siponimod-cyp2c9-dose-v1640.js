// spec-v1640 tool 7: the siponimod (Mayzent) titration and maintenance dosage the label gives for a
// CYP2C9 genotype.
//
// Source, re-read October 13, 2026 (DailyMed, Novartis; set id 44492772-5aed-4627-bd85-e8e89f308bb3,
// version 17, published July 10, 2026):
//   2.2 "Recommended Dosage in Patients With CYP2C9 Genotypes *1/*1, *1/*2, or *2/*2": "the
//     recommended maintenance dosage of MAYZENT is 2 mg taken orally once daily starting on Day 6."
//     Table 1: Day 1 0.25 mg, Day 2 0.25 mg, Day 3 0.50 mg, Day 4 0.75 mg, Day 5 1.25 mg. "A
//     12-tablet starter pack should be used".
//   2.3 "Recommended Dosage in Patients With CYP2C9 Genotypes *1/*3 or *2/*3": "the recommended
//     maintenance dosage of MAYZENT is 1 mg taken orally once daily starting on Day 5." Table 2: Day 1
//     0.25 mg, Day 2 0.25 mg, Day 3 0.50 mg, Day 4 0.75 mg. "A 7-tablet starter pack should be used".
//   Both: "If one titration dose is missed for more than 24 hours, treatment needs to be reinitiated
//     with Day 1 of the titration regimen."
//   4: "MAYZENT is contraindicated in patients who have: A CYP2C9*3/*3 genotype".
//   8.6: "The impact of variants other than *2 and *3 on the pharmacokinetics of siponimod has not
//     been evaluated. It is anticipated that variants that result in loss of CYP2C9 function (e.g.,
//     *6) will have similar effects on siponimod pharmacokinetics as the *3 variant".
//
// The label doses by genotype, not by phenotype: *2/*2 is in the 2 mg group and *1/*3 in the 1 mg
// group, though both are intermediate metabolizers by activity score. Nothing here routes through a
// phenotype.
//
// Pure: no DOM, no network. `now` is read only to check that the label edition still stands.

import { labelRow } from './label-row.js';

export const MAYZENT = '44492772-5aed-4627-bd85-e8e89f308bb3';
export const GENOTYPES = [
  { value: '*1/*1', text: '*1/*1' },
  { value: '*1/*2', text: '*1/*2' },
  { value: '*2/*2', text: '*2/*2' },
  { value: '*1/*3', text: '*1/*3' },
  { value: '*2/*3', text: '*2/*3' },
  { value: '*3/*3', text: '*3/*3' },
  { value: 'other', text: 'Another genotype (an allele other than *1, *2 or *3)' },
];
const MISSED = '"If one titration dose is missed for more than 24 hours, treatment needs to be reinitiated with Day 1 of the titration regimen."';
const TEST = 'Section 2.1: "An FDA-cleared or -approved test for the detection of CYP2C9 variants to direct the use of siponimod is not currently available."';
const OTHER_CI = 'Section 4 also lists contraindications that are not genotypes (recent cardiac and cerebrovascular events, certain conduction blocks, hypersensitivity). They are not inputs here.';
const POSTURE = 'This is what the label states for the genotype on the report. It is not advice for a particular patient.';

export function siponimodCyp2c9Dose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const g = GENOTYPES.find((x) => x.value === String(o.genotype ?? '').trim());
  if (!g) return { valid: false, message: 'Choose the CYP2C9 genotype as the report prints it. The label doses by genotype, so a phenotype alone does not answer.' };
  const lr = labelRow(MAYZENT, now, table);
  const labelLinks = [{ text: 'Mayzent label on DailyMed', url: lr.url }];
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelLinks, band: `The Mayzent label figures are withheld: ${lr.why}. Read the dosage from the current label.`, bandLabel: 'Withheld', notes: [] };
  const tail = [`Label: ${lr.edition}.`, POSTURE];
  const base = { valid: true, withheld: false, genotype: g.value, labelLinks, bandLabel: g.value === 'other' ? 'Not *1, *2 or *3' : `CYP2C9 ${g.value}` };

  if (g.value === '*3/*3') {
    return { ...base, flag: 'contraindicated', abnormal: true, maintenanceMg: null, band: 'Contraindicated by the label for this genotype.', notes: ['Section 4: "MAYZENT is contraindicated in patients who have: A CYP2C9*3/*3 genotype".', OTHER_CI, ...tail] };
  }
  if (g.value === 'other') {
    return { ...base, flag: 'no-label-dosage', abnormal: true, maintenanceMg: null, band: 'The label gives no dosage for this genotype.', notes: [
      'Section 8.6: "The impact of variants other than *2 and *3 on the pharmacokinetics of siponimod has not been evaluated."',
      'The same section: "It is anticipated that variants that result in loss of CYP2C9 function (e.g., *6) will have similar effects on siponimod pharmacokinetics as the *3 variant". The label turns that into no dosage.',
      'Sections 2.2 and 2.3 name five genotypes only: *1/*1, *1/*2 and *2/*2 (2 mg), and *1/*3 and *2/*3 (1 mg). Section 4 names *3/*3.',
      ...tail,
    ] };
  }
  const low = g.value === '*1/*3' || g.value === '*2/*3';
  const days = low ? [0.25, 0.25, 0.5, 0.75] : [0.25, 0.25, 0.5, 0.75, 1.25];
  const maintenanceMg = low ? 1 : 2;
  const notes = [
    `Titration (Table ${low ? 2 : 1}), in 0.25 mg tablets: ${days.map((d, i) => `Day ${i + 1} ${d.toFixed(2)} mg`).join(', ')}.`,
    `Maintenance: ${maintenanceMg} mg once daily "starting on Day ${days.length + 1}". Section ${low ? '2.3' : '2.2'}: "A ${low ? 7 : 12}-tablet starter pack should be used for patients who will be titrated to the ${maintenanceMg}-mg maintenance dosage".`,
    MISSED,
    'The label doses by genotype, not by metabolizer phenotype: *2/*2 is in the 2 mg group and *1/*3 is in the 1 mg group.',
    TEST,
    OTHER_CI,
    ...tail,
  ];
  return { ...base, flag: low ? 'maintenance-1-mg' : 'maintenance-2-mg', abnormal: false, maintenanceMg, titrationMg: days, band: `Label dosage: a ${days.length}-day titration, then ${maintenanceMg} mg once daily starting on Day ${days.length + 1}.`, notes };
}
