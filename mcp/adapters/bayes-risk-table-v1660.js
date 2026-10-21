// spec-v1660 MCP adapter: bayes-risk-table in lib/bayes-risk-table-v1660.js. The dom keys mirror views/group-v1660.js and
// META['bayes-risk-table'].example.

import * as BRT from '../../lib/bayes-risk-table-v1660.js';

export default [
  {
    id: 'bayes-risk-table',
    summary: 'A Bayesian risk table for two or more hypotheses: prior, each conditional, joint and posterior. Priors must sum to 1 unless you ask for them to be normalized.',
    compute: BRT.bayesRiskTable,
    fields: [
      { dom: 'brt-hyp', arg: 'hypotheses', kind: 'string', required: true, label: 'One hypothesis per line: name, prior, then a conditional per piece of evidence' },
      { dom: 'brt-norm', arg: 'normalize', kind: 'enum', values: ['yes', 'no'], required: false, label: 'Normalize priors that do not sum to 1' },
    ]
  },
];
