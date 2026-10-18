// spec-v1635 MCP adapter: relative-dose-intensity in lib/relative-dose-intensity-v1635.js. The dom keys mirror
// views/group-v1635.js and META['relative-dose-intensity'].example. Clinical domain.

import * as RD from '../../lib/relative-dose-intensity-v1635.js';

export default [
  {
    id: 'relative-dose-intensity',
    summary: 'How much of a planned chemotherapy dose intensity one drug actually delivered. It is reported over the cycles given and over the planned course, the two ways papers time it, with the loss split between dose reductions and delays.',
    compute: RD.relativeDoseIntensity,
    fields: [
      { dom: 'rdi-dose', arg: 'plannedDose', kind: 'number', required: true, label: 'Planned dose per cycle (mg, mg/m2 or units)' },
      { dom: 'rdi-cycle', arg: 'cycleDays', kind: 'number', required: true, label: 'Cycle length', unit: 'days' },
      { dom: 'rdi-cycles', arg: 'plannedCycles', kind: 'number', required: true, label: 'Planned cycles' },
      { dom: 'rdi-given', arg: 'delivered', kind: 'string', required: true, label: 'Cycles given, one per line: YYYY-MM-DD dose' },
    ],
  },
];
