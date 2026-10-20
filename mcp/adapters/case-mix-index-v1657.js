// spec-v1657 MCP adapter: case-mix-index in lib/case-mix-index-v1657.js. The dom keys mirror views/group-v1657.js and
// META['case-mix-index'].example.

import * as CMI from '../../lib/case-mix-index-v1657.js';

export default [
  {
    id: 'case-mix-index',
    summary: 'Case mix index from a list of discharges\' MS-DRG relative weights: their sum over the number of discharges. Paste weights from CMS IPPS Table 5 for the right fiscal year.',
    compute: CMI.caseMixIndex,
    fields: [
      { dom: 'cmi-weights', arg: 'weights', kind: 'string', required: true, label: 'MS-DRG relative weights, one discharge per line, or a weight and a count' },
      { dom: 'cmi-rate', arg: 'rate', kind: 'number', required: false, label: 'Payment rate per weight of 1.0 ($)' },
    ]
  },
];
