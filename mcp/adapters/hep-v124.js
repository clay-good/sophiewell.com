// spec-v183: adapters for the six lib/hep-v124.js hepatology function-and-
// fibrosis instruments. dom keys mirror views/group-v124.js and
// META.example.fields; arg names mirror the lib signatures.

import * as M from '../../lib/hep-v124.js';

export default [
  {
    id: 'albi-grade',
    summary: 'Albumin-Bilirubin (ALBI) grade (Johnson 2015): an objective liver-function grade from albumin and bilirubin alone.',
    compute: M.albiGrade,
    fields: [
      { dom: 'al-alb', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/dL' },
      { dom: 'al-bili', arg: 'bilirubin', kind: 'number', required: true, label: 'Total bilirubin', unit: 'mg/dL' },
    ],
  },
  {
    id: 'meld-xi',
    summary: 'MELD-XI (Heuman 2007): the INR-independent MELD for the anticoagulated patient whose INR is uninterpretable.',
    compute: M.meldXi,
    fields: [
      { dom: 'mx-bili', arg: 'bilirubin', kind: 'number', required: true, label: 'Total bilirubin', unit: 'mg/dL' },
      { dom: 'mx-creat', arg: 'creatinine', kind: 'number', required: true, label: 'Serum creatinine', unit: 'mg/dL' },
    ],
  },
  {
    id: 'forns-index',
    summary: 'Forns index for HCV fibrosis (Forns 2002): a four-variable serum estimate of significant fibrosis.',
    compute: M.fornsIndex,
    fields: [
      { dom: 'fo-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'fo-ggt', arg: 'ggt', kind: 'number', required: true, label: 'GGT', unit: 'U/L' },
      { dom: 'fo-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '10^9/L' },
      { dom: 'fo-chol', arg: 'cholesterol', kind: 'number', required: true, label: 'Total cholesterol', unit: 'mg/dL' },
    ],
  },
  {
    id: 'bard-score',
    summary: 'BARD score for NAFLD advanced fibrosis (Harrison 2008): BMI >= 28 (+1), AST/ALT ratio >= 0.8 (+2), diabetes (+1).',
    compute: M.bardScore,
    fields: [
      { dom: 'bd-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m^2' },
      { dom: 'bd-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'U/L' },
      { dom: 'bd-alt', arg: 'alt', kind: 'number', required: true, label: 'ALT', unit: 'U/L' },
      { dom: 'bd-dm', arg: 'diabetes', kind: 'bool', label: 'Diabetes mellitus' },
    ],
  },
  {
    id: 'fatty-liver-index',
    summary: 'Fatty Liver Index (Bedogni 2006): a logistic steatosis-probability index from triglycerides, BMI, GGT, and waist.',
    compute: M.fattyLiverIndex,
    fields: [
      { dom: 'fl-tg', arg: 'tg', kind: 'number', required: true, label: 'Triglycerides', unit: 'mg/dL' },
      { dom: 'fl-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m^2' },
      { dom: 'fl-ggt', arg: 'ggt', kind: 'number', required: true, label: 'GGT', unit: 'U/L' },
      { dom: 'fl-waist', arg: 'waist', kind: 'number', required: true, label: 'Waist circumference', unit: 'cm' },
    ],
  },
  {
    id: 'lok-index',
    summary: 'Lok index for cirrhosis (Lok 2005, HALT-C): a logistic probability from platelets, the AST/ALT ratio, and INR.',
    compute: M.lokIndex,
    fields: [
      { dom: 'lk-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: '10^9/L' },
      { dom: 'lk-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'U/L' },
      { dom: 'lk-alt', arg: 'alt', kind: 'number', required: true, label: 'ALT', unit: 'U/L' },
      { dom: 'lk-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
    ],
  },
];
