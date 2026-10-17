// spec-v1634 MCP adapter: two-by-two-effect in lib/two-by-two-effect-v1634.js. The dom keys mirror
// views/group-v1634.js and META['two-by-two-effect'].example. Clinical domain.

import * as TT from '../../lib/two-by-two-effect-v1634.js';

export default [
  {
    id: 'two-by-two-effect',
    summary: 'Risk ratio, odds ratio and risk difference with 95% intervals from event counts in two groups. It also gives the number needed to treat with its interval, which passes through infinity when the difference may be zero. A zero cell withholds the ratio interval it breaks.',
    compute: TT.twoByTwoEffect,
    fields: [
      { dom: 'tte-a', arg: 'events1', kind: 'number', required: true, label: 'Group 1 (treated or exposed): events' },
      { dom: 'tte-n1', arg: 'total1', kind: 'number', required: true, label: 'Group 1: total' },
      { dom: 'tte-c', arg: 'events2', kind: 'number', required: true, label: 'Group 2 (comparison): events' },
      { dom: 'tte-n2', arg: 'total2', kind: 'number', required: true, label: 'Group 2: total' },
    ],
  },
];
