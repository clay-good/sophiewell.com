// spec-v653 MCP adapter: WHO/ISUP nucleolar grade for RCC in lib/who-isup-renal-grade-v653.js.
// The dom keys mirror the browser renderer (views/group-v653.js) and
// META['who-isup-renal-grade'].example. A decision-logic classifier returning grade 1-4:
// a grade-4 feature (bool) sets grade 4; otherwise the nucleoli enum maps to grade 1-3.
// Applies to clear-cell/papillary RCC, not chromophobe. Clinical domain.

import { whoIsupRenalGrade } from '../../lib/who-isup-renal-grade-v653.js';

export default [
  {
    id: 'who-isup-renal-grade',
    summary: 'WHO/ISUP nucleolar grade for renal cell carcinoma (replaced Fuhrman in WHO 2016): grade 1 nucleoli inconspicuous at 400x, grade 2 conspicuous at 400x, grade 3 conspicuous at 100x, grade 4 extreme pleomorphism/giant cells/rhabdoid/sarcomatoid. Any grade-4 feature sets grade 4. For clear-cell and papillary RCC.',
    compute: whoIsupRenalGrade,
    fields: [
      { dom: 'isup-nucleoli', arg: 'nucleoli', kind: 'enum', values: ['inconspicuous', 'conspicuous-400', 'conspicuous-100'], required: false, label: 'Nucleolar prominence: inconspicuous (grade 1), conspicuous-400 (grade 2), conspicuous-100 (grade 3)' },
      { dom: 'isup-grade4', arg: 'grade4Features', kind: 'bool', required: false, label: 'Grade-4 feature present: extreme pleomorphism, tumor giant cells, rhabdoid, and/or sarcomatoid (sets grade 4)' },
    ],
  },
];
