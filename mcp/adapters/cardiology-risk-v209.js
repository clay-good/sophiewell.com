// spec-v183 MCP wave 31: adapters for the two cardiology risk engines in
// lib/cardiology-risk-v209.js — the HCM Risk-SCD 5-year sudden-cardiac-death
// model and the CHARGE-AF 5-year incident-atrial-fibrillation model. dom keys
// mirror views/group-v209.js; every clinical flag is a boolean and the
// remaining inputs are plain numeric measurements.

import * as F from '../../lib/cardiology-risk-v209.js';

export default [
  {
    id: 'hcm-risk-scd',
    summary: 'HCM Risk-SCD (O’Mahony 2014): the ESC 5-year sudden-cardiac-death model for hypertrophic cardiomyopathy from age, maximal LV wall thickness, left-atrial diameter, LVOT gradient, family history of SCD, non-sustained VT, and unexplained syncope.',
    compute: F.hcmRiskScd,
    fields: [
      { dom: 'hcm-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'hcm-mwt', arg: 'wallThickness', kind: 'number', required: true, label: 'Maximal LV wall thickness', unit: 'mm' },
      { dom: 'hcm-la', arg: 'laDiameter', kind: 'number', required: true, label: 'Left-atrial diameter', unit: 'mm' },
      { dom: 'hcm-lvot', arg: 'lvotGradient', kind: 'number', required: true, label: 'Maximal (rest/Valsalva) LVOT gradient', unit: 'mmHg' },
      { dom: 'hcm-fhx', arg: 'fhxScd', kind: 'bool', required: false, label: 'Family history of sudden cardiac death' },
      { dom: 'hcm-nsvt', arg: 'nsvt', kind: 'bool', required: false, label: 'Non-sustained VT on Holter' },
      { dom: 'hcm-syncope', arg: 'syncope', kind: 'bool', required: false, label: 'Unexplained syncope' },
    ],
  },
  {
    id: 'charge-af',
    summary: 'CHARGE-AF (Alonso 2013): a 5-year incident-atrial-fibrillation risk model from age, height, weight, blood pressure, race, smoking, antihypertensive use, diabetes, heart failure, and prior MI; ≥ 5% is often used to select for AF screening.',
    compute: F.chargeAf,
    fields: [
      { dom: 'charge-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'charge-height', arg: 'height', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'charge-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'charge-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'charge-dbp', arg: 'dbp', kind: 'number', required: true, label: 'Diastolic BP', unit: 'mmHg' },
      { dom: 'charge-white', arg: 'white', kind: 'bool', required: false, label: 'White race' },
      { dom: 'charge-smoker', arg: 'smoker', kind: 'bool', required: false, label: 'Current smoker' },
      { dom: 'charge-antihtn', arg: 'antiHtn', kind: 'bool', required: false, label: 'Antihypertensive medication' },
      { dom: 'charge-dm', arg: 'diabetes', kind: 'bool', required: false, label: 'Diabetes' },
      { dom: 'charge-hf', arg: 'heartFailure', kind: 'bool', required: false, label: 'Heart failure' },
      { dom: 'charge-mi', arg: 'mi', kind: 'bool', required: false, label: 'Prior myocardial infarction' },
    ],
  },
];
