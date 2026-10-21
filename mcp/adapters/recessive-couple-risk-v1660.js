// spec-v1660 MCP adapter: recessive-couple-risk in lib/recessive-couple-risk-v1660.js. The dom keys mirror views/group-v1660.js and
// META['recessive-couple-risk'].example.

import * as CR from '../../lib/recessive-couple-risk-v1660.js';

export default [
  {
    id: 'recessive-couple-risk',
    summary: 'Risk of an affected child for an autosomal recessive condition: partner A\'s carrier risk times partner B\'s, times 1/4. Accepts residual or confirmed carrier risks.',
    compute: CR.recessiveCoupleRisk,
    fields: [
      { dom: 'cr-a', arg: 'riskA', kind: 'string', required: true, label: 'Partner A\'s carrier risk' },
      { dom: 'cr-b', arg: 'riskB', kind: 'string', required: true, label: 'Partner B\'s carrier risk' },
    ]
  },
];
