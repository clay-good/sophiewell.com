// spec-v1473: MCP adapter. The dom keys mirror views/group-v1473.js and this tile's META example.

import * as GR from '../../lib/glycemia-risk-index-v1473.js';

export default [
  {
    id: 'glycemia-risk-index',
    summary: 'Scores the Glycemia Risk Index (0 to 100) and its zone A to E from the time a CGM spent in four glucose bands. It weights hypoglycemia 3.0 and hyperglycemia 1.6, capped at 100.',
    compute: GR.glycemiaRiskIndex,
    fields: [
      { dom: 'gri-vlow', arg: 'vlow', kind: 'number', required: true, label: 'Time below 54 mg/dL (%)', unit: '%' },
      { dom: 'gri-low', arg: 'low', kind: 'number', required: true, label: 'Time from 54 to 69 mg/dL (%)', unit: '%' },
      { dom: 'gri-high', arg: 'high', kind: 'number', required: true, label: 'Time from 181 to 250 mg/dL (%)', unit: '%' },
      { dom: 'gri-vhigh', arg: 'vhigh', kind: 'number', required: true, label: 'Time above 250 mg/dL (%)', unit: '%' },
      { dom: 'gri-tir', arg: 'tir', kind: 'number', required: false, label: 'Time from 70 to 180 mg/dL (%)', unit: '%' },
    ],
  },
];
