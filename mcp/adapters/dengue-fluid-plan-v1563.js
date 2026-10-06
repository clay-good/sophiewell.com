// spec-v1563 MCP adapter: the WHO dengue IV fluid ladder in lib/dengue-fluid-plan-v1563.js.
// The dom keys mirror views/group-v1563.js and META['dengue-fluid-plan'].example. Clinical domain.

import * as D from '../../lib/dengue-fluid-plan-v1563.js';

export default [
  {
    id: 'dengue-fluid-plan',
    summary: 'Turns WHO dengue IV fluid rates into mL per hour for a weight. The step-down ladder for warning signs, compensated shock or hypotensive shock, adult or child, reassessed before every step.',
    compute: D.dengueFluidPlan,
    fields: [
      { dom: 'df-group', arg: 'group', kind: 'enum', required: true, label: 'Group', values: D.GROUP_OPTIONS.map((d) => d.value) },
      { dom: 'df-age', arg: 'ageGroup', kind: 'enum', required: true, label: 'Adult or infant/child', values: D.AGE_OPTIONS.map((d) => d.value) },
      { dom: 'df-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight in kg (ideal body weight if obese)', min: 1, max: 250 },
    ],
  },
];
