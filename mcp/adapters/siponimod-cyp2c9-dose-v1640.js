// spec-v1640 MCP adapter: siponimod-cyp2c9-dose in lib/siponimod-cyp2c9-dose-v1640.js. The dom key
// mirrors views/group-v1640.js and META['siponimod-cyp2c9-dose'].example. Clinical domain. One label row.

import * as SP from '../../lib/siponimod-cyp2c9-dose-v1640.js';

export default [
  {
    id: 'siponimod-cyp2c9-dose',
    summary: 'The Mayzent label dosage for a CYP2C9 genotype. *1/*1, *1/*2 and *2/*2: a 5-day titration, then 2 mg once daily. *1/*3 and *2/*3: a 4-day titration, then 1 mg once daily. *3/*3 is contraindicated. For any other genotype the label gives no dosage. The label doses by genotype, not by phenotype.',
    compute: (args) => SP.siponimodCyp2c9Dose(args, new Date()),
    fields: [
      { dom: 'sip-genotype', arg: 'genotype', kind: 'enum', required: true, values: SP.GENOTYPES.map((x) => x.value), label: 'CYP2C9 genotype on the report' },
    ],
  },
];
