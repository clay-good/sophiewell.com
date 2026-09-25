// spec-v1471: MCP adapter. The dom keys mirror views/group-v1471.js and this tile's META example.

import * as GM from '../../lib/gmi-v1471.js';

export default [
  {
    id: 'gmi',
    summary: 'Estimates the Glucose Management Indicator, the A1C-like value computed from a CGM mean glucose, in percent and mmol/mol. Uses the 2018 Bergenstal formula, GMI (%) = 3.31 + 0.02392 x mean glucose in mg/dL, and notes whether the wear time meets the consensus recommendation.',
    compute: GM.gmi,
    fields: [
      { dom: 'gmi-mean', arg: 'mean', kind: 'number', required: true, label: 'Mean glucose from the CGM report' },
      { dom: 'gmi-unit', arg: 'unit', kind: 'enum', required: true, label: 'Glucose unit', values: GM.GMI_UNITS.map((x) => x.value) },
      { dom: 'gmi-days', arg: 'days', kind: 'number', required: false, label: 'Days of wear', unit: 'days' },
      { dom: 'gmi-active', arg: 'active', kind: 'number', required: false, label: 'Percent of time the CGM was active', unit: '%' },
    ],
  },
];
