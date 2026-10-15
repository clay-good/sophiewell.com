// spec-v1640 MCP adapter: cyp2d6-activity-score in lib/cyp2d6-activity-score-v1640.js. The dom keys mirror
// views/group-v1640.js and META['cyp2d6-activity-score'].example. The CPIC tables are read from disk.

import * as CA from '../../lib/cyp2d6-activity-score-v1640.js';
import { cpicFromDisk } from '../cpic-disk.js';

export default [
  {
    id: 'cyp2d6-activity-score',
    summary: 'The CYP2D6 activity score and phenotype for two alleles, copy numbers and tandems included. Each value comes from CPIC\'s allele and phenotype tables (CC0), so *1x2 and *36+*10 count only as CPIC lists them. A duplication on an unnamed allele gives both readings.',
    compute: (a) => CA.cyp2d6ActivityScore(a, cpicFromDisk(), new Date()),
    fields: [
      { dom: 'cas-a1', arg: 'allele1', kind: 'string', required: true, label: 'First CYP2D6 allele as reported (for example *1 or *1x2)' },
      { dom: 'cas-a2', arg: 'allele2', kind: 'string', required: true, label: 'Second CYP2D6 allele as reported' },
      { dom: 'cas-dup', arg: 'duplication', kind: 'enum', required: false, values: CA.DUPLICATION.map((d) => d.value), label: 'Duplication reported without naming the allele: no or unknown' },
    ],
  },
];
