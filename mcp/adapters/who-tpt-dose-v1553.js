// spec-v1553 MCP adapter: who-tpt-dose in lib/who-tpt-dose-v1553.js.
// The dom keys mirror views/group-v1553.js and META['who-tpt-dose'].example. Clinical domain.

import * as M from '../../lib/who-tpt-dose-v1553.js';

export default [
  {
    id: 'who-tpt-dose',
    summary: 'Gives WHO TB preventive treatment tablets by weight band. 3HP, 3HR, 6H/9H, 4R, 1HP or 6Lfx (2024), with the schedule, the infant age splits, and the antiretroviral interactions.',
    compute: M.whoTptDose,
    fields: [
      { dom: 'tpt-regimen', arg: 'regimen', kind: 'enum', required: true, label: 'Regimen', values: M.REGIMEN_OPTIONS.map((d) => d.value) },
      { dom: 'tpt-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg', min: 1, max: 250 },
      { dom: 'tpt-age', arg: 'age', kind: 'number', required: true, label: 'Age in years (for infants, 3 months = 0.25)', min: 0, max: 120 },
    ],
  },
];
