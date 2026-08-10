// spec-v697 MCP adapter: King's Score for liver fibrosis in lib/kings-score-v697.js.
// The dom keys mirror the browser renderer (views/group-v697.js) and
// META['kings-score'].example. Four numbers; a formula returns the fibrosis index.
// Clinical domain.

import { kingsScore } from '../../lib/kings-score-v697.js';

export default [
  {
    id: 'kings-score',
    summary: "King's Score (Cross 2009): noninvasive liver-fibrosis index for chronic hepatitis C. Score = (age [years] x AST [U/L] x INR) / platelet count [x10^9/L]. Cut-points (HCV derivation): < 12.3 low, >= 12.3 significant fibrosis (Ishak F3-F6), >= 16.7 cirrhosis. Other liver diseases use different thresholds.",
    compute: kingsScore,
    fields: [
      { dom: 'ks-age', arg: 'age', kind: 'number', unit: 'years', required: true, label: 'Age (years)' },
      { dom: 'ks-ast', arg: 'ast', kind: 'number', unit: 'U/L', required: true, label: 'AST (U/L)' },
      { dom: 'ks-inr', arg: 'inr', kind: 'number', required: true, label: 'INR' },
      { dom: 'ks-plt', arg: 'platelets', kind: 'number', unit: 'x10^9/L', required: true, label: 'Platelet count (x10^9/L)' },
    ],
  },
];
