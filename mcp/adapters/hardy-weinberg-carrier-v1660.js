// spec-v1660 MCP adapter: hardy-weinberg-carrier in lib/hardy-weinberg-carrier-v1660.js. The dom keys mirror views/group-v1660.js and
// META['hardy-weinberg-carrier'].example.

import * as HW from '../../lib/hardy-weinberg-carrier-v1660.js';

export default [
  {
    id: 'hardy-weinberg-carrier',
    summary: 'Carrier frequency 2pq from the incidence of an autosomal recessive condition, or from the allele frequency. The Hardy-Weinberg proportions, with Hardy\'s assumptions printed.',
    compute: HW.hardyWeinbergCarrier,
    fields: [
      { dom: 'hw-from', arg: 'from', kind: 'enum', values: ['incidence', 'allele'], required: true, label: 'Enter' },
      { dom: 'hw-incidence', arg: 'incidence', kind: 'string', required: false, label: 'Incidence, as 1 in N, a fraction, a percent or a decimal' },
      { dom: 'hw-allele', arg: 'alleleFrequency', kind: 'string', required: false, label: 'Allele frequency q' },
    ]
  },
];
