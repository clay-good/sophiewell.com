// spec-v681 MCP adapter: Sano IVIG-resistance score in lib/sano-kawasaki-v681.js.
// The dom keys mirror the browser renderer (views/group-v681.js) and
// META['sano-kawasaki'].example. Three pre-treatment labs; a count of criteria 0-3
// predicts IVIG resistance in Kawasaki disease. Clinical domain.

import { sanoKawasaki } from '../../lib/sano-kawasaki-v681.js';

export default [
  {
    id: 'sano-kawasaki',
    summary: 'Sano score (Sano 2007): predicts IVIG resistance in Kawasaki disease from three pre-treatment labs. AST >=200 IU/L, total bilirubin >=0.9 mg/dL, and CRP >=7 mg/dL each add 1 point (total 0-3). Meeting >=2 of the 3 criteria = high risk of IVIG resistance.',
    compute: sanoKawasaki,
    fields: [
      { dom: 'sano-ast', arg: 'ast', kind: 'number', unit: 'IU/L', required: true, label: 'AST (IU/L)' },
      { dom: 'sano-bili', arg: 'bilirubin', kind: 'number', unit: 'mg/dL', required: true, label: 'Total bilirubin (mg/dL)' },
      { dom: 'sano-crp', arg: 'crp', kind: 'number', unit: 'mg/dL', required: true, label: 'CRP (mg/dL)' },
    ],
  },
];
