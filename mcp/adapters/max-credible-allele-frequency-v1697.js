// spec-v1697 MCP adapter: max-credible-allele-frequency in lib/max-credible-allele-frequency-v1697.js. The dom
// keys mirror views/group-v1697.js and META['max-credible-allele-frequency'].example.

import * as MAF from '../../lib/max-credible-allele-frequency-v1697.js';

export default [
  {
    id: 'max-credible-allele-frequency',
    summary: 'Maximum credible allele frequency for a dominant or recessive disease model, and its allele-count ceiling (Whiffin 2017). An allele count or filtering allele frequency is tested against it.',
    compute: MAF.maxCredibleAlleleFrequency,
    fields: [
      { dom: 'maf-mode', arg: 'inheritance', kind: 'enum', values: ['dominant', 'recessive'], required: true, label: 'Inheritance' },
      { dom: 'maf-prev', arg: 'prevalence', kind: 'string', required: true, label: 'Disease prevalence (1 in N or a fraction)' },
      { dom: 'maf-allelic', arg: 'allelicContribution', kind: 'string', required: true, label: 'Maximum allelic contribution' },
      { dom: 'maf-genetic', arg: 'geneticContribution', kind: 'string', required: false, label: 'Maximum genetic contribution (default 1)' },
      { dom: 'maf-pen', arg: 'penetrance', kind: 'string', required: true, label: 'Penetrance' },
      { dom: 'maf-an', arg: 'alleleNumber', kind: 'string', required: false, label: 'Allele number (AN)' },
      { dom: 'maf-ac', arg: 'alleleCount', kind: 'string', required: false, label: 'Allele count (AC)' },
      { dom: 'maf-faf', arg: 'filteringAf', kind: 'string', required: false, label: 'Filtering allele frequency (FAF)' },
    ]
  },
];
