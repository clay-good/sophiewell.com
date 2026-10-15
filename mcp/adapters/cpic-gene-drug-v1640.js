// spec-v1640 MCP adapter: cpic-gene-drug in lib/cpic-gene-drug-v1640.js. The dom keys mirror
// views/group-v1640.js and META['cpic-gene-drug'].example. The CPIC tables are read from disk.

import * as GD from '../../lib/cpic-gene-drug-v1640.js';
import { cpicFromDisk } from '../cpic-disk.js';

export default [
  {
    id: 'cpic-gene-drug',
    summary: 'CPIC\'s recommendation for a drug and a genotype result, beside the FDA table\'s row. Takes a phenotype, activity score or HLA status; quotes CPIC with its classification and guideline, and the FDA Table of Pharmacogenetic Associations row for the same drug and gene. Exact match only; the two sources are not reconciled. With a dose, the arithmetic CPIC\'s own sentence states is applied to it.',
    compute: (a) => GD.cpicGeneDrug(a, cpicFromDisk(), new Date()),
    fields: [
      { dom: 'cgd-drug', arg: 'drug', kind: 'string', required: true, label: 'Drug, by its generic name' },
      { dom: 'cgd-pop', arg: 'population', kind: 'string', required: false, label: 'Population, where CPIC splits the drug (the result names the choices)' },
      { dom: 'cgd-results', arg: 'results', kind: 'string', required: false, label: 'Results, one per line: gene, then the phenotype, activity score or HLA status' },
      { dom: 'cgd-dose', arg: 'dose', kind: 'number', required: false, label: 'The caller\'s own dose in mg, for the arithmetic CPIC\'s sentence states', unit: 'mg' },
      { dom: 'cgd-max', arg: 'maxDose', kind: 'number', required: false, label: 'The maximum recommended dose in mg, where CPIC names one too', unit: 'mg' },
      { dom: 'cgd-weight', arg: 'weight', kind: 'number', required: false, label: 'Weight, for the one CPIC cap that is per kg', unit: 'kg' },
    ],
  },
];
