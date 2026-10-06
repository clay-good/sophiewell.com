// spec-v1559 MCP adapter: newborn-hypoglycemia-who in lib/newborn-hypoglycemia-who-v1559.js.
// The dom keys mirror views/group-v1559.js and META['newborn-hypoglycemia-who'].example. Clinical domain.

import * as M from '../../lib/newborn-hypoglycemia-who-v1559.js';

export default [
  {
    id: 'newborn-hypoglycemia-who',
    summary: 'Applies WHO newborn glucose thresholds. An at-risk newborn kept at 2.6 mmol/L or more (feed and recheck); a sick young infant under 2.2 gets 10% glucose 2 mL/kg then 5 mL/kg an hour.',
    compute: M.newbornHypoglycemiaWho,
    fields: [
      { dom: 'nh-pop', arg: 'population', kind: 'enum', required: true, label: 'Baby', values: M.POP_OPTIONS.map((d) => d.value) },
      { dom: 'nh-glu', arg: 'glucose', kind: 'number', label: 'Blood glucose (leave blank if it cannot be measured)', min: 0.1, max: 900 },
      { dom: 'nh-unit', arg: 'unit', kind: 'enum', label: 'Unit', values: M.UNIT_OPTIONS.map((d) => d.value) },
      { dom: 'nh-weight', arg: 'weight', kind: 'number', label: 'Weight in kg (sick infant)', min: 0.4, max: 10 },
    ],
  },
];
