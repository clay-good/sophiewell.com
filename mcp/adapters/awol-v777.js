// spec-v777 MCP adapter: AWOL delirium risk score in lib/awol-v777.js.
// The dom keys mirror the browser renderer (views/group-v777.js) and META['awol'].example.
// Three booleans plus a five-level severity enum; a count 0-4 maps to an observed
// delirium incidence. Clinical domain.

import { awol } from '../../lib/awol-v777.js';

export default [
  {
    id: 'awol',
    summary: 'AWOL delirium risk score (Douglas 2013): predicts delirium during a medical admission. One point each for age >=80, failure to spell "world" backward, disorientation to place, and a nurse rating of moderately ill or worse; total 0-4. Observed delirium: 0 approx 2%, 1 approx 4%, 2 approx 14%, 3 approx 20%, 4 approx 64%. Predictive, not a delirium screen.',
    compute: awol,
    fields: [
      { dom: 'awol-age', arg: 'age80', kind: 'boolean', required: false, label: 'Age 80 years or older' },
      { dom: 'awol-spell', arg: 'spellFail', kind: 'boolean', required: false, label: 'Cannot spell world backward' },
      { dom: 'awol-orient', arg: 'disoriented', kind: 'boolean', required: false, label: 'Not oriented to place' },
      { dom: 'awol-illness', arg: 'illness', kind: 'enum', values: ['not-ill', 'mildly-ill', 'moderately-ill', 'severely-ill', 'moribund'], required: false, label: 'Nurse-rated illness severity' },
    ],
  },
];
