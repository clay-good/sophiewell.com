// spec-v1660 MCP adapter: residual-carrier-risk in lib/residual-carrier-risk-v1660.js. The dom keys mirror views/group-v1660.js and
// META['residual-carrier-risk'].example.

import * as RES from '../../lib/residual-carrier-risk-v1660.js';

export default [
  {
    id: 'residual-carrier-risk',
    summary: 'Residual carrier risk after a negative screen, by Bayes\' theorem from the carrier frequency and the test\'s detection rate. The full Bayes table is shown.',
    compute: RES.residualCarrierRisk,
    fields: [
      { dom: 'res-cf', arg: 'carrierFrequency', kind: 'string', required: true, label: 'Prior carrier frequency (from the report)' },
      { dom: 'res-dr', arg: 'detectionRate', kind: 'string', required: true, label: 'Detection rate of the test in that population' },
    ]
  },
];
