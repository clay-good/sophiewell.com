// spec-v266 MCP wave (one-hundred-fifth): adapter for the SSIGN score in
// lib/rcc-prognosis-v266.js — the Mayo Stage, Size, Grade, and Necrosis score for
// cancer-specific survival in clear-cell RCC. dom keys mirror the browser renderer
// (views/group-v266.js) and META['ssign-score'].example. Each factor is an enum
// band that defaults to its 0 value in the compute when omitted, so no field is
// individually required.

import * as F from '../../lib/rcc-prognosis-v266.js';

export default [
  {
    id: 'ssign-score',
    summary: 'SSIGN score (Mayo Stage, Size, Grade, Necrosis) — a 0-17 score for cancer-specific survival in clear-cell renal cell carcinoma, from primary tumor (pT) stage, regional nodes, distant metastasis, tumor size (< 5 cm vs >= 5 cm), Fuhrman nuclear grade, and coagulative tumor necrosis. Higher totals map to lower 5-year cancer-specific survival. A prognostic score, not a treatment order.',
    compute: F.ssign,
    fields: [
      { dom: 'ss-t', arg: 'tStage', kind: 'enum', values: ['pt1', 'pt2', 'pt3', 'pt4'], label: 'Primary tumor (pT) stage' },
      { dom: 'ss-n', arg: 'nStage', kind: 'enum', values: ['n0', 'n1'], label: 'Regional lymph nodes (pNx/pN0 or pN1/pN2)' },
      { dom: 'ss-m', arg: 'mStage', kind: 'enum', values: ['m0', 'm1'], label: 'Distant metastasis (M0 or M1)' },
      { dom: 'ss-size', arg: 'size', kind: 'enum', values: ['lt5', 'ge5'], label: 'Tumor size (< 5 cm or >= 5 cm)' },
      { dom: 'ss-grade', arg: 'grade', kind: 'enum', values: ['g12', 'g3', 'g4'], label: 'Fuhrman nuclear grade' },
      { dom: 'ss-necrosis', arg: 'necrosis', kind: 'enum', values: ['absent', 'present'], label: 'Coagulative tumor necrosis' },
    ],
  },
];
