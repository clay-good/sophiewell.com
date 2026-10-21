// spec-v1659 MCP adapter: attributable-proportion in lib/attributable-proportion-v1659.js. The dom keys mirror views/group-v1659.js and
// META['attributable-proportion'].example.

import * as AP from '../../lib/attributable-proportion-v1659.js';

export default [
  {
    id: 'attributable-proportion',
    summary: 'The attributable proportion among the exposed, the share of their risk the exposure accounts for, from risks or rates. With the share of the population exposed, also the population attributable fraction (Levin). A lower exposed risk gives the preventive fraction instead.',
    compute: AP.attributableProportion,
    fields: [
      { dom: 'apr-exposed', arg: 'exposed', kind: 'number', required: true, label: 'Risk or rate among the exposed' },
      { dom: 'apr-unexposed', arg: 'unexposed', kind: 'number', required: true, label: 'Risk or rate among the unexposed' },
      { dom: 'apr-prevalence', arg: 'prevalence', kind: 'number', required: false, min: 0, max: 100, label: 'Share of the population exposed, % (optional, for the population fraction)' },
    ]
  },
];
