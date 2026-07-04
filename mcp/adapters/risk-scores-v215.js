// spec-v183 MCP wave 37: adapters for the seven risk scores in
// lib/risk-scores-v215.js — the DLCN and Simon Broome familial-hypercholesterolemia
// criteria, the PADIT cardiac-device-infection score, the GRIm-Score and LIPI
// immunotherapy/lung prognostic indices, and the ONKOTEV and PROTECHT
// cancer-associated-VTE scores. dom keys mirror views/group-v215.js. The DLCN,
// PADIT, and PROTECHT ordinal <select> fields carry numeric-string point values,
// modeled here as enums; the rest are numeric labs and boolean flags.

import * as F from '../../lib/risk-scores-v215.js';

export default [
  {
    id: 'dlcn-fh-score',
    summary: 'Dutch Lipid Clinic Network score (WHO/Dutch criteria): family history, personal clinical history, physical exam, untreated LDL-C, and a causative DNA mutation give a score banding the probability of familial hypercholesterolemia (> 8 definite).',
    compute: F.dlcnFh,
    fields: [
      { dom: 'dlcn-fam', arg: 'familyHistory', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Family history (0/1/2 points)' },
      { dom: 'dlcn-clin', arg: 'clinicalHistory', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Personal clinical history (0/1/2 points)' },
      { dom: 'dlcn-exam', arg: 'physicalExam', kind: 'enum', values: ['0', '4', '6'], required: true, label: 'Physical examination (0/4/6 points)' },
      { dom: 'dlcn-ldl', arg: 'ldl', kind: 'number', required: true, label: 'Untreated LDL-C', unit: 'mmol/L' },
      { dom: 'dlcn-dna', arg: 'dnaMutation', kind: 'bool', required: false, label: 'Causative DNA mutation (LDLR/APOB/PCSK9)' },
    ],
  },
  {
    id: 'simon-broome-fh',
    summary: 'Simon Broome criteria for familial hypercholesterolemia: total cholesterol / LDL-C thresholds plus tendon xanthoma, DNA mutation, and family history of MI or hypercholesterolemia classify definite vs possible FH.',
    compute: F.simonBroomeFh,
    fields: [
      { dom: 'sb-tc', arg: 'totalChol', kind: 'number', required: false, label: 'Total cholesterol', unit: 'mmol/L' },
      { dom: 'sb-ldl', arg: 'ldl', kind: 'number', required: false, label: 'LDL-C', unit: 'mmol/L' },
      { dom: 'sb-child', arg: 'child', kind: 'bool', required: false, label: 'Child < 16 years (uses pediatric thresholds)' },
      { dom: 'sb-xanthoma', arg: 'tendonXanthoma', kind: 'bool', required: false, label: 'Tendon xanthoma (patient or 1st/2nd-degree relative)' },
      { dom: 'sb-dna', arg: 'dnaMutation', kind: 'bool', required: false, label: 'Causative DNA mutation' },
      { dom: 'sb-mi', arg: 'famMi', kind: 'bool', required: false, label: 'Family history of premature MI' },
      { dom: 'sb-chol', arg: 'famChol', kind: 'bool', required: false, label: 'Family history of raised cholesterol' },
    ],
  },
  {
    id: 'padit-score',
    summary: 'PADIT score (Birnie 2019): prior procedures, age, procedure type, depressed renal function, and immunocompromise give a 0–15 score banding cardiac-implantable-electronic-device infection risk (≥ 7 high).',
    compute: F.padit,
    fields: [
      { dom: 'padit-prior', arg: 'priorProcedures', kind: 'enum', values: ['0', '1', '4'], required: true, label: 'Prior CIED procedures (0/1/≥2 points)' },
      { dom: 'padit-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'padit-type', arg: 'procedureType', kind: 'enum', values: ['0', '2', '4', '5'], required: true, label: 'Procedure type (points)' },
      { dom: 'padit-egfr', arg: 'egfrLow', kind: 'bool', required: false, label: 'Depressed renal function (eGFR < 30)' },
      { dom: 'padit-immuno', arg: 'immunocompromised', kind: 'bool', required: false, label: 'Immunocompromised' },
    ],
  },
  {
    id: 'grim-score',
    summary: 'GRIm-Score (Bigot 2017): serum albumin, neutrophil-to-lymphocyte ratio, and elevated LDH give a 0–3 score where a higher total marks worse survival on immunotherapy.',
    compute: F.grimScore,
    fields: [
      { dom: 'grim-alb', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/dL' },
      { dom: 'grim-nlr', arg: 'nlr', kind: 'number', required: true, label: 'Neutrophil-to-lymphocyte ratio' },
      { dom: 'grim-ldh', arg: 'ldhHigh', kind: 'bool', required: false, label: 'LDH above the upper limit of normal' },
    ],
  },
  {
    id: 'lipi',
    summary: 'Lung Immune Prognostic Index (Mezquita 2018): the derived neutrophil-to-lymphocyte ratio (from ANC and total WBC) plus elevated LDH give a 0–2 score banding prognosis on immunotherapy.',
    compute: F.lipi,
    fields: [
      { dom: 'lipi-anc', arg: 'anc', kind: 'number', required: true, label: 'Absolute neutrophil count', unit: '×10⁹/L' },
      { dom: 'lipi-wbc', arg: 'wbc', kind: 'number', required: true, label: 'Total WBC', unit: '×10⁹/L' },
      { dom: 'lipi-ldh', arg: 'ldhHigh', kind: 'bool', required: false, label: 'LDH above the upper limit of normal' },
    ],
  },
  {
    id: 'onkotev-score',
    summary: 'ONKOTEV score (Cella 2017): a high Khorana score, metastatic disease, vascular/lymphatic compression, and prior VTE give a score banding 6-month cancer-associated VTE risk.',
    compute: F.onkotev,
    fields: [
      { dom: 'onk-khorana', arg: 'khoranaHigh', kind: 'bool', required: false, label: 'Khorana score > 2 (+1)' },
      { dom: 'onk-mets', arg: 'metastatic', kind: 'bool', required: false, label: 'Metastatic disease (+1)' },
      { dom: 'onk-comp', arg: 'compression', kind: 'bool', required: false, label: 'Vascular or lymphatic compression (+1)' },
      { dom: 'onk-vte', arg: 'previousVte', kind: 'bool', required: false, label: 'Previous VTE (+1)' },
    ],
  },
  {
    id: 'protecht-score',
    summary: 'PROTECHT score (Verso 2012): cancer site plus thrombocytosis, anemia/ESA use, leukocytosis, high BMI, and platinum or gemcitabine chemotherapy give a score banding cancer-associated VTE risk (≥ 3 high).',
    compute: F.protecht,
    fields: [
      { dom: 'prot-site', arg: 'cancerSite', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Cancer site (0/1/2 points)' },
      { dom: 'prot-plt', arg: 'plateletsHigh', kind: 'bool', required: false, label: 'Platelets ≥ 350 ×10⁹/L (+1)' },
      { dom: 'prot-hb', arg: 'hbLowEsa', kind: 'bool', required: false, label: 'Hemoglobin < 10 g/dL or ESA use (+1)' },
      { dom: 'prot-wbc', arg: 'wbcHigh', kind: 'bool', required: false, label: 'Leukocytes > 11 ×10⁹/L (+1)' },
      { dom: 'prot-bmi', arg: 'bmiHigh', kind: 'bool', required: false, label: 'BMI ≥ 35 kg/m² (+1)' },
      { dom: 'prot-plat', arg: 'platinum', kind: 'bool', required: false, label: 'Platinum-based chemotherapy (+1)' },
      { dom: 'prot-gem', arg: 'gemcitabine', kind: 'bool', required: false, label: 'Gemcitabine chemotherapy (+1)' },
    ],
  },
];
