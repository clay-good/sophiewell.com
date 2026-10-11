// spec-v1633 MCP adapter: levothyroxine-start-dose in lib/levothyroxine-start-dose-v1633.js. The dom
// keys mirror views/group-v1633.js and META['levothyroxine-start-dose'].example. Clinical domain.
// One label row: Synthroid.

import * as LX from '../../lib/levothyroxine-start-dose-v1633.js';

export default [
  {
    id: 'levothyroxine-start-dose',
    summary: 'The levothyroxine starting dose and titration step on the Synthroid label. Adults: full replacement at 1.6 mcg/kg/day with the tablet strengths either side, and the label\'s unnumbered "lower starting dose" for cardiac risk and geriatric patients. Children: the mcg/kg/day range for the age row, and the one-fourth start for a child at risk of hyperactivity. The weight is the one entered; the label does not say actual or ideal.',
    compute: LX.levothyroxineStartDose,
    fields: [
      { dom: 'lsd-group', arg: 'group', kind: 'enum', required: true, values: LX.GROUPS.map((d) => d.value), label: 'Patient group' },
      { dom: 'lsd-weight', arg: 'weightKg', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'lsd-hyper', arg: 'hyperactivityRisk', kind: 'enum', values: LX.YES_NO.map((d) => d.value), label: 'Children: at risk for hyperactivity, yes or no' },
    ],
  },
];
