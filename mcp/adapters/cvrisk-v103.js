// spec-v183 MCP wave 5: adapters for the six lib/cvrisk-v103.js cardiovascular-
// risk engines. dom keys mirror views/group-v103.js and META.example.fields; arg
// names mirror the lib signatures. Sex is a boolean male flag ('1'/'0' in the
// example; the lib's onFlag maps it to 'male'/'female'); region / race / unit are
// enums; the continuous risk-factor labs and vitals are numbers.

import * as F from '../../lib/cvrisk-v103.js';

const REGIONS = ['low', 'moderate', 'high', 'very-high'];

export default [
  {
    id: 'score2',
    summary: 'SCORE2 (ESC 2021): the European 10-year fatal + non-fatal CVD risk for apparently-healthy adults 40-69, calibrated to one of four risk regions, from age, sex, smoking, systolic BP, and total / HDL cholesterol (mmol/L).',
    compute: F.score2,
    fields: [
      { dom: 's2-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 's2-sex', arg: 'male', kind: 'bool', label: 'Male sex' },
      { dom: 's2-smoke', arg: 'smoker', kind: 'bool', label: 'Current smoker' },
      { dom: 's2-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 's2-tc', arg: 'totalChol', kind: 'number', required: true, label: 'Total cholesterol', unit: 'mmol/L' },
      { dom: 's2-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mmol/L' },
      { dom: 's2-region', arg: 'region', kind: 'enum', values: REGIONS, required: true, label: 'Calibration risk region' },
    ],
  },
  {
    id: 'score2-op',
    summary: 'SCORE2-OP (ESC 2021): the older-persons 10-year fatal + non-fatal CVD risk for adults >= 70, region-calibrated, from age, sex, smoking, diabetes, systolic BP, and total / HDL cholesterol (mmol/L).',
    compute: F.score2Op,
    fields: [
      { dom: 'op-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'op-sex', arg: 'male', kind: 'bool', label: 'Male sex' },
      { dom: 'op-smoke', arg: 'smoker', kind: 'bool', label: 'Current smoker' },
      { dom: 'op-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
      { dom: 'op-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'op-tc', arg: 'totalChol', kind: 'number', required: true, label: 'Total cholesterol', unit: 'mmol/L' },
      { dom: 'op-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mmol/L' },
      { dom: 'op-region', arg: 'region', kind: 'enum', values: REGIONS, required: true, label: 'Calibration risk region' },
    ],
  },
  {
    id: 'mesa-chd',
    summary: 'MESA 10-year CHD risk (McClelland 2015): the Multi-Ethnic Study of Atherosclerosis engine, with and without the coronary artery calcium (Agatston) score, from age, sex, race/ethnicity, lipids, BP, diabetes, smoking, family history, and lipid/BP medication.',
    compute: F.mesaChd,
    fields: [
      { dom: 'mesa-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'mesa-sex', arg: 'male', kind: 'bool', label: 'Male sex' },
      { dom: 'mesa-race', arg: 'race', kind: 'enum', values: ['white', 'chinese', 'black', 'hispanic'], required: true, label: 'Race / ethnicity' },
      { dom: 'mesa-tc', arg: 'totalChol', kind: 'number', required: true, label: 'Total cholesterol', unit: 'mg/dL' },
      { dom: 'mesa-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mg/dL' },
      { dom: 'mesa-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'mesa-cac', arg: 'cac', kind: 'number', label: 'Coronary artery calcium (Agatston, optional)' },
      { dom: 'mesa-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
      { dom: 'mesa-smoke', arg: 'smoker', kind: 'bool', label: 'Current smoker' },
      { dom: 'mesa-lipid', arg: 'lipidMed', kind: 'bool', label: 'On lipid-lowering medication' },
      { dom: 'mesa-bp', arg: 'bpMed', kind: 'bool', label: 'On blood-pressure medication' },
      { dom: 'mesa-fh', arg: 'familyHx', kind: 'bool', label: 'Family history of heart attack' },
    ],
  },
  {
    id: 'framingham-cvd',
    summary: "Framingham general CVD risk (D'Agostino 2008): 10-year risk of a first cardiovascular event and the implied vascular age, from age, sex, total / HDL cholesterol, systolic BP (treated or not), smoking, and diabetes.",
    compute: F.framinghamCvd,
    fields: [
      { dom: 'fr-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'fr-sex', arg: 'male', kind: 'bool', label: 'Male sex' },
      { dom: 'fr-tc', arg: 'totalChol', kind: 'number', required: true, label: 'Total cholesterol', unit: 'mg/dL' },
      { dom: 'fr-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mg/dL' },
      { dom: 'fr-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'fr-bp', arg: 'bpTreated', kind: 'bool', label: 'On antihypertensive treatment' },
      { dom: 'fr-smoke', arg: 'smoker', kind: 'bool', label: 'Current smoker' },
      { dom: 'fr-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
    ],
  },
  {
    id: 'reynolds-risk',
    summary: 'Reynolds Risk Score (Ridker 2007/2008): 10-year cardiovascular risk adding high-sensitivity CRP and family history of premature MI to age, sex, BP, lipids, and smoking (with HbA1c for diabetic women).',
    compute: F.reynoldsRisk,
    fields: [
      { dom: 'rr-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'rr-sex', arg: 'male', kind: 'bool', label: 'Male sex' },
      { dom: 'rr-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'rr-tc', arg: 'totalChol', kind: 'number', required: true, label: 'Total cholesterol', unit: 'mg/dL' },
      { dom: 'rr-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mg/dL' },
      { dom: 'rr-crp', arg: 'hsCrp', kind: 'number', required: true, label: 'High-sensitivity CRP', unit: 'mg/L' },
      { dom: 'rr-smoke', arg: 'smoker', kind: 'bool', label: 'Current smoker' },
      { dom: 'rr-fh', arg: 'familyHx', kind: 'bool', label: 'Family history of premature MI' },
      { dom: 'rr-dm', arg: 'diabetic', kind: 'bool', label: 'Diabetes mellitus' },
      { dom: 'rr-a1c', arg: 'hba1c', kind: 'number', label: 'HbA1c (optional, diabetic women)', unit: '%' },
    ],
  },
  {
    id: 'non-hdl-remnant',
    summary: 'Non-HDL and remnant cholesterol: non-HDL = total - HDL (against the 130 mg/dL guideline target) and remnant = non-HDL - LDL, in mg/dL or mmol/L.',
    compute: F.nonHdlRemnant,
    fields: [
      { dom: 'nh-unit', arg: 'unit', kind: 'enum', values: ['mg', 'mmol'], label: 'Cholesterol unit' },
      { dom: 'nh-tc', arg: 'totalChol', kind: 'number', required: true, label: 'Total cholesterol' },
      { dom: 'nh-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol' },
      { dom: 'nh-ldl', arg: 'ldl', kind: 'number', label: 'LDL cholesterol (optional, for remnant)' },
    ],
  },
];
