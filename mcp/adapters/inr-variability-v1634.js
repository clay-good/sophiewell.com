// spec-v1634 MCP adapter: inr-variability in lib/inr-variability-v1634.js. The dom keys mirror
// views/group-v1634.js and META['inr-variability'].example. Clinical domain.

import * as IV from '../../lib/inr-variability-v1634.js';

export default [
  {
    id: 'inr-variability',
    summary: 'How unstable warfarin control has been, as Fihn\'s variance growth rate (method A). Each INR\'s squared distance from the target is divided by the weeks since the previous INR, then averaged.',
    compute: IV.inrVariability,
    fields: [
      { dom: 'iv-series', arg: 'series', kind: 'string', required: true, label: 'INRs, one per line: INR then weeks since the previous INR' },
      { dom: 'iv-target', arg: 'target', kind: 'number', required: true, label: 'Target INR' },
    ],
  },
];
