// spec-v183 MCP wave 36: adapters for the seven cardiology risk scores in
// lib/cardiology-risk-v214.js — the APPLE, CAAP-AF, ATLAS, HATCH, and MB-LATER
// atrial-fibrillation ablation/progression scores and the Canada ACS (C-ACS)
// and ACTION ICU acute-coronary scores. dom keys mirror views/group-v214.js.
// Every clinical item is a boolean; CAAP-AF, ATLAS, MB-LATER, and ACTION ICU add
// a few numeric measurements (the MB-LATER AF-type axis is a 0/1/2 number).

import * as F from '../../lib/cardiology-risk-v214.js';

export default [
  {
    id: 'apple-score',
    summary: 'APPLE score (Kornej 2015): one point each for age > 65, persistent AF, impaired eGFR, dilated left atrium, and low ejection fraction; a higher score marks a higher risk of AF recurrence after catheter ablation.',
    compute: F.apple,
    fields: [
      { dom: 'apl-age', arg: 'ageOver65', kind: 'bool', required: false, label: 'Age > 65 years (+1)' },
      { dom: 'apl-pers', arg: 'persistentAf', kind: 'bool', required: false, label: 'Persistent AF (+1)' },
      { dom: 'apl-egfr', arg: 'egfrLow', kind: 'bool', required: false, label: 'Impaired eGFR < 60 mL/min/1.73m² (+1)' },
      { dom: 'apl-la', arg: 'laDilated', kind: 'bool', required: false, label: 'LA diameter ≥ 43 mm (+1)' },
      { dom: 'apl-ef', arg: 'efLow', kind: 'bool', required: false, label: 'Ejection fraction < 50% (+1)' },
    ],
  },
  {
    id: 'caap-af-score',
    summary: 'CAAP-AF score (Winkle 2016): coronary disease, left-atrial diameter, age, persistent AF, number of failed antiarrhythmic drugs, and female sex give a 0–13 score; a higher score marks lower freedom from AF after ablation.',
    compute: F.caapAf,
    fields: [
      { dom: 'caap-la', arg: 'laDiameter', kind: 'number', required: true, label: 'Left-atrial diameter', unit: 'cm' },
      { dom: 'caap-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'caap-aad', arg: 'failedAad', kind: 'number', required: true, label: 'Number of failed antiarrhythmic drugs' },
      { dom: 'caap-cad', arg: 'cad', kind: 'bool', required: false, label: 'Coronary artery disease (+1)' },
      { dom: 'caap-pers', arg: 'persistentAf', kind: 'bool', required: false, label: 'Persistent / long-standing persistent AF (+2)' },
      { dom: 'caap-female', arg: 'female', kind: 'bool', required: false, label: 'Female sex (+1)' },
    ],
  },
  {
    id: 'atlas-score',
    summary: 'ATLAS score (Mesquita 2018): age > 60, non-paroxysmal AF, indexed LA volume, female sex, and current smoking give a score banding AF-recurrence risk after ablation (low < 6, intermediate 6–10, high > 10).',
    compute: F.atlas,
    fields: [
      { dom: 'atl-lavi', arg: 'laVolumeIndex', kind: 'number', required: true, label: 'Indexed LA volume', unit: 'mL/m²' },
      { dom: 'atl-age', arg: 'ageOver60', kind: 'bool', required: false, label: 'Age > 60 years (+1)' },
      { dom: 'atl-np', arg: 'nonParoxysmal', kind: 'bool', required: false, label: 'Non-paroxysmal AF (+2)' },
      { dom: 'atl-female', arg: 'female', kind: 'bool', required: false, label: 'Female sex (+4)' },
      { dom: 'atl-smoke', arg: 'smoking', kind: 'bool', required: false, label: 'Current smoking (+7)' },
    ],
  },
  {
    id: 'hatch-score',
    summary: 'HATCH score (de Vos 2010): hypertension, age > 75, TIA/stroke, COPD, and heart failure give a 0–7 score predicting progression from paroxysmal to persistent atrial fibrillation.',
    compute: F.hatch,
    fields: [
      { dom: 'htc-htn', arg: 'hypertension', kind: 'bool', required: false, label: 'Hypertension (+1)' },
      { dom: 'htc-age', arg: 'ageOver75', kind: 'bool', required: false, label: 'Age > 75 years (+1)' },
      { dom: 'htc-stroke', arg: 'strokeTia', kind: 'bool', required: false, label: 'TIA or stroke (+2)' },
      { dom: 'htc-copd', arg: 'copd', kind: 'bool', required: false, label: 'COPD (+1)' },
      { dom: 'htc-hf', arg: 'heartFailure', kind: 'bool', required: false, label: 'Heart failure (+2)' },
    ],
  },
  {
    id: 'mb-later-score',
    summary: 'MB-LATER score (Mujović 2017): male sex, bundle-branch block, large left atrium, AF type (0 paroxysmal / 1 persistent / 2 long-standing), and early recurrence give a 0–6 score; ≥ 2 predicts very-late AF recurrence after ablation.',
    compute: F.mbLater,
    fields: [
      { dom: 'mbl-type', arg: 'afType', kind: 'number', required: true, label: 'AF type (0 = paroxysmal, 1 = persistent, 2 = long-standing persistent)' },
      { dom: 'mbl-male', arg: 'male', kind: 'bool', required: false, label: 'Male sex (+1)' },
      { dom: 'mbl-bbb', arg: 'bbb', kind: 'bool', required: false, label: 'Bundle-branch block (+1)' },
      { dom: 'mbl-la', arg: 'laLarge', kind: 'bool', required: false, label: 'Left atrium ≥ 47 mm (+1)' },
      { dom: 'mbl-er', arg: 'earlyRecurrence', kind: 'bool', required: false, label: 'Early AF recurrence within 3 months (+1)' },
    ],
  },
  {
    id: 'canada-acs-risk-score',
    summary: 'Canada ACS (C-ACS) risk score (Huynh 2013): age ≥ 75, Killip > 1, systolic BP < 100, and heart rate > 100 give a 0–4 score where a rising total marks higher in-hospital mortality across the acute-coronary-syndrome spectrum.',
    compute: F.canadaAcs,
    fields: [
      { dom: 'cacs-age', arg: 'ageOver75', kind: 'bool', required: false, label: 'Age ≥ 75 years (+1)' },
      { dom: 'cacs-killip', arg: 'killipOver1', kind: 'bool', required: false, label: 'Killip class > 1 (+1)' },
      { dom: 'cacs-sbp', arg: 'sbpLow', kind: 'bool', required: false, label: 'Systolic BP < 100 mmHg (+1)' },
      { dom: 'cacs-hr', arg: 'hrHigh', kind: 'bool', required: false, label: 'Heart rate > 100 bpm (+1)' },
    ],
  },
  {
    id: 'action-icu-score',
    summary: 'ACTION ICU score (Fanaroff 2018): age, heart rate, systolic BP, creatinine, troponin, heart failure, ST depression, no prior revascularization, and chronic lung disease give a 0–20 score predicting complications needing critical care in NSTEMI.',
    compute: F.actionIcu,
    fields: [
      { dom: 'aic-hr', arg: 'heartRate', kind: 'number', required: true, label: 'Heart rate', unit: 'bpm' },
      { dom: 'aic-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'aic-age', arg: 'ageOver70', kind: 'bool', required: false, label: 'Age ≥ 70 years (+1)' },
      { dom: 'aic-cr', arg: 'creatHigh', kind: 'bool', required: false, label: 'Creatinine ≥ 1.1 mg/dL (+1)' },
      { dom: 'aic-trop', arg: 'tropHigh', kind: 'bool', required: false, label: 'Initial troponin / ULN ≥ 12 (+2)' },
      { dom: 'aic-hf', arg: 'heartFailure', kind: 'bool', required: false, label: 'Signs/symptoms of heart failure (+5)' },
      { dom: 'aic-st', arg: 'stDepression', kind: 'bool', required: false, label: 'ST-segment depression (+1)' },
      { dom: 'aic-revasc', arg: 'noPriorRevasc', kind: 'bool', required: false, label: 'No prior revascularization (+1)' },
      { dom: 'aic-lung', arg: 'lungDisease', kind: 'bool', required: false, label: 'Chronic lung disease (+2)' },
    ],
  },
];
