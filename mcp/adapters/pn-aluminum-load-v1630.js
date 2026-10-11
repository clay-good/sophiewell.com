// spec-v1630 MCP adapter: pn-aluminum-load in lib/pn-aluminum-load-v1630.js. The dom keys mirror
// views/group-v1630.js and META['pn-aluminum-load'].example. 21 CFR 201.323; clinical domain. Every
// label figure is reader input; none ships and none is defaulted.

import * as PA from '../../lib/pn-aluminum-load-v1630.js';

export default [
  {
    id: 'pn-aluminum-load',
    summary: 'Upper bound on the aluminum in a daily parenteral nutrition bag, from each component\'s volume and label figure. Gives mcg/day and mcg/kg/day, each component\'s share, and where the total sits against the 4 to 5 mcg/kg/day in the 21 CFR 201.323 labeling warning. Label figures are entered by the reader; the result is "no more than", not a measurement.',
    compute: PA.pnAluminumLoad,
    fields: [
      { dom: 'pal-weight', arg: 'weight', kind: 'number', required: true, label: 'Patient weight' },
      { dom: 'pal-wunit', arg: 'weightUnit', kind: 'enum', required: true, values: PA.WEIGHT_UNITS.map((u) => u.value), label: 'Weight unit' },
      { dom: 'pal-parts', arg: 'components', kind: 'string', required: true, label: 'Components, one per line: name, mL, label aluminum in mcg/L' },
    ],
  },
];
