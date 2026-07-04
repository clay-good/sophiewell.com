// spec-v183 MCP wave 41: adapters for the seven metabolic / hepatic indices in
// lib/metabolic-hepatic-v219.js — the ADA and Cambridge diabetes-risk scores,
// the lipid accumulation product, the visceral adiposity index, the conicity
// index, the AST/ALT (De Ritis) ratio, and the GGT-to-platelet ratio. dom keys
// mirror views/group-v219.js. The Cambridge family-history and smoking selects
// carry numeric-string values (modeled as enums); the rest are numeric labs /
// anthropometry and boolean flags.

import * as F from '../../lib/metabolic-hepatic-v219.js';

export default [
  {
    id: 'ada-diabetes-risk-test',
    summary: 'ADA diabetes risk test: age, BMI, male sex, gestational-diabetes history, first-degree relative, hypertension, and physical inactivity give a score where ≥ 5 flags a patient to screen for diabetes/prediabetes.',
    compute: F.adaDiabetesRisk,
    fields: [
      { dom: 'ada-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ada-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m²' },
      { dom: 'ada-male', arg: 'male', kind: 'bool', required: false, label: 'Male sex' },
      { dom: 'ada-gdm', arg: 'gdm', kind: 'bool', required: false, label: 'History of gestational diabetes' },
      { dom: 'ada-rel', arg: 'relative', kind: 'bool', required: false, label: 'First-degree relative with diabetes' },
      { dom: 'ada-htn', arg: 'hypertension', kind: 'bool', required: false, label: 'Hypertension' },
      { dom: 'ada-inactive', arg: 'inactive', kind: 'bool', required: false, label: 'Physically inactive' },
    ],
  },
  {
    id: 'cambridge-diabetes-risk',
    summary: 'Cambridge Diabetes Risk Score (Griffin 2000): a logistic probability of undiagnosed type 2 diabetes from age, sex, BMI, family history, smoking, and antihypertensive/steroid use.',
    compute: F.cambridgeDiabetes,
    fields: [
      { dom: 'camb-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'camb-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m²' },
      { dom: 'camb-female', arg: 'female', kind: 'bool', required: false, label: 'Female sex' },
      { dom: 'camb-htn', arg: 'antihypertensive', kind: 'bool', required: false, label: 'Antihypertensive medication' },
      { dom: 'camb-steroid', arg: 'steroids', kind: 'bool', required: false, label: 'Steroid medication' },
      { dom: 'camb-fhx', arg: 'familyHistory', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Family history of diabetes' },
      { dom: 'camb-smoke', arg: 'smoking', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Smoking status' },
    ],
  },
  {
    id: 'lipid-accumulation-product',
    summary: 'Lipid Accumulation Product (Kahn 2005): (waist − 65) × triglycerides in men, (waist − 58) × triglycerides in women (mmol/L); a higher value marks greater central lipid accumulation.',
    compute: F.lap,
    fields: [
      { dom: 'lap-wc', arg: 'waist', kind: 'number', required: true, label: 'Waist circumference', unit: 'cm' },
      { dom: 'lap-tg', arg: 'triglycerides', kind: 'number', required: true, label: 'Triglycerides', unit: 'mmol/L' },
      { dom: 'lap-female', arg: 'female', kind: 'bool', required: false, label: 'Female sex' },
    ],
  },
  {
    id: 'visceral-adiposity-index',
    summary: 'Visceral Adiposity Index (Amato 2010): a sex-specific function of waist, BMI, triglycerides, and HDL (mmol/L); ~1 is typical in healthy non-obese adults, higher suggests visceral-fat dysfunction.',
    compute: F.vai,
    fields: [
      { dom: 'vai-wc', arg: 'waist', kind: 'number', required: true, label: 'Waist circumference', unit: 'cm' },
      { dom: 'vai-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m²' },
      { dom: 'vai-tg', arg: 'triglycerides', kind: 'number', required: true, label: 'Triglycerides', unit: 'mmol/L' },
      { dom: 'vai-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mmol/L' },
      { dom: 'vai-female', arg: 'female', kind: 'bool', required: false, label: 'Female sex' },
    ],
  },
  {
    id: 'conicity-index',
    summary: 'Conicity Index (Valdez 1991): waist (m) / (0.109 × √(weight (kg) / height (m))); a higher value marks greater central adiposity.',
    compute: F.conicity,
    fields: [
      { dom: 'con-wc', arg: 'waist', kind: 'number', required: true, label: 'Waist circumference', unit: 'cm' },
      { dom: 'con-wt', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'con-ht', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
    ],
  },
  {
    id: 'ast-alt-ratio',
    summary: 'AST/ALT (De Ritis) ratio: AST / ALT; < 1 suggests NAFLD/viral/acute injury, 1–2 advanced fibrosis, and > 2 classic alcoholic liver disease.',
    compute: F.astAltRatio,
    fields: [
      { dom: 'aar-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'IU/L' },
      { dom: 'aar-alt', arg: 'alt', kind: 'number', required: true, label: 'ALT', unit: 'IU/L' },
    ],
  },
  {
    id: 'ggt-platelet-ratio',
    summary: 'GGT-to-platelet ratio (Lemoine 2016): (GGT/ULN)/platelets × 100; a cutoff of 0.32 predicts significant fibrosis.',
    compute: F.ggtPlatelet,
    fields: [
      { dom: 'gpr-ggt', arg: 'ggt', kind: 'number', required: true, label: 'GGT', unit: 'IU/L' },
      { dom: 'gpr-uln', arg: 'ggtUln', kind: 'number', required: true, label: 'Upper limit of normal for GGT', unit: 'IU/L' },
      { dom: 'gpr-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '×10⁹/L' },
    ],
  },
];
