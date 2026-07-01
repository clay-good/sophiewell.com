// spec-v183 MCP wave 13: adapters for the four lib/warfarin-v133.js warfarin
// dosing tiles. dom keys mirror views/group-v133.js and META.example.fields;
// arg names mirror the lib signatures (o.age, o.vkorc1, o.cyp2c9, o.inducer,
// o.day, o.inr3, …). Height / weight are consumed by the pure functions in
// cm / kg (the browser unit toggles convert before calling), so the adapter
// exposes them in those units directly. The yes/no clinical questions map to
// two-value enums the lib `flag()` helper reads (it distinguishes an explicit
// 'no' from a blank); the genotype and race selects pass their string values
// straight through to the lib lookup tables.

import * as F from '../../lib/warfarin-v133.js';

const YESNO = ['yes', 'no'];

export default [
  {
    id: 'warfarin-iwpc',
    summary: 'IWPC pharmacogenetic warfarin dose (Klein, NEJM 2009): a published linear model predicting the stable weekly maintenance dose from age, height, weight, race, enzyme-inducer and amiodarone use, and the VKORC1 / CYP2C9 genotypes.',
    compute: F.warfarinIwpc,
    fields: [
      { dom: 'iw-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'iw-ht', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'iw-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'iw-vk', arg: 'vkorc1', kind: 'enum', values: ['GG', 'AG', 'AA', 'unknown'], required: true, label: 'VKORC1 (-1639 G>A) genotype' },
      { dom: 'iw-cyp', arg: 'cyp2c9', kind: 'enum', values: ['*1/*1', '*1/*2', '*1/*3', '*2/*2', '*2/*3', '*3/*3', 'unknown'], required: true, label: 'CYP2C9 genotype' },
      { dom: 'iw-race', arg: 'race', kind: 'enum', values: ['white', 'asian', 'black', 'mixed'], required: true, label: 'Race / ethnicity' },
      { dom: 'iw-ind', arg: 'inducer', kind: 'enum', values: YESNO, required: true, label: 'Enzyme inducer (carbamazepine, phenytoin, rifampin)' },
      { dom: 'iw-amio', arg: 'amiodarone', kind: 'enum', values: YESNO, required: true, label: 'Amiodarone' },
    ],
  },
  {
    id: 'warfarin-gage',
    summary: 'Gage pharmacogenomic warfarin dose (Gage, Clin Pharmacol Ther 2008): a published exponential model predicting the therapeutic daily dose from body-surface area, age, target INR, smoking, amiodarone, race, DVT/PE indication, and the CYP2C9 / VKORC1 genotypes.',
    compute: F.warfarinGage,
    fields: [
      { dom: 'ga-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ga-ht', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'ga-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'ga-inr', arg: 'targetInr', kind: 'number', required: true, label: 'Target INR' },
      { dom: 'ga-vk', arg: 'vkorc1', kind: 'enum', values: ['GG', 'AG', 'AA'], required: true, label: 'VKORC1 (-1639 G>A) genotype' },
      { dom: 'ga-cyp', arg: 'cyp2c9', kind: 'enum', values: ['*1/*1', '*1/*2', '*1/*3', '*2/*2', '*2/*3', '*3/*3'], required: true, label: 'CYP2C9 genotype' },
      { dom: 'ga-amio', arg: 'amiodarone', kind: 'enum', values: YESNO, required: true, label: 'Amiodarone' },
      { dom: 'ga-smoke', arg: 'smoker', kind: 'enum', values: YESNO, required: true, label: 'Current smoker' },
      { dom: 'ga-aa', arg: 'africanAmerican', kind: 'enum', values: YESNO, required: true, label: 'African-American race' },
      { dom: 'ga-dvt', arg: 'dvtPe', kind: 'enum', values: YESNO, required: true, label: 'DVT / PE indication' },
    ],
  },
  {
    id: 'warfarin-init-10mg',
    summary: 'Kovacs 10 mg warfarin initiation nomogram (Kovacs, Ann Intern Med 2003): the early-day dose when genotype is unknown. Days 1–2 are a fixed 10 mg; the day-3 INR sets days 3–4 and the day-5 INR sets days 5–7.',
    compute: F.warfarinInit10mg,
    fields: [
      { dom: 'w10-day', arg: 'day', kind: 'number', required: true, label: 'Protocol day (1–7)' },
      { dom: 'w10-inr3', arg: 'inr3', kind: 'number', label: 'Day-3 INR (required from day 3)' },
      { dom: 'w10-inr5', arg: 'inr5', kind: 'number', label: 'Day-5 INR (required from day 5)' },
    ],
  },
  {
    id: 'warfarin-init-5mg',
    summary: 'Crowther 5 mg warfarin initiation nomogram (Crowther, Arch Intern Med 1999): the early-day dose when a lower starting dose is preferred. Days 1–2 are a fixed 5 mg; the daily INR from day 3 sets the subsequent dose.',
    compute: F.warfarinInit5mg,
    fields: [
      { dom: 'w5-day', arg: 'day', kind: 'number', required: true, label: 'Protocol day (1–6)' },
      { dom: 'w5-inr', arg: 'inr', kind: 'number', label: 'INR (required from day 3)' },
    ],
  },
];
