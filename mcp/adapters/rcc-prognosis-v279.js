// spec-v279 MCP wave (ninety-sixth): adapters for the two resected renal-cell-
// carcinoma prognosis tiles in lib/rcc-prognosis-v279.js — the Leibovich
// progression score and the UCLA Integrated Staging System (UISS, localized
// N0M0 branch). dom keys mirror the browser renderer (views/group-v279.js) and
// each tile's META.example.fields.

import * as F from '../../lib/rcc-prognosis-v279.js';

export default [
  {
    id: 'leibovich-rcc',
    summary: 'Leibovich progression score (Leibovich 2003, clear-cell RCC after radical nephrectomy) — an additive 0-11 recurrence-risk model over five pathology factors (primary tumor stage, regional nodes, tumor size, nuclear/Fuhrman grade, coagulative necrosis). Bands: low 0-2, intermediate 3-5, high >= 6, with 5-year metastasis-free survival roughly 97% / 74% / 31%. Reports a recurrence risk, not a surveillance or adjuvant-therapy order.',
    compute: F.leibovichRcc,
    fields: [
      { dom: 'leib-pt', arg: 'ptStage', kind: 'enum', values: ['pt1a', 'pt1b', 'pt2', 'pt3-4'], required: true, label: 'Primary tumor stage (pT1a / pT1b / pT2 / pT3-pT4)' },
      { dom: 'leib-n', arg: 'nodes', kind: 'enum', values: ['n0', 'n1-2'], required: true, label: 'Regional lymph nodes (pNx/pN0 or pN1/pN2)' },
      { dom: 'leib-size', arg: 'size', kind: 'enum', values: ['lt10', 'ge10'], required: true, label: 'Tumor size (< 10 cm or >= 10 cm)' },
      { dom: 'leib-grade', arg: 'grade', kind: 'enum', values: ['g1-2', 'g3', 'g4'], required: true, label: 'Nuclear (Fuhrman) grade' },
      { dom: 'leib-necrosis', arg: 'necrosis', kind: 'bool', label: 'Coagulative tumor necrosis present' },
    ],
  },
  {
    id: 'uiss-rcc',
    summary: 'UCLA Integrated Staging System (UISS; Zisman 2001/2002, Patard 2004 validation) for surgically resected, LOCALIZED (N0M0) renal cell carcinoma — integrates 1997 TNM stage, Fuhrman grade, and ECOG performance status into low / intermediate / high tiers with 5-year overall survival roughly 92% / 67% / 44%. The node-positive / metastatic branch is out of scope (use the metastatic-RCC models, imdc-rcc / mskcc-rcc). Reports a risk tier, not a treatment order.',
    compute: F.uissRcc,
    fields: [
      { dom: 'uiss-t', arg: 'tStage', kind: 'enum', values: ['t1', 't2', 't3', 't4'], required: true, label: 'Primary tumor stage (T, 1997 TNM)' },
      { dom: 'uiss-grade', arg: 'grade', kind: 'enum', values: ['1', '2', '3', '4'], required: true, label: 'Fuhrman grade' },
      { dom: 'uiss-ecog', arg: 'ecog', kind: 'enum', values: ['ecog0', 'ecog1plus'], required: true, label: 'ECOG performance status (0 or >= 1)' },
    ],
  },
];
