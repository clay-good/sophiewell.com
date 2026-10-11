// spec-v1634 MCP adapter: ade-cost-avoidance in lib/ade-cost-avoidance-v1634.js. The dom keys
// mirror views/group-v1634.js and META['ade-cost-avoidance'].example. Operational domain.

import * as CA from '../../lib/ade-cost-avoidance-v1634.js';

export default [
  {
    id: 'ade-cost-avoidance',
    summary: 'Estimated cost avoidance from pharmacist interventions, by the Nesbit method. Each intervention\'s probability class (none 0, very low 0.01, low 0.1, medium 0.4, high 0.6) is multiplied by the cost of the adverse event it averts and the products are summed, by class and in total, with an optional net of pharmacist time. The classes and costs are the reader\'s judgment; this is an estimate, not money saved.',
    compute: CA.adeCostAvoidance,
    fields: [
      { dom: 'aca-lines', arg: 'interventions', kind: 'string', required: true, label: 'Interventions, one per line: class (none, very low, low, medium, high), cost of the event averted, count (optional)' },
      { dom: 'aca-time', arg: 'timeCost', kind: 'number', label: 'Pharmacist time cost, total (optional)' },
    ],
  },
];
