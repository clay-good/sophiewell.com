// spec-v1691 MCP adapter: westgard-multirule in lib/westgard-multirule-v1691.js. The dom keys mirror
// views/group-v1658.js and META['westgard-multirule'].example.

import * as WG from '../../lib/westgard-multirule-v1691.js';

export default [
  {
    id: 'westgard-multirule',
    summary: 'The classic Westgard multirule for two control levels: 1-3s, 2-2s, R-4s, 4-1s and 10-x reject a run, with 1-2s as a warning only and never a rejection. R-4s is read within the run; 4-1s and 10-x cross runs and materials, in the order oldest run first and level 1 before level 2. The three-level rules are not evaluated. Rule statements by the first author at westgard.com; they originate in Clin Chem 1981;27:493.',
    compute: WG.westgardMultirule,
    fields: [
      { dom: 'wg-mean1', arg: 'mean1', kind: 'number', required: true, label: 'Level 1 mean' },
      { dom: 'wg-sd1', arg: 'sd1', kind: 'number', required: true, label: 'Level 1 SD (above zero)' },
      { dom: 'wg-mean2', arg: 'mean2', kind: 'number', required: true, label: 'Level 2 mean' },
      { dom: 'wg-sd2', arg: 'sd2', kind: 'number', required: true, label: 'Level 2 SD (above zero)' },
      { dom: 'wg-cur1', arg: 'current1', kind: 'number', required: true, label: "This run's level 1 result" },
      { dom: 'wg-cur2', arg: 'current2', kind: 'number', required: true, label: "This run's level 2 result" },
      { dom: 'wg-prev1', arg: 'previous1', kind: 'string', required: false, label: 'Level 1 previous runs, oldest first, one result per line' },
      { dom: 'wg-prev2', arg: 'previous2', kind: 'string', required: false, label: 'Level 2 previous runs, oldest first, one result per line' },
    ]
  },
];
