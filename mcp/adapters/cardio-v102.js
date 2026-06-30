// spec-v183 MCP wave 5: adapters for the four lib/cardio-v102.js heart-failure
// risk / probability instruments. dom keys mirror views/group-v102.js and
// META.example.fields; arg names mirror the lib signatures. Checkbox criteria
// are bools (the lib's onFlag accepts the normalized boolean); NYHA class and
// the HFA-PEFF domain scores are enums; the continuous vitals/labs are numbers.

import * as F from '../../lib/cardio-v102.js';

export default [
  {
    id: 'maggic',
    summary: 'MAGGIC heart-failure risk score (Pocock 2013): a 0-50 weighted point sum over age, sex, LVEF, NYHA class, systolic BP, BMI, creatinine, diabetes, COPD, smoking, HF duration, and beta-blocker / ACE-ARB use, mapped to 1-year and 3-year all-cause mortality.',
    compute: F.maggic,
    fields: [
      { dom: 'mg-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'mg-male', arg: 'male', kind: 'bool', label: 'Male sex' },
      { dom: 'mg-ef', arg: 'lvef', kind: 'number', required: true, label: 'LV ejection fraction', unit: '%' },
      { dom: 'mg-nyha', arg: 'nyha', kind: 'enum', values: ['1', '2', '3', '4'], required: true, label: 'NYHA class' },
      { dom: 'mg-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'mg-bmi', arg: 'bmi', kind: 'number', required: true, label: 'Body mass index', unit: 'kg/m^2' },
      { dom: 'mg-creat', arg: 'creatinine', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
      { dom: 'mg-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
      { dom: 'mg-copd', arg: 'copd', kind: 'bool', label: 'COPD' },
      { dom: 'mg-smoker', arg: 'smoker', kind: 'bool', label: 'Current smoker' },
      { dom: 'mg-hfdur', arg: 'hfOver18mo', kind: 'bool', label: 'HF first diagnosed >= 18 months ago' },
      { dom: 'mg-bb', arg: 'onBetaBlocker', kind: 'bool', label: 'On a beta-blocker' },
      { dom: 'mg-ace', arg: 'onAceArb', kind: 'bool', label: 'On an ACE inhibitor / ARB' },
    ],
  },
  {
    id: 'h2fpef',
    summary: 'H2FPEF score (Reddy 2018): obesity (2) + >= 2 antihypertensives (1) + atrial fibrillation (3) + pulmonary hypertension (1) + age > 60 (1) + echo E/e′ > 9 (1); total 0-9 mapped to low / intermediate / high probability of HFpEF.',
    compute: F.h2fpef,
    fields: [
      { dom: 'h2-bmi', arg: 'obese', kind: 'bool', label: 'Obese (BMI > 30)' },
      { dom: 'h2-htn', arg: 'antihypertensives', kind: 'bool', label: '>= 2 antihypertensive medications' },
      { dom: 'h2-af', arg: 'afib', kind: 'bool', label: 'Atrial fibrillation' },
      { dom: 'h2-ph', arg: 'pulmHtn', kind: 'bool', label: 'Pulmonary hypertension (PASP > 35)' },
      { dom: 'h2-age', arg: 'ageOver60', kind: 'bool', label: 'Age > 60 years' },
      { dom: 'h2-ee', arg: 'eeOver9', kind: 'bool', label: 'Echo E/e′ > 9' },
    ],
  },
  {
    id: 'hfa-peff',
    summary: 'HFA-PEFF diagnostic score (Pieske 2019): functional, morphological, and biomarker domains each scored none (0) / minor (1) / major (2); total 0-6 with >= 5 confirming and 2-4 an intermediate probability of HFpEF.',
    compute: F.hfaPeff,
    fields: [
      { dom: 'hp-functional', arg: 'functional', kind: 'enum', values: ['none', 'minor', 'major'], label: 'Functional domain (echo E/e′, e′, TR velocity)' },
      { dom: 'hp-morphological', arg: 'morphological', kind: 'enum', values: ['none', 'minor', 'major'], label: 'Morphological domain (LAVI, LV mass, RWT)' },
      { dom: 'hp-biomarker', arg: 'biomarker', kind: 'enum', values: ['none', 'minor', 'major'], label: 'Biomarker domain (NT-proBNP / BNP)' },
    ],
  },
  {
    id: 'cardshock-score',
    summary: 'CardShock risk score (Harjola 2015): age > 75 (1) + confusion (1) + prior MI/CABG (1) + ACS etiology (1) + LVEF < 40 (1) + lactate band + eGFR band; the 0-9 sum maps to graded in-hospital mortality.',
    compute: F.cardShock,
    fields: [
      { dom: 'cs-age', arg: 'ageOver75', kind: 'bool', label: 'Age > 75 years' },
      { dom: 'cs-confusion', arg: 'confusion', kind: 'bool', label: 'Confusion at presentation' },
      { dom: 'cs-mi', arg: 'priorMiCabg', kind: 'bool', label: 'Previous MI or CABG' },
      { dom: 'cs-acs', arg: 'acs', kind: 'bool', label: 'ACS etiology' },
      { dom: 'cs-ef', arg: 'lowEf', kind: 'bool', label: 'LVEF < 40%' },
      { dom: 'cs-lactate', arg: 'lactate', kind: 'number', required: true, label: 'Blood lactate', unit: 'mmol/L' },
      { dom: 'cs-egfr', arg: 'egfr', kind: 'number', required: true, label: 'eGFR', unit: 'mL/min/1.73m^2' },
    ],
  },
];
