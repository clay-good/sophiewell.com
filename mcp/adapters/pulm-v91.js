// spec-v183 (wave 2): adapters for the five lib/pulm-v91.js pulmonary-function /
// chronic-respiratory tiles. dom keys mirror views/group-v17.js and
// META.example.fields; arg names mirror the lib signatures. The mMRC select is a
// 0-4 grade the lib reads as a number; the optional volume inputs let the lib
// derive the ratio / % predicted when present.

import * as P from '../../lib/pulm-v91.js';

export default [
  {
    id: 'gold-spirometry',
    summary: 'GOLD spirometric grade of COPD airflow obstruction from post-bronchodilator FEV1 % predicted and the FEV1/FVC ratio.',
    compute: P.goldSpirometry,
    fields: [
      { dom: 'gs-pct', arg: 'fev1Pct', kind: 'number', label: 'FEV1', unit: '% predicted' },
      { dom: 'gs-ratio', arg: 'ratio', kind: 'number', label: 'FEV1/FVC ratio (0-1) — leave blank to compute from volumes' },
      { dom: 'gs-fev1', arg: 'fev1L', kind: 'number', label: 'FEV1 (optional, to compute the ratio)', unit: 'L' },
      { dom: 'gs-fvc', arg: 'fvcL', kind: 'number', label: 'FVC (optional, to compute the ratio)', unit: 'L' },
    ],
  },
  {
    id: 'bode-index',
    summary: 'BODE index (Celli 2004): BMI, FEV1 % predicted, mMRC dyspnea, and 6-minute walk distance mapped to a 0-10 score and quartile survival.',
    compute: P.bodeIndex,
    fields: [
      { dom: 'bo-bmi', arg: 'bmi', kind: 'number', required: true, label: 'Body-mass index', unit: 'kg/m^2' },
      { dom: 'bo-pct', arg: 'fev1Pct', kind: 'number', required: true, label: 'FEV1', unit: '% predicted' },
      { dom: 'bo-mmrc', arg: 'mmrc', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'mMRC dyspnea grade', to: (v) => Number(v) },
      { dom: 'bo-6mwd', arg: 'sixMwd', kind: 'number', required: true, label: '6-minute walk distance', unit: 'm' },
    ],
  },
  {
    id: 'gap-ipf',
    summary: 'GAP index (Ley 2012) for idiopathic pulmonary fibrosis: gender, age, FVC % and DLCO % mapped to a stage and cited 1/2/3-year mortality.',
    compute: P.gapIpf,
    fields: [
      { dom: 'gp-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], label: 'Sex' },
      { dom: 'gp-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'gp-fvc', arg: 'fvcPct', kind: 'number', required: true, label: 'FVC', unit: '% predicted' },
      { dom: 'gp-dlco', arg: 'dlcoPct', kind: 'number', label: 'DLCO', unit: '% predicted' },
      { dom: 'gp-dlco-cannot', arg: 'dlcoCannotPerform', kind: 'enum', values: ['no', 'yes'], label: 'DLCO cannot be performed (3 points)', to: (v) => v === 'yes' },
    ],
  },
  {
    id: 'predicted-spirometry',
    summary: 'GLI-2012 predicted FEV1, FVC, and FEV1/FVC with lower limit of normal; optional measured volumes return the % predicted.',
    compute: P.predictedSpirometry,
    fields: [
      { dom: 'ps-age', arg: 'age', kind: 'number', required: true, label: 'Age (3-95)', unit: 'years' },
      { dom: 'ps-height', arg: 'heightCm', kind: 'number', required: true, label: 'Height', unit: 'cm' },
      { dom: 'ps-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], label: 'Sex' },
      { dom: 'ps-eth', arg: 'ethnicity', kind: 'enum', values: ['caucasian', 'african-american', 'ne-asian', 'se-asian', 'other'], label: 'Ethnicity group (GLI-2012)' },
      { dom: 'ps-fev1', arg: 'measuredFev1', kind: 'number', label: 'Measured FEV1 (optional, for % predicted)', unit: 'L' },
      { dom: 'ps-fvc', arg: 'measuredFvc', kind: 'number', label: 'Measured FVC (optional, for % predicted)', unit: 'L' },
    ],
  },
  {
    id: 'mmrc-dyspnea',
    summary: 'mMRC dyspnea scale: the single 0-4 self-reported breathlessness grade with its descriptor.',
    compute: P.mmrcDyspnea,
    fields: [
      { dom: 'md-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'mMRC dyspnea grade', to: (v) => Number(v) },
    ],
  },
];
