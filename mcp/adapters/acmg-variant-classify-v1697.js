// spec-v1697 MCP adapter: acmg-variant-classify in lib/acmg-variant-classify-v1697.js. The dom keys mirror
// views/group-v1697.js and META['acmg-variant-classify'].example.

import * as ACMG from '../../lib/acmg-variant-classify-v1697.js';

export default [
  {
    id: 'acmg-variant-classify',
    summary: 'ACMG/AMP variant class from the evidence codes applied, by the 2015 rules, the 2020 points and the 2018 posterior. Codes go one per line, with a ClinGen strength suffix (PS3_Moderate) when a code is moved to another weight.',
    compute: ACMG.acmgVariantClassify,
    fields: [
      { dom: 'acmg-codes', arg: 'codes', kind: 'string', required: true, label: 'Evidence codes applied, one per line (PVS1, PM2_Supporting)' },
      { dom: 'acmg-prior', arg: 'prior', kind: 'string', required: false, label: 'Prior probability of pathogenicity (default 0.10)' },
      { dom: 'acmg-other', arg: 'otherBenignWeights', kind: 'boolean', required: false, label: 'A gene-specific specification allows a moderate benign weight' },
    ]
  },
];
