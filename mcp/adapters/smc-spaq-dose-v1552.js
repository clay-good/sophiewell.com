// spec-v1552 MCP adapter: SMC SP+AQ dose in lib/smc-spaq-dose-v1552.js.
// The dom keys mirror views/group-v1552.js and META['smc-spaq-dose'].example. Clinical domain.

import * as M from '../../lib/smc-spaq-dose-v1552.js';

export default [
  {
    id: 'smc-spaq-dose',
    summary: 'Gives the seasonal malaria chemoprevention SP+AQ dose by age. The infant or child blister pack, weight-based dosing from 60 months, and the contraindications that stop a cycle.',
    compute: M.smcSpaqDose,
    fields: [
      { dom: 'smc-age', arg: 'age', kind: 'number', required: true, label: 'Age in months', min: 0, max: 180 },
      { dom: 'smc-contra', arg: 'contra', kind: 'enum', required: true, label: 'Contraindication', values: M.CONTRA_OPTIONS.map((d) => d.value) },
      { dom: 'smc-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (needed from 60 months)', min: 2, max: 80 },
    ],
  },
];
