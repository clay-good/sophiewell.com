// spec-v183 MCP wave 55: adapters for the four quantitative bedside estimators in
// lib/estimators-v233.js — the Evans index, the frontal-occipital horn ratio (FOHR),
// the age-adjusted D-dimer threshold, and the Deurenberg body-fat estimate. dom keys
// mirror views/group-v233.js; all inputs are numeric except the Deurenberg sex enum.

import * as F from '../../lib/estimators-v233.js';

export default [
  {
    id: 'evans-index',
    summary: 'Evans index: maximum frontal-horn width / inner-skull (biparietal) diameter on the same axial slice; > 0.30 defines ventricular enlargement (radiologic hydrocephalus threshold).',
    compute: F.evansIndex,
    fields: [
      { dom: 'ev-frontal', arg: 'frontal', kind: 'number', required: true, label: 'Maximum frontal-horn width', unit: 'mm' },
      { dom: 'ev-skull', arg: 'skull', kind: 'number', required: true, label: 'Maximum inner-skull (biparietal) diameter', unit: 'mm' },
    ],
  },
  {
    id: 'fohr',
    summary: 'Frontal-occipital horn ratio: (frontal-horn + occipital-horn width) / (2 × biparietal diameter); >= 0.55 marks clinically significant ventriculomegaly.',
    compute: F.fohr,
    fields: [
      { dom: 'fo-frontal', arg: 'frontal', kind: 'number', required: true, label: 'Maximum frontal-horn width', unit: 'mm' },
      { dom: 'fo-occipital', arg: 'occipital', kind: 'number', required: true, label: 'Maximum occipital-horn width', unit: 'mm' },
      { dom: 'fo-bpd', arg: 'bpd', kind: 'number', required: true, label: 'Biparietal diameter', unit: 'mm' },
    ],
  },
  {
    id: 'age-adjusted-d-dimer',
    summary: 'Age-adjusted D-dimer cutoff (ADJUST-PE, JAMA 2014): 500 ug/L up to age 50 and age × 10 ug/L above age 50; below the cutoff makes VTE unlikely at a non-high pretest probability.',
    compute: F.ageAdjustedDDimer,
    fields: [
      { dom: 'add-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'add-dd', arg: 'ddimer', kind: 'number', required: true, label: 'D-dimer', unit: 'ug/L FEU' },
    ],
  },
  {
    id: 'deurenberg-body-fat',
    summary: 'Deurenberg body-fat % estimate (Br J Nutr 1991) = 1.20 × BMI + 0.23 × age - 10.8 × sex - 5.4 (male = 1, female = 0), with the ACE body-fat category; a BMI-based estimate, not a measured composition.',
    compute: F.deurenberg,
    fields: [
      { dom: 'db-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m^2' },
      { dom: 'db-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'db-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: true, label: 'Sex' },
    ],
  },
];
