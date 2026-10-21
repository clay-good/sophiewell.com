// spec-v1659 MCP adapter: direct-age-standardization in lib/direct-age-standardization-v1659.js. The dom keys mirror views/group-v1659.js and
// META['direct-age-standardization'].example.

import * as DAS from '../../lib/direct-age-standardization-v1659.js';

export default [
  {
    id: 'direct-age-standardization',
    summary: 'A directly age-standardized rate: age-specific rates weighted by a standard population, the 2000 U.S. standard or your own. Each stratum\'s contribution is shown beside the crude rate.',
    compute: DAS.directAgeStandardization,
    fields: [
      { dom: 'das-standard', arg: 'standard', kind: 'enum', values: DAS.STANDARDS.map((x) => x.value), required: true, label: 'Standard population' },
      { dom: 'das-strata', arg: 'strata', kind: 'string', required: true, label: 'Strata, one per line. 2000 standard: youngest, oldest (or +), events, population. Own: label, events, population, standard' },
      { dom: 'das-multiplier', arg: 'multiplier', kind: 'enum', values: ['1000', '10000', '100000'], required: false, label: 'Multiplier (default per 100,000)' },
    ]
  },
];
