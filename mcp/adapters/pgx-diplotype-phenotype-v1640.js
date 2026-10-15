// spec-v1640 MCP adapter: pgx-diplotype-phenotype in lib/pgx-diplotype-phenotype-v1640.js. The dom keys
// mirror views/group-v1640.js and META['pgx-diplotype-phenotype'].example. The CPIC tables are the
// data/cpic files the website ships, read from disk (mcp/cpic-disk.js).

import * as PD from '../../lib/pgx-diplotype-phenotype-v1640.js';
import { cpicFromDisk } from '../cpic-disk.js';

export default [
  {
    id: 'pgx-diplotype-phenotype',
    summary: 'CPIC\'s phenotype for two alleles of a pharmacogene, as the lab report prints them. Covers CYP2C19, CYP2C9, TPMT, NUDT15, SLCO1B1, DPYD, G6PD and others, with each allele\'s function and CPIC\'s description. Read from CPIC\'s database (CC0); no allele calling and no blank allele read as normal.',
    compute: (a) => PD.pgxDiplotypePhenotype(a, cpicFromDisk(), new Date()),
    fields: [
      { dom: 'pdp-gene', arg: 'gene', kind: 'enum', required: true, values: PD.GENES.map((g) => g.value), label: 'Gene' },
      { dom: 'pdp-a1', arg: 'allele1', kind: 'string', required: true, label: 'First allele, as the report prints it (for example *2)' },
      { dom: 'pdp-a2', arg: 'allele2', kind: 'string', required: false, label: 'Second allele (blank only for one G6PD copy or an MT-RNR1 variant)' },
    ],
  },
];
