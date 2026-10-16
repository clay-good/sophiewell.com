// spec-v1635 MCP adapter: pediatric-administered-activity in lib/pediatric-administered-activity-v1635.js.
// The dom keys mirror views/group-v1635.js and META['pediatric-administered-activity'].example. Clinical domain.

import * as PA from '../../lib/pediatric-administered-activity-v1635.js';

export default [
  {
    id: 'pediatric-administered-activity',
    summary: 'A child\'s radiopharmaceutical activity from the 2024 North American guidelines. For the protocol and weight given, it multiplies the weight-based activity by the weight and applies the table\'s minimum and maximum, saying which one applied. A guideline, not an order.',
    compute: PA.pediatricAdministeredActivity,
    fields: [
      { dom: 'paa-protocol', arg: 'protocol', kind: 'enum', required: true, values: PA.PROTOCOLS.map((x) => x.value), label: 'Radiopharmaceutical and protocol' },
      { dom: 'paa-weight', arg: 'weightKg', kind: 'number', label: 'Weight, kg (not needed for the fixed-range rows)' },
    ],
  },
];
