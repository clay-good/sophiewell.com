// spec-v183 MCP wave 27: adapters for the five pulmonary / COPD / sleep
// instruments in lib/pulm-copd-v205.js — the COPD Assessment Test (CAT), the
// LENT malignant-pleural-effusion prognostic score, the ADO and DOSE COPD
// mortality indices, and the Sleep Apnea Clinical Score (SACS). dom keys mirror
// views/group-v205.js. CAT's eight items are 0–5 numeric symptom scores; LENT's
// ECOG and tumor type, and ADO/DOSE's mMRC grade are ordinal enums mirroring the
// renderer selects.

import * as F from '../../lib/pulm-copd-v205.js';

export default [
  {
    id: 'cat-copd',
    summary: 'COPD Assessment Test (Jones 2009): eight symptom/impact items each scored 0–5 (cough, phlegm, chest tightness, breathlessness, activity limitation, confidence, sleep, energy) sum to 0–40; ≥ 10 marks the GOLD "more symptoms" group.',
    compute: F.cat,
    fields: [
      { dom: 'cat-cough', arg: 'cough', kind: 'number', required: true, label: 'Cough (0 never – 5 all the time)' },
      { dom: 'cat-phlegm', arg: 'phlegm', kind: 'number', required: true, label: 'Phlegm (0–5)' },
      { dom: 'cat-chest', arg: 'chest', kind: 'number', required: true, label: 'Chest tightness (0–5)' },
      { dom: 'cat-breathless', arg: 'breathless', kind: 'number', required: true, label: 'Breathlessness on hills/stairs (0–5)' },
      { dom: 'cat-activity', arg: 'activity', kind: 'number', required: true, label: 'Activity limitation at home (0–5)' },
      { dom: 'cat-confidence', arg: 'confidence', kind: 'number', required: true, label: 'Confidence leaving home (0–5)' },
      { dom: 'cat-sleep', arg: 'sleep', kind: 'number', required: true, label: 'Sleep (0–5)' },
      { dom: 'cat-energy', arg: 'energy', kind: 'number', required: true, label: 'Energy (0–5)' },
    ],
  },
  {
    id: 'lent-score',
    summary: 'LENT score for malignant pleural effusion prognosis (Clive 2014): pleural fluid LDH, ECOG performance status, serum neutrophil-to-lymphocyte ratio, and tumor type give a 0–7 score banding median survival.',
    compute: F.lent,
    fields: [
      { dom: 'lent-ldh', arg: 'pleuralLdh', kind: 'number', required: true, label: 'Pleural fluid LDH', unit: 'IU/L' },
      { dom: 'lent-ecog', arg: 'ecog', kind: 'enum', values: ['0', '1', '2', '3-4'], required: true, label: 'ECOG performance status' },
      { dom: 'lent-nlr', arg: 'nlr', kind: 'number', required: true, label: 'Serum neutrophil-to-lymphocyte ratio' },
      { dom: 'lent-tumor', arg: 'tumorType', kind: 'enum', values: ['low', 'moderate', 'high'], required: true, label: 'Tumor type' },
    ],
  },
  {
    id: 'ado-index',
    summary: 'ADO index (Puhan 2009): a primary-care COPD mortality index needing no walk test — age, mMRC dyspnea grade, and FEV₁ % predicted give a 0–10 score predicting 3-year all-cause mortality.',
    compute: F.adoIndex,
    fields: [
      { dom: 'ado-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ado-mmrc', arg: 'mmrc', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'mMRC dyspnea grade' },
      { dom: 'ado-fev1', arg: 'fev1', kind: 'number', required: true, label: 'FEV₁ (% predicted)' },
    ],
  },
  {
    id: 'dose-index',
    summary: 'DOSE index (Jones 2009): dyspnea (mMRC), obstruction (FEV₁ % predicted), current smoking, and past-year exacerbations give a 0–8 COPD-review score; ≥ 4 marks markedly higher mortality and admission risk.',
    compute: F.doseIndex,
    fields: [
      { dom: 'dose-mmrc', arg: 'mmrc', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'mMRC dyspnea grade' },
      { dom: 'dose-fev1', arg: 'fev1', kind: 'number', required: true, label: 'FEV₁ (% predicted)' },
      { dom: 'dose-smoker', arg: 'smoker', kind: 'bool', required: false, label: 'Current smoker (+1)' },
      { dom: 'dose-exac', arg: 'exacerbations', kind: 'number', required: true, label: 'Exacerbations in the past year' },
    ],
  },
  {
    id: 'sacs-osa',
    summary: 'Sleep Apnea Clinical Score (Flemons 1994): adjusted neck circumference = measured neck (cm) + 4 (hypertension) + 3 (habitual snoring) + 3 (nocturnal gasping/choking); ≤ 43 low, 43–48 intermediate, > 48 high pretest probability of OSA.',
    compute: F.sacsOsa,
    fields: [
      { dom: 'sacs-neck', arg: 'neck', kind: 'number', required: true, label: 'Measured neck circumference', unit: 'cm' },
      { dom: 'sacs-htn', arg: 'hypertension', kind: 'bool', required: false, label: 'Hypertension (+4)' },
      { dom: 'sacs-snore', arg: 'snoring', kind: 'bool', required: false, label: 'Habitual snoring (+3)' },
      { dom: 'sacs-choke', arg: 'choking', kind: 'bool', required: false, label: 'Nocturnal gasping / choking (+3)' },
    ],
  },
];
