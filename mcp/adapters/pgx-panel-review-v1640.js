// spec-v1640 MCP adapter: pgx-panel-review in lib/pgx-panel-review-v1640.js. The dom keys mirror
// views/group-v1640.js and META['pgx-panel-review'].example. The CPIC tables are read from disk.

import * as PR from '../../lib/pgx-panel-review-v1640.js';
import { cpicFromDisk } from '../cpic-disk.js';

export default [
  {
    id: 'pgx-panel-review',
    summary: 'Every CPIC recommendation a genotype report changes, sorted Strong first. Takes results such as HLA-B*15:02 positive or CYP2C19 poor metabolizer, lists the FDA table\'s rows for each gene, and gives a CSV. It does not read a medication list.',
    compute: (a) => PR.pgxPanelReview(a, cpicFromDisk(), new Date()),
    fields: [
      { dom: 'pgr-results', arg: 'results', kind: 'string', required: true, label: 'Results, one per line: gene, then the phenotype, activity score or HLA status' },
    ],
  },
];
