// spec-v183: adapters for the six lib/cardio-v90.js cardiology tiles. dom keys
// mirror views/group-v16.js and META.example.fields; arg names mirror the lib
// signatures. The yes/no selects pass their string value straight through (the
// lib coerces 'yes'); the Duke angina-index select maps to a number.

import * as C from '../../lib/cardio-v90.js';

const YESNO = ['no', 'yes'];

export default [
  {
    id: 'ecg-axis',
    summary: 'Mean frontal-plane QRS axis from net lead I and aVF deflections, with the quadrant interpretation.',
    compute: C.ecgAxis,
    fields: [
      { dom: 'ea-i', arg: 'leadI', kind: 'number', required: true, label: 'Net QRS deflection in lead I', unit: 'mm, signed' },
      { dom: 'ea-avf', arg: 'avf', kind: 'number', required: true, label: 'Net QRS deflection in lead aVF', unit: 'mm, signed' },
      { dom: 'ea-ii', arg: 'leadII', kind: 'number', label: 'Net QRS deflection in lead II (optional)', unit: 'mm, signed' },
    ],
  },
  {
    id: 'lvh-criteria',
    summary: 'ECG voltage criteria for left ventricular hypertrophy: Sokolow-Lyon (SV1 + max RV5/RV6) and Cornell (SV3 + RaVL).',
    compute: C.lvhCriteria,
    // The Sokolow-Lyon 35 mm threshold is a documented constant the renderer
    // prints but the lib return does not carry; surface it so describe/compute
    // are self-describing (and the example round-trip is exact).
    formatResult: (raw) => ({ ...raw, sokolowThreshold: 35 }),
    fields: [
      { dom: 'lv-sv1', arg: 'sV1', kind: 'number', required: true, label: 'S wave in V1', unit: 'mm' },
      { dom: 'lv-rv5', arg: 'rV5', kind: 'number', required: true, label: 'R wave in V5', unit: 'mm' },
      { dom: 'lv-rv6', arg: 'rV6', kind: 'number', required: true, label: 'R wave in V6', unit: 'mm' },
      { dom: 'lv-sv3', arg: 'sV3', kind: 'number', required: true, label: 'S wave in V3', unit: 'mm' },
      { dom: 'lv-ravl', arg: 'rAVL', kind: 'number', required: true, label: 'R wave in aVL', unit: 'mm' },
      { dom: 'lv-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], label: 'Sex (for the Cornell threshold)' },
    ],
  },
  {
    id: 'timi-stemi',
    summary: 'TIMI risk score for STEMI (Morrow 2000): an 8-variable point score mapped to the derivation-cohort 30-day mortality.',
    compute: C.timiStemi,
    fields: [
      { dom: 'ts-age', arg: 'age', kind: 'number', label: 'Age', unit: 'years' },
      { dom: 'ts-hist', arg: 'diabetesHtnAngina', kind: 'enum', values: YESNO, label: 'History of diabetes, hypertension, or angina' },
      { dom: 'ts-sbp', arg: 'sbpLow', kind: 'enum', values: YESNO, label: 'Systolic BP < 100 mmHg' },
      { dom: 'ts-hr', arg: 'hrHigh', kind: 'enum', values: YESNO, label: 'Heart rate > 100 bpm' },
      { dom: 'ts-killip', arg: 'killip24', kind: 'enum', values: YESNO, label: 'Killip class II-IV' },
      { dom: 'ts-weight', arg: 'weightLow', kind: 'enum', values: YESNO, label: 'Weight < 67 kg' },
      { dom: 'ts-ste', arg: 'anteriorSteLbbb', kind: 'enum', values: YESNO, label: 'Anterior ST-elevation or LBBB' },
      { dom: 'ts-time', arg: 'timeOver4h', kind: 'enum', values: YESNO, label: 'Time to treatment > 4 hours' },
    ],
  },
  {
    id: 'duke-treadmill',
    summary: 'Duke treadmill score (Mark 1987): exercise time, ST deviation, and angina index mapped to a risk band and cited 5-year survival.',
    compute: C.dukeTreadmill,
    fields: [
      { dom: 'dt-time', arg: 'exerciseTime', kind: 'number', required: true, label: 'Exercise time (Bruce protocol)', unit: 'min' },
      { dom: 'dt-st', arg: 'stDeviation', kind: 'number', required: true, label: 'Maximal ST-segment deviation', unit: 'mm' },
      { dom: 'dt-angina', arg: 'anginaIndex', kind: 'enum', values: ['0', '1', '2'], label: 'Exercise angina index (0 none, 1 non-limiting, 2 limiting)', to: (v) => Number(v) },
    ],
  },
  {
    id: 'cardiac-power-output',
    summary: 'Cardiac power output (Fincke 2004): (MAP x cardiac output) / 451 in watts, against the 0.6 W cardiogenic-shock threshold.',
    compute: C.cardiacPowerOutput,
    fields: [
      { dom: 'cp-map', arg: 'map', kind: 'number', required: true, label: 'Mean arterial pressure', unit: 'mmHg' },
      { dom: 'cp-co', arg: 'co', kind: 'number', required: true, label: 'Cardiac output', unit: 'L/min' },
    ],
  },
  {
    id: 'aortic-valve-area',
    summary: 'Aortic valve area by the continuity equation, with the dimensionless index and severity band (ASE/EACVI 2017).',
    compute: C.aorticValveArea,
    fields: [
      { dom: 'av-d', arg: 'lvotDiameter', kind: 'number', required: true, label: 'LVOT diameter', unit: 'cm' },
      { dom: 'av-lvti', arg: 'lvotVti', kind: 'number', required: true, label: 'LVOT VTI', unit: 'cm' },
      { dom: 'av-avti', arg: 'avVti', kind: 'number', required: true, label: 'Aortic-valve VTI', unit: 'cm' },
    ],
  },
];
