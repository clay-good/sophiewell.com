// spec-v1639 MCP adapter: missed-dose-label-rule in lib/missed-dose-label-rule-v1639.js. The dom keys
// mirror views/group-v1639.js and META['missed-dose-label-rule'].example. Clinical domain. Sixteen
// label rows. No clock: every time is entered.

import * as MD from '../../lib/missed-dose-label-rule-v1639.js';

export default [
  {
    id: 'missed-dose-label-rule',
    summary: 'What the FDA label says about a missed dose, evaluated on the times entered. Apixaban, rivaroxaban, dabigatran, edoxaban; Ozempic, Wegovy, Mounjaro, Zepbound, Trulicity, Victoza, Saxenda, semaglutide tablets; weekly and monthly alendronate, risedronate and ibandronate. Says take or skip, gives the deadline that decided it, and quotes the label\'s sentence. With a planned new dose time, whether the weekly day of Ozempic, Mounjaro, Zepbound or Trulicity may change.',
    compute: MD.missedDoseLabelRule,
    fields: [
      { dom: 'mdl-product', arg: 'product', kind: 'enum', required: true, values: MD.PRODUCTS.map((p) => p.value), label: 'Product and regimen' },
      { dom: 'mdl-due', arg: 'dueAt', kind: 'string', required: false, label: 'When the missed dose was due (YYYY-MM-DDTHH:MM, or a date)' },
      { dom: 'mdl-now', arg: 'nowAt', kind: 'string', required: false, label: 'Date and time now (YYYY-MM-DDTHH:MM, or a date)' },
      { dom: 'mdl-next', arg: 'nextDoseAt', kind: 'string', label: 'Next scheduled dose (dabigatran, Wegovy, Trulicity, monthly tablets)' },
      { dom: 'mdl-last', arg: 'lastDoseAt', kind: 'string', label: 'When the last dose was taken (liraglutide, or a change of day)' },
      { dom: 'mdl-tablets', arg: 'tabletsMissed', kind: 'enum', values: MD.TABLETS_MISSED.map((t) => t.value), label: 'Risedronate 75 mg: one or both tablets missed' },
      { dom: 'mdl-change', arg: 'changeTo', kind: 'string', label: 'Changing the weekly day: planned new dose time (Ozempic, Mounjaro, Zepbound, Trulicity)' },
    ],
  },
];
