// spec-v1546 MCP adapter: WHO IMCI ORS Plans A, B and C in lib/imci-ors-plan-v1546.js.
// The dom keys mirror views/group-v1546.js and META['imci-ors-plan'].example. Clinical domain.

import * as P from '../../lib/imci-ors-plan-v1546.js';

export default [
  {
    id: 'imci-ors-plan',
    summary: 'Gives the fluid for a child under 5 with diarrhea on WHO Plan A, B or C. Plan A per loose stool, Plan B ORS over 4 hours by weight (or age band), Plan C IV 100 mL/kg with the timing by age, or tube ORS without IV. Severe malnutrition is excluded.',
    compute: P.imciOrsPlan,
    fields: [
      { dom: 'ors-plan', arg: 'plan', kind: 'enum', required: true, label: 'Plan A, B or C', values: P.PLAN_OPTIONS.map((d) => d.value) },
      { dom: 'ors-age', arg: 'age', kind: 'number', required: true, label: 'Age in months', min: 0, max: 59.9 },
      { dom: 'ors-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (needed for Plan C)', min: 0.5, max: 50 },
      { dom: 'ors-sam', arg: 'sam', kind: 'enum', required: true, label: 'Severe acute malnutrition', values: P.SAM_OPTIONS.map((d) => d.value) },
      { dom: 'ors-route', arg: 'route', kind: 'enum', label: 'Plan C: what is possible here', values: P.ROUTE_OPTIONS.map((d) => d.value) },
    ],
  },
];
