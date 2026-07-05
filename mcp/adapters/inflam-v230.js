// spec-v183 MCP wave 52: adapters for the four prognostic inflammation indices
// in lib/inflam-v230.js — the lymphocyte-to-monocyte ratio (LMR), the systemic
// inflammation response index (SIRI), the pan-immune-inflammation value (PIV),
// and the CRP-to-albumin ratio (CAR). dom keys mirror views/group-v230.js; all
// inputs are numeric.

import * as F from '../../lib/inflam-v230.js';

export default [
  {
    id: 'lmr',
    summary: 'Lymphocyte-to-monocyte ratio: absolute lymphocyte count / absolute monocyte count; a prognostic inflammation marker where a LOWER value is less favorable.',
    compute: F.lmr,
    fields: [
      { dom: 'lmr-alc', arg: 'alc', kind: 'number', required: true, label: 'Absolute lymphocyte count', unit: '×10³/µL' },
      { dom: 'lmr-amc', arg: 'amc', kind: 'number', required: true, label: 'Absolute monocyte count', unit: '×10³/µL' },
    ],
  },
  {
    id: 'siri',
    summary: 'Systemic inflammation response index: ANC × AMC / ALC (Qi 2016); higher values reflect a more pro-inflammatory state.',
    compute: F.siri,
    fields: [
      { dom: 'siri-anc', arg: 'anc', kind: 'number', required: true, label: 'Absolute neutrophil count', unit: '×10³/µL' },
      { dom: 'siri-amc', arg: 'amc', kind: 'number', required: true, label: 'Absolute monocyte count', unit: '×10³/µL' },
      { dom: 'siri-alc', arg: 'alc', kind: 'number', required: true, label: 'Absolute lymphocyte count', unit: '×10³/µL' },
    ],
  },
  {
    id: 'piv',
    summary: 'Pan-immune-inflammation value: ANC × platelets × AMC / ALC (Fucà 2020); higher values reflect a more pro-inflammatory state.',
    compute: F.piv,
    fields: [
      { dom: 'piv-anc', arg: 'anc', kind: 'number', required: true, label: 'Absolute neutrophil count', unit: '×10³/µL' },
      { dom: 'piv-plt', arg: 'plt', kind: 'number', required: true, label: 'Platelet count', unit: '×10³/µL' },
      { dom: 'piv-amc', arg: 'amc', kind: 'number', required: true, label: 'Absolute monocyte count', unit: '×10³/µL' },
      { dom: 'piv-alc', arg: 'alc', kind: 'number', required: true, label: 'Absolute lymphocyte count', unit: '×10³/µL' },
    ],
  },
  {
    id: 'crp-albumin-ratio',
    summary: 'CRP-to-albumin ratio: C-reactive protein (mg/L) / serum albumin (g/dL); a combined inflammation / nutrition marker where higher values are less favorable.',
    compute: F.car,
    fields: [
      { dom: 'car-crp', arg: 'crp', kind: 'number', required: true, label: 'C-reactive protein', unit: 'mg/L' },
      { dom: 'car-alb', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/dL' },
    ],
  },
];
