// spec-v183 MCP wave 53: adapters for the three nutrition/inflammation prognostic
// tools in lib/prognostic-v231.js — the Naples Prognostic Score, the neutrophil-to-
// monocyte ratio (NMR), and the fibrinogen-to-albumin ratio (FAR). dom keys mirror
// views/group-v231.js; all inputs are numeric.

import * as F from '../../lib/prognostic-v231.js';

export default [
  {
    id: 'naples-prognostic-score',
    summary: 'Naples Prognostic Score (Galizia 2017): albumin < 4 g/dL, total cholesterol <= 180 mg/dL, NLR > 2.96, and LMR <= 4.44 each score 1 point (0-4, higher = worse nutrition/inflammation profile).',
    compute: F.naples,
    fields: [
      { dom: 'nap-alb', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/dL' },
      { dom: 'nap-chol', arg: 'cholesterol', kind: 'number', required: true, label: 'Total cholesterol', unit: 'mg/dL' },
      { dom: 'nap-nlr', arg: 'nlr', kind: 'number', required: true, label: 'Neutrophil-to-lymphocyte ratio (NLR)' },
      { dom: 'nap-lmr', arg: 'lmr', kind: 'number', required: true, label: 'Lymphocyte-to-monocyte ratio (LMR)' },
    ],
  },
  {
    id: 'nmr',
    summary: 'Neutrophil-to-monocyte ratio: absolute neutrophil count / absolute monocyte count; a prognostic inflammation marker where higher values are less favorable.',
    compute: F.nmr,
    fields: [
      { dom: 'nmr-anc', arg: 'anc', kind: 'number', required: true, label: 'Absolute neutrophil count', unit: '×10³/µL' },
      { dom: 'nmr-amc', arg: 'amc', kind: 'number', required: true, label: 'Absolute monocyte count', unit: '×10³/µL' },
    ],
  },
  {
    id: 'far',
    summary: 'Fibrinogen-to-albumin ratio: fibrinogen (mg/dL) / serum albumin (g/dL); an inflammation / prothrombotic marker where higher values are less favorable.',
    compute: F.far,
    fields: [
      { dom: 'far-fib', arg: 'fibrinogen', kind: 'number', required: true, label: 'Fibrinogen', unit: 'mg/dL' },
      { dom: 'far-alb', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/dL' },
    ],
  },
];
