// spec-v1635 MCP adapter: rasburicase-dose in lib/rasburicase-dose-v1635.js. The dom keys mirror
// views/group-v1635.js and META['rasburicase-dose'].example. Clinical domain. One label row: Elitek.

import * as RB from '../../lib/rasburicase-dose-v1635.js';

export default [
  {
    id: 'rasburicase-dose',
    summary: 'Rasburicase dose and vials, as the Elitek label states them. It gives 0.2 mg/kg once daily and the 7.5 mg and 1.5 mg vials that cover it with the least waste, for the labeled course of up to 5 days. G6PD deficiency is a labeled contraindication and returns no dose. Fixed-dose regimens are off-label and are not offered.',
    compute: (args) => RB.rasburicaseDose(args, new Date()),
    fields: [
      { dom: 'rbd-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'rbd-g6pd', arg: 'g6pd', kind: 'enum', required: true, values: RB.G6PD.map((x) => x.value), label: 'G6PD status' },
      { dom: 'rbd-day', arg: 'day', kind: 'number', label: 'Day of the course (optional)' },
    ],
  },
];
