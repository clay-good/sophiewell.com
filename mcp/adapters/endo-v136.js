// spec-v183 (wave 2): adapters for the five lib/endo-v136.js metabolic /
// endocrine tiles. dom keys mirror views/group-v136.js and META.example.fields;
// arg names mirror the lib signatures. The treatment / sex / unit selects pass
// their string value straight through (the lib reads 'yes'/'no').

import * as E from '../../lib/endo-v136.js';

const YESNO = ['no', 'yes'];

export default [
  {
    id: 'homa-ir',
    summary: 'HOMA-IR insulin-resistance index (and the linear HOMA-%B beta-cell estimate) from fasting insulin and glucose.',
    compute: E.homaIr,
    fields: [
      { dom: 'hir-insulin', arg: 'insulin', kind: 'number', required: true, label: 'Fasting insulin', unit: 'uU/mL' },
      { dom: 'hir-glucose', arg: 'glucose', kind: 'number', required: true, label: 'Fasting glucose' },
      { dom: 'hir-unit', arg: 'unit', kind: 'enum', values: ['mgdl', 'mmol'], label: 'Glucose unit' },
    ],
  },
  {
    id: 'quicki',
    summary: 'QUICKI quantitative insulin-sensitivity check index from fasting insulin and glucose (mg/dL).',
    compute: E.quicki,
    fields: [
      { dom: 'qui-insulin', arg: 'insulin', kind: 'number', required: true, label: 'Fasting insulin', unit: 'uU/mL' },
      { dom: 'qui-glucose', arg: 'glucose', kind: 'number', required: true, label: 'Fasting glucose', unit: 'mg/dL' },
    ],
  },
  {
    id: 'tyg-index',
    summary: 'Triglyceride-glucose (TyG) index, a surrogate of insulin resistance from fasting triglycerides and glucose (mg/dL).',
    compute: E.tygIndex,
    fields: [
      { dom: 'tyg-tg', arg: 'tg', kind: 'number', required: true, label: 'Fasting triglycerides', unit: 'mg/dL' },
      { dom: 'tyg-glucose', arg: 'glucose', kind: 'number', required: true, label: 'Fasting glucose', unit: 'mg/dL' },
    ],
  },
  {
    id: 'metabolic-syndrome',
    summary: 'Metabolic syndrome by the Harmonized (any 3 of 5) or IDF (central obesity + 2) definition from waist, lipids, BP, and glucose with treatment flags.',
    compute: E.metabolicSyndrome,
    fields: [
      { dom: 'ms-def', arg: 'definition', kind: 'enum', values: ['harmonized', 'idf'], label: 'Definition' },
      { dom: 'ms-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], label: 'Sex' },
      { dom: 'ms-wstd', arg: 'waistStandard', kind: 'enum', values: ['us', 'europid', 'asian'], label: 'Waist cut-point standard' },
      { dom: 'ms-waist', arg: 'waist', kind: 'number', required: true, label: 'Waist circumference', unit: 'cm' },
      { dom: 'ms-tg', arg: 'tg', kind: 'number', required: true, label: 'Triglycerides', unit: 'mg/dL' },
      { dom: 'ms-tgtx', arg: 'tgTreated', kind: 'enum', values: YESNO, label: 'On treatment for high triglycerides' },
      { dom: 'ms-hdl', arg: 'hdl', kind: 'number', required: true, label: 'HDL cholesterol', unit: 'mg/dL' },
      { dom: 'ms-hdltx', arg: 'hdlTreated', kind: 'enum', values: YESNO, label: 'On treatment for low HDL' },
      { dom: 'ms-sbp', arg: 'sbp', kind: 'number', required: true, label: 'Systolic BP', unit: 'mmHg' },
      { dom: 'ms-dbp', arg: 'dbp', kind: 'number', required: true, label: 'Diastolic BP', unit: 'mmHg' },
      { dom: 'ms-bptx', arg: 'bpTreated', kind: 'enum', values: YESNO, label: 'On antihypertensive treatment' },
      { dom: 'ms-glu', arg: 'glucose', kind: 'number', required: true, label: 'Fasting glucose', unit: 'mg/dL' },
      { dom: 'ms-glutx', arg: 'glucoseTreated', kind: 'enum', values: YESNO, label: 'On treatment for elevated glucose' },
    ],
  },
  {
    id: 'osteoporosis-prescreen',
    summary: 'OST and ORAI osteoporosis DXA pre-screen indices from age, weight, and current estrogen use.',
    compute: E.osteoporosisPrescreen,
    fields: [
      { dom: 'ost-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ost-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'ost-estrogen', arg: 'estrogen', kind: 'enum', values: YESNO, label: 'Currently using estrogen' },
    ],
  },
];
