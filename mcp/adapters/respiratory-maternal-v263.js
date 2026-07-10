// spec-v263 MCP wave (one-hundred-third): adapters for the respiratory / maternal
// acute scores in lib/respiratory-maternal-v263.js — the MuLBSTA viral-pneumonia
// mortality score, the Ottawa COPD risk score, and the Sepsis in Obstetrics Score
// (SOS). dom keys mirror the browser renderer (views/group-v263.js) and each
// tile's META.example.fields. Enum bands default to their "normal" value in the
// compute when omitted, so no field is individually required.

import * as F from '../../lib/respiratory-maternal-v263.js';

export default [
  {
    id: 'mulbsta',
    summary: 'MuLBSTA score — a 0-20 model for 90-day mortality in viral pneumonia, from Multilobular infiltrate (+5), Lymphocyte <= 0.8 x10^9/L (+4), Bacterial coinfection (+4), Smoking (former +2 / current +3), Hypertension (+2), and Age >= 60 (+2). A higher total marks higher mortality risk. A prognostic score, not a treatment order.',
    compute: F.mulbsta,
    fields: [
      { dom: 'mu-multi', arg: 'multilobar', kind: 'bool', label: 'Multilobular infiltrate (>= 2 lobes) (+5)' },
      { dom: 'mu-lymph', arg: 'lymphopenia', kind: 'bool', label: 'Lymphocyte <= 0.8 x10^9/L (+4)' },
      { dom: 'mu-bact', arg: 'bacterial', kind: 'bool', label: 'Bacterial coinfection (+4)' },
      { dom: 'mu-smoke', arg: 'smoking', kind: 'enum', values: ['never', 'former', 'current'], label: 'Smoking (never 0 / former +2 / current +3)' },
      { dom: 'mu-htn', arg: 'hypertension', kind: 'bool', label: 'Hypertension (+2)' },
      { dom: 'mu-age', arg: 'ageOver60', kind: 'bool', label: 'Age >= 60 (+2)' },
    ],
  },
  {
    id: 'ottawa-copd',
    summary: 'Ottawa COPD Risk Scale — a 0-16 score for short-term serious outcomes in ED patients with acute COPD exacerbation. Factors: prior coronary bypass graft (+1), prior peripheral-vascular-disease intervention (+1), prior intubation for respiratory distress (+2), heart rate >= 110/min (+2), failed/too-ill walk test (+2), acute ischemic ECG change (+2), pulmonary congestion on CXR (+1), hemoglobin < 10 g/dL (+3), urea >= 12 mmol/L (+1), serum bicarbonate >= 35 mEq/L (+1). A risk score, not a disposition order.',
    compute: F.ottawaCopd,
    fields: [
      { dom: 'ot-cabg', arg: 'cabg', kind: 'bool', label: 'Prior coronary bypass graft (+1)' },
      { dom: 'ot-pvd', arg: 'pvd', kind: 'bool', label: 'Prior peripheral-vascular-disease intervention (+1)' },
      { dom: 'ot-intub', arg: 'priorIntubation', kind: 'bool', label: 'Prior intubation for respiratory distress (+2)' },
      { dom: 'ot-hr', arg: 'hr110', kind: 'bool', label: 'Heart rate >= 110/min on arrival (+2)' },
      { dom: 'ot-walk', arg: 'walkTestFail', kind: 'bool', label: 'Too ill for walk test, or SaO2 < 90% / HR >= 120 on it (+2)' },
      { dom: 'ot-ecg', arg: 'ischemicEcg', kind: 'bool', label: 'Acute ischemic change on ECG (+2)' },
      { dom: 'ot-cxr', arg: 'pulmCongestion', kind: 'bool', label: 'Pulmonary congestion on chest x-ray (+1)' },
      { dom: 'ot-hb', arg: 'hbLow', kind: 'bool', label: 'Hemoglobin < 10 g/dL (+3)' },
      { dom: 'ot-urea', arg: 'ureaHigh', kind: 'bool', label: 'Urea >= 12 mmol/L (+1)' },
      { dom: 'ot-bicarb', arg: 'bicarbHigh', kind: 'bool', label: 'Serum bicarbonate >= 35 mEq/L (+1)' },
    ],
  },
  {
    id: 'sepsis-obstetrics-score',
    summary: 'Sepsis in Obstetrics Score (SOS) — a 0-28 physiologic score for the risk of ICU admission in pregnant/postpartum women with suspected sepsis, summing banded points for temperature, systolic BP, heart rate, respiratory rate, SpO2, WBC, % immature neutrophils, and lactic acid. A total >= 6 marks high risk. A risk score, not a disposition order.',
    compute: F.sepsisObstetricsScore,
    fields: [
      { dom: 'sos-temp', arg: 'temp', kind: 'enum', values: ['normal', 'gt409', 't39_409', 't385_389', 't34_359', 't32_339', 't30_319', 'lt30'], label: 'Temperature band (C)' },
      { dom: 'sos-sbp', arg: 'sbp', kind: 'enum', values: ['normal', 's70_90', 'lt70'], label: 'Systolic BP band (mmHg)' },
      { dom: 'sos-hr', arg: 'hr', kind: 'enum', values: ['normal', 'h120_129', 'h130_149', 'h150_179', 'gt179'], label: 'Heart rate band (bpm)' },
      { dom: 'sos-rr', arg: 'rr', kind: 'enum', values: ['normal', 'r10_11', 'r6_9', 'le5', 'r25_34', 'r35_49', 'gt49'], label: 'Respiratory rate band (breaths/min)' },
      { dom: 'sos-spo2', arg: 'spo2', kind: 'enum', values: ['normal', 'o90_91', 'o85_89', 'lt85'], label: 'SpO2 band (%)' },
      { dom: 'sos-wbc', arg: 'wbc', kind: 'enum', values: ['normal', 'w3_56', 'w1_29', 'lt1', 'w17_249', 'w25_399', 'gt399'], label: 'WBC band (x10^3/mm^3)' },
      { dom: 'sos-immature', arg: 'immature', kind: 'enum', values: ['normal', 'ge10'], label: '% immature neutrophils (< 10% or >= 10%)' },
      { dom: 'sos-lactic', arg: 'lactic', kind: 'enum', values: ['normal', 'ge4'], label: 'Lactic acid (< 4 or >= 4 mmol/L)' },
    ],
  },
];
