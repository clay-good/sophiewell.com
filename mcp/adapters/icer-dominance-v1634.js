// spec-v1634 MCP adapter: icer-dominance in lib/icer-dominance-v1634.js. The dom key mirrors
// views/group-v1634.js and META['icer-dominance'].example. Operational domain.

import * as IC from '../../lib/icer-dominance-v1634.js';

export default [
  {
    id: 'icer-dominance',
    summary: 'Incremental cost-effectiveness ratios for two or more options, with dominance. It removes options that another beats on both cost and effect, orders the rest by effect, computes each ratio against the option before, removes options ruled out by extended dominance, and lists what is left with the reason for each exclusion. It applies no willingness-to-pay threshold.',
    compute: IC.icerDominance,
    fields: [
      { dom: 'icd-options', arg: 'options', kind: 'string', required: true, label: 'Options, one per line: name, cost, effect (for example QALYs)' },
    ],
  },
];
