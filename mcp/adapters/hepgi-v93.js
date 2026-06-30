// spec-v183 MCP wave 5: adapters for six lib/hepgi-v93.js hepatology / GI
// severity and disease-activity instruments. dom keys mirror views/group-v93.js
// and META.example.fields; arg names mirror the lib signatures. Truelove-Witts
// temperature is entered in degrees Celsius (the lib reads the canonical Celsius
// value directly); the yes/no clinical items are bools and the ordinal
// disease-activity grades are numbers.

import * as F from '../../lib/hepgi-v93.js';

export default [
  {
    id: 'nafld-fibrosis',
    summary: 'NAFLD Fibrosis Score (Angulo 2007): age, BMI, impaired fasting glucose / diabetes, AST/ALT ratio, platelets, and albumin; NFS < -1.455 excludes and > 0.676 indicates advanced (F3-F4) fibrosis.',
    compute: F.nafldFibrosis,
    fields: [
      { dom: 'nf-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'nf-bmi', arg: 'bmi', kind: 'number', required: true, label: 'Body mass index', unit: 'kg/m^2' },
      { dom: 'nf-ifg', arg: 'ifgDm', kind: 'bool', label: 'Impaired fasting glucose or diabetes' },
      { dom: 'nf-ast', arg: 'ast', kind: 'number', required: true, label: 'AST', unit: 'U/L' },
      { dom: 'nf-alt', arg: 'alt', kind: 'number', required: true, label: 'ALT', unit: 'U/L' },
      { dom: 'nf-plt', arg: 'platelets', kind: 'number', required: true, label: 'Platelet count', unit: 'x10^9/L' },
      { dom: 'nf-alb', arg: 'albumin', kind: 'number', required: true, label: 'Albumin', unit: 'g/dL' },
    ],
  },
  {
    id: 'glasgow-imrie',
    summary: 'Modified Glasgow (Imrie) pancreatitis score: one point each for PaO2 < 60, age > 55, WBC > 15, calcium < 2, urea > 16, LDH > 600, albumin < 32, glucose > 10; a total >= 3 predicts severe pancreatitis.',
    compute: F.glasgowImrie,
    fields: [
      { dom: 'gi-pao2', arg: 'pao2', kind: 'number', required: true, label: 'PaO2', unit: 'kPa' },
      { dom: 'gi-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'gi-wbc', arg: 'wbc', kind: 'number', required: true, label: 'White blood cell count', unit: 'x10^9/L' },
      { dom: 'gi-ca', arg: 'calcium', kind: 'number', required: true, label: 'Calcium', unit: 'mmol/L' },
      { dom: 'gi-urea', arg: 'urea', kind: 'number', required: true, label: 'Urea', unit: 'mmol/L' },
      { dom: 'gi-ldh', arg: 'ldh', kind: 'number', required: true, label: 'LDH', unit: 'U/L' },
      { dom: 'gi-alb', arg: 'albumin', kind: 'number', required: true, label: 'Albumin', unit: 'g/L' },
      { dom: 'gi-glu', arg: 'glucose', kind: 'number', required: true, label: 'Glucose', unit: 'mmol/L' },
    ],
  },
  {
    id: 'truelove-witts',
    summary: 'Truelove and Witts severity (1955) for ulcerative colitis: bloody stools per day plus the systemic criteria (temperature, heart rate, hemoglobin, ESR) classify mild / moderate / severe disease.',
    compute: F.trueloveWitts,
    fields: [
      { dom: 'tw-stools', arg: 'stools', kind: 'number', required: true, label: 'Bloody stools per day' },
      { dom: 'tw-bleed', arg: 'bleeding', kind: 'enum', values: ['none', 'present'], label: 'Visible rectal bleeding' },
      { dom: 'tw-temp', arg: 'temp', kind: 'number', required: true, label: 'Temperature', unit: 'degrees C' },
      { dom: 'tw-hr', arg: 'heartRate', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'tw-hgb', arg: 'hemoglobin', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/dL' },
      { dom: 'tw-esr', arg: 'esr', kind: 'number', required: true, label: 'ESR', unit: 'mm/hr' },
    ],
  },
  {
    id: 'harvey-bradshaw',
    summary: 'Harvey-Bradshaw Index for Crohn disease activity: general well-being (0-4), abdominal pain (0-3), liquid stools per day, abdominal mass (0-3), and complications; < 5 remission, 5-7 mild, 8-16 moderate, > 16 severe.',
    compute: F.harveyBradshaw,
    fields: [
      { dom: 'hb-wb', arg: 'wellbeing', kind: 'number', required: true, label: 'General well-being (0 very well - 4 terrible)' },
      { dom: 'hb-pain', arg: 'pain', kind: 'number', required: true, label: 'Abdominal pain (0 none - 3 severe)' },
      { dom: 'hb-stools', arg: 'stools', kind: 'number', required: true, label: 'Liquid stools per day' },
      { dom: 'hb-mass', arg: 'mass', kind: 'number', required: true, label: 'Abdominal mass (0 none - 3 definite and tender)' },
      { dom: 'hb-cx', arg: 'complications', kind: 'number', required: true, label: 'Number of complications' },
    ],
  },
  {
    id: 'mayo-uc',
    summary: 'Mayo score for ulcerative colitis activity: stool frequency, rectal bleeding, physician global assessment, and endoscopy subscores (each 0-3); full score 0-12, partial (no endoscopy) 0-9.',
    compute: F.mayoUc,
    fields: [
      { dom: 'mu-sf', arg: 'stoolFreq', kind: 'number', required: true, label: 'Stool frequency subscore (0-3)' },
      { dom: 'mu-rb', arg: 'rectalBleeding', kind: 'number', required: true, label: 'Rectal bleeding subscore (0-3)' },
      { dom: 'mu-pg', arg: 'physicianGlobal', kind: 'number', required: true, label: 'Physician global assessment (0-3)' },
      { dom: 'mu-en', arg: 'endoscopy', kind: 'number', label: 'Endoscopy subscore (0-3, optional)' },
    ],
  },
  {
    id: 'milan-criteria',
    summary: 'Milan criteria (Mazzaferro 1996) for HCC liver-transplant eligibility: a single tumor <= 5 cm or up to three tumors each <= 3 cm, with no macrovascular invasion and no extrahepatic spread.',
    compute: F.milanCriteria,
    fields: [
      { dom: 'mc-n', arg: 'nodules', kind: 'number', required: true, label: 'Number of HCC nodules' },
      { dom: 'mc-size', arg: 'largestSize', kind: 'number', required: true, label: 'Largest tumor size', unit: 'cm' },
      { dom: 'mc-inv', arg: 'macrovascular', kind: 'bool', label: 'Macrovascular invasion' },
      { dom: 'mc-spread', arg: 'extrahepatic', kind: 'bool', label: 'Extrahepatic spread' },
    ],
  },
];
