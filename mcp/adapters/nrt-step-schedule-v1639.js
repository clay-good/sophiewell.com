// spec-v1639 MCP adapter: nrt-step-schedule in lib/nrt-step-schedule-v1639.js. The dom keys mirror
// views/group-v1639.js and META['nrt-step-schedule'].example. Four label rows: NicoDerm CQ, Nicorette
// gum, Nicorette lozenge and Habitrol gum.

import * as NR from '../../lib/nrt-step-schedule-v1639.js';

export default [
  {
    id: 'nrt-step-schedule',
    summary: 'Nicotine patch, gum or lozenge: the label\'s starting strength and a dated step-down calendar from the quit date. Patch: 21 mg above 10 cigarettes a day (10 weeks), else 14 mg (8 weeks). Gum and lozenge: 4 mg if the first cigarette is within 30 minutes of waking, else 2 mg, over 12 weeks. Gives patches and piece limits per step.',
    compute: NR.nrtStepSchedule,
    fields: [
      { dom: 'nrt-product', arg: 'product', kind: 'enum', required: true, values: NR.PRODUCTS.map((p) => p.value), label: 'Product' },
      { dom: 'nrt-age', arg: 'age', kind: 'enum', required: true, values: NR.AGES.map((a) => a.value), label: 'Age of the user' },
      { dom: 'nrt-cigs', arg: 'cigarettesPerDay', kind: 'number', label: 'Patch: cigarettes smoked per day' },
      { dom: 'nrt-minutes', arg: 'minutesToFirst', kind: 'number', label: 'Gum or lozenge: minutes from waking to the first cigarette', unit: 'minutes' },
      { dom: 'nrt-quit', arg: 'quitDate', kind: 'string', label: 'Quit date (YYYY-MM-DD)' },
    ],
  },
];
