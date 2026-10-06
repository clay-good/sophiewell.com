// spec-v1561 MCP adapter: leprosy-pep-rifampicin in lib/leprosy-pep-rifampicin-v1561.js.
// The dom keys mirror views/group-v1561.js and META['leprosy-pep-rifampicin'].example. Clinical domain.

import * as M from '../../lib/leprosy-pep-rifampicin-v1561.js';

export default [
  {
    id: 'leprosy-pep-rifampicin',
    summary: 'Gives the WHO single-dose rifampicin for a leprosy contact by age and weight. 600, 450 or 300 mg, or 10-15 mg/kg under 20 kg, from 2 years, after excluding leprosy and TB.',
    compute: M.leprosyPepRifampicin,
    fields: [
      { dom: 'sdr-age', arg: 'age', kind: 'number', required: true, label: 'Age in years', min: 0, max: 120 },
      { dom: 'sdr-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 2, max: 250 },
    ],
  },
];
