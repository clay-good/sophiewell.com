// spec-v183 MCP wave 9: adapters for the four bedside-risk instruments in
// lib/risk-v192.js — the FINDRISC type-2-diabetes risk score, the Grobman
// VBAC-success prediction, the Marburg Heart Score for chest pain in primary
// care, and the ADHERE heart-failure mortality tree. dom keys mirror
// views/group-v192.js.

import * as F from '../../lib/risk-v192.js';

export default [
  {
    id: 'findrisc',
    summary: 'FINDRISC score estimating 10-year type-2-diabetes risk from age, BMI, waist circumference, activity, diet, blood-pressure treatment, glucose history, and family history.',
    compute: F.findrisc,
    fields: [
      { dom: 'findrisc-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'findrisc-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m²' },
      { dom: 'findrisc-sex', arg: 'sex', kind: 'enum', values: ['female', 'male'], required: false, label: 'Sex (sets waist bands)' },
      { dom: 'findrisc-waist', arg: 'waist', kind: 'number', required: true, label: 'Waist circumference', unit: 'cm' },
      { dom: 'findrisc-active', arg: 'active', kind: 'bool', required: false, label: 'Physically active ≥ 30 min/day' },
      { dom: 'findrisc-fruitVeg', arg: 'fruitVeg', kind: 'bool', required: false, label: 'Eats vegetables/fruit daily' },
      { dom: 'findrisc-bpMed', arg: 'bpMed', kind: 'bool', required: false, label: 'On antihypertensive medication' },
      { dom: 'findrisc-highGlucose', arg: 'highGlucose', kind: 'bool', required: false, label: 'History of high blood glucose' },
      { dom: 'findrisc-familyHistory', arg: 'familyHistory', kind: 'enum', values: ['none', 'second', 'first'], required: false, label: 'Family history of diabetes' },
    ],
  },
  {
    id: 'grobman-vbac',
    summary: 'Grobman nomogram predicting the probability of a successful vaginal birth after cesarean (VBAC) from maternal age, BMI, prior delivery history, and clinical factors.',
    compute: F.grobmanVbac,
    fields: [
      { dom: 'grobman-age', arg: 'age', kind: 'number', required: true, label: 'Maternal age', unit: 'years' },
      { dom: 'grobman-weight', arg: 'weight', kind: 'number', required: true, label: 'Pre-pregnancy weight', unit: 'kg' },
      { dom: 'grobman-height', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'grobman-vaginalHistory', arg: 'vaginalHistory', kind: 'enum', values: ['none', 'before', 'vbac'], required: false, label: 'Prior vaginal delivery history' },
      { dom: 'grobman-arrestIndication', arg: 'arrestIndication', kind: 'bool', required: false, label: 'Prior cesarean for an arrest disorder' },
      { dom: 'grobman-chronicHtn', arg: 'chronicHtn', kind: 'bool', required: false, label: 'Treated chronic hypertension' },
    ],
  },
  {
    id: 'marburg-heart-score',
    summary: 'Marburg Heart Score (0–5) ruling coronary artery disease in or out as the cause of chest pain in primary care; ≤ 2 makes CAD unlikely.',
    compute: F.marburgHeartScore,
    fields: [
      { dom: 'marburg-ageSex', arg: 'ageSex', kind: 'bool', required: false, label: 'Female ≥ 65 or male ≥ 55' },
      { dom: 'marburg-vascular', arg: 'vascular', kind: 'bool', required: false, label: 'Known vascular disease' },
      { dom: 'marburg-worseExercise', arg: 'worseExercise', kind: 'bool', required: false, label: 'Pain worse with exercise' },
      { dom: 'marburg-notPalpable', arg: 'notPalpable', kind: 'bool', required: false, label: 'Pain NOT reproducible by palpation' },
      { dom: 'marburg-assumesCardiac', arg: 'assumesCardiac', kind: 'bool', required: false, label: 'Patient assumes the pain is cardiac' },
    ],
  },
  {
    id: 'adhere-hf',
    summary: 'ADHERE classification-tree mortality risk for acute decompensated heart failure, branching on BUN, systolic blood pressure, and creatinine.',
    compute: F.adhereHf,
    fields: [
      { dom: 'adhere-bun', arg: 'bun', kind: 'number', required: true, label: 'BUN', unit: 'mg/dL' },
      { dom: 'adhere-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'adhere-creatinine', arg: 'creatinine', kind: 'number', required: false, label: 'Creatinine (needed if BUN ≥ 43 and SBP < 115)', unit: 'mg/dL' },
    ],
  },
];
