// spec-v1639 MCP adapter: lai-antipsychotic-missed-dose in
// lib/lai-antipsychotic-missed-dose-v1639.js. The dom keys mirror views/group-v1639.js and
// META['lai-antipsychotic-missed-dose'].example. Clinical domain. Eleven label rows.

import * as LM from '../../lib/lai-antipsychotic-missed-dose-v1639.js';

export default [
  {
    id: 'lai-antipsychotic-missed-dose',
    summary: 'The label\'s row for a missed long-acting injectable antipsychotic, from the days since the last injection. Invega Sustenna, Erzofri, Invega Trinza and Invega Hafyera (re-initiation tables); Aristada Table 3 by last dose; Abilify Maintena and Asimtufii; Uzedy and Perseris (one sentence); Risperdal Consta and Rykindo (no rule stated). Shows both rows at an edge the label leaves open.',
    compute: LM.laiAntipsychoticMissedDose,
    fields: [
      { dom: 'lmd-product', arg: 'product', kind: 'enum', required: true, values: LM.PRODUCTS.map((p) => p.value), label: 'Product and row' },
      { dom: 'lmd-last', arg: 'lastInjection', kind: 'string', required: true, label: 'Date of the last injection (YYYY-MM-DD)' },
      { dom: 'lmd-today', arg: 'today', kind: 'string', required: true, label: 'Today\'s date (YYYY-MM-DD)' },
    ],
  },
];
