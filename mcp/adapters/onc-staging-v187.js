// spec-v183 MCP wave 9: adapters for the five staging/prognostic instruments in
// lib/onc-staging-v187.js — BCLC hepatocellular-carcinoma stage, the IMDC and
// MSKCC (Motzer) metastatic-RCC risk models, RECIST 1.1 tumor response, and the
// modified Glasgow Prognostic Score. dom keys mirror views/group-v187.js.

import * as F from '../../lib/onc-staging-v187.js';

export default [
  {
    id: 'bclc-hcc',
    summary: 'Barcelona-Clinic Liver-Cancer (BCLC) stage for hepatocellular carcinoma from ECOG performance status, Child-Pugh class, and tumor burden — the stage that maps to the treatment strategy.',
    compute: F.bclcHcc,
    fields: [
      { dom: 'bclc-ecog', arg: 'ecog', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'ECOG performance status' },
      { dom: 'bclc-child', arg: 'child', kind: 'enum', values: ['A', 'B', 'C'], required: true, label: 'Child-Pugh class' },
      { dom: 'bclc-burden', arg: 'burden', kind: 'enum', values: ['very-early', 'early', 'intermediate', 'advanced'], required: true, label: 'Tumor burden' },
    ],
  },
  {
    id: 'imdc-rcc',
    summary: 'International Metastatic RCC Database Consortium (IMDC / Heng) risk group for metastatic renal-cell carcinoma from six clinical/laboratory factors.',
    compute: F.imdcRcc,
    fields: [
      { dom: 'imdc-karnofsky', arg: 'karnofsky', kind: 'bool', required: false, label: 'Karnofsky < 80%' },
      { dom: 'imdc-dxToTx', arg: 'dxToTx', kind: 'bool', required: false, label: 'Diagnosis to systemic therapy < 1 year' },
      { dom: 'imdc-anemia', arg: 'anemia', kind: 'bool', required: false, label: 'Anemia (Hb < LLN)' },
      { dom: 'imdc-hypercalcemia', arg: 'hypercalcemia', kind: 'bool', required: false, label: 'Hypercalcemia' },
      { dom: 'imdc-neutrophilia', arg: 'neutrophilia', kind: 'bool', required: false, label: 'Neutrophilia (> ULN)' },
      { dom: 'imdc-thrombocytosis', arg: 'thrombocytosis', kind: 'bool', required: false, label: 'Thrombocytosis (> ULN)' },
    ],
  },
  {
    id: 'mskcc-rcc',
    summary: 'MSKCC (Motzer) risk group for metastatic renal-cell carcinoma from five prognostic factors — the pre-targeted-therapy model still used for stratification.',
    compute: F.mskccRcc,
    fields: [
      { dom: 'mskcc-karnofsky', arg: 'karnofsky', kind: 'bool', required: false, label: 'Karnofsky < 80%' },
      { dom: 'mskcc-ldh', arg: 'ldh', kind: 'bool', required: false, label: 'LDH > 1.5× ULN' },
      { dom: 'mskcc-anemia', arg: 'anemia', kind: 'bool', required: false, label: 'Hemoglobin < LLN' },
      { dom: 'mskcc-hypercalcemia', arg: 'hypercalcemia', kind: 'bool', required: false, label: 'Corrected calcium > 10 mg/dL' },
      { dom: 'mskcc-dxToTx', arg: 'dxToTx', kind: 'bool', required: false, label: 'Diagnosis to treatment < 1 year' },
    ],
  },
  {
    id: 'recist',
    summary: 'RECIST 1.1 tumor-response category from the sum of target-lesion diameters at baseline, current, and nadir, plus new-lesion / non-target progression flags.',
    compute: F.recist,
    fields: [
      { dom: 'recist-baseline', arg: 'baseline', kind: 'number', required: true, label: 'Baseline sum of diameters', unit: 'mm' },
      { dom: 'recist-current', arg: 'current', kind: 'number', required: true, label: 'Current sum of diameters', unit: 'mm' },
      { dom: 'recist-nadir', arg: 'nadir', kind: 'number', required: true, label: 'Nadir sum of diameters', unit: 'mm' },
      { dom: 'recist-newLesion', arg: 'newLesion', kind: 'bool', required: false, label: 'A new lesion has appeared' },
      { dom: 'recist-nonTarget', arg: 'nonTarget', kind: 'bool', required: false, label: 'Unequivocal non-target progression' },
    ],
  },
  {
    id: 'glasgow-prognostic-score',
    summary: 'Modified Glasgow Prognostic Score (mGPS): a 0–2 inflammation-based prognostic score from CRP and albumin.',
    compute: F.glasgowPrognosticScore,
    fields: [
      { dom: 'mgps-crp', arg: 'crp', kind: 'number', required: true, label: 'C-reactive protein', unit: 'mg/L' },
      { dom: 'mgps-albumin', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/dL' },
    ],
  },
];
