// spec-v1634 MCP adapter: or-rr-to-nnt in lib/or-rr-to-nnt-v1634.js. The dom keys mirror
// views/group-v1634.js and META['or-rr-to-nnt'].example. Clinical domain.

import * as ON from '../../lib/or-rr-to-nnt-v1634.js';

export default [
  {
    id: 'or-rr-to-nnt',
    summary: 'Number needed to treat from an odds ratio or relative risk and a baseline risk. It applies the published formula for the measure chosen, gives the risk with treatment and the absolute risk difference, and carries the confidence limits through; an interval that includes no difference is shown passing through infinity. It restates the ratio at one baseline risk and does not judge the evidence.',
    compute: ON.orRrToNnt,
    fields: [
      { dom: 'orn-measure', arg: 'measure', kind: 'enum', required: true, values: ON.MEASURES.map((m) => m.value), label: 'Effect measure' },
      { dom: 'orn-ratio', arg: 'ratio', kind: 'number', required: true, label: 'Odds ratio or relative risk' },
      { dom: 'orn-risk', arg: 'baselineRisk', kind: 'number', required: true, label: 'Baseline risk without treatment', unit: '%' },
      { dom: 'orn-lower', arg: 'lower', kind: 'number', label: 'Lower 95% confidence limit (optional)' },
      { dom: 'orn-upper', arg: 'upper', kind: 'number', label: 'Upper 95% confidence limit (optional)' },
    ],
  },
];
