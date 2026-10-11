// spec-v1632 MCP adapter: glp1-titration-check in lib/glp1-titration-check-v1632.js. The dom keys
// mirror views/group-v1632.js and META['glp1-titration-check'].example. Clinical domain. Eight label
// rows: Ozempic, Wegovy, Rybelsus and Ozempic tablets, Mounjaro, Zepbound, Victoza, Saxenda, Trulicity.

import * as GL from '../../lib/glp1-titration-check-v1632.js';

export default [
  {
    id: 'glp1-titration-check',
    summary: 'The dose escalation schedule on a GLP-1 label. From the product and indication, the current dose and the date it began, it reports whether the dose is a step the label lists, the next step, the earliest date the label permits it, and the top of the schedule. Covers semaglutide (Ozempic, Wegovy, Rybelsus), tirzepatide (Mounjaro, Zepbound), liraglutide (Victoza, Saxenda) and dulaglutide (Trulicity). Missed doses are not covered.',
    compute: GL.glp1TitrationCheck,
    fields: [
      { dom: 'glp-product', arg: 'product', kind: 'enum', required: true, values: GL.PRODUCTS.map((p) => p.value), label: 'Product and indication' },
      { dom: 'glp-dose', arg: 'currentDose', kind: 'number', required: true, label: 'Current dose', unit: 'mg' },
      { dom: 'glp-start', arg: 'startDate', kind: 'string', required: true, label: 'Date the current dose began (YYYY-MM-DD)' },
      { dom: 'glp-asof', arg: 'asOf', kind: 'string', label: 'Date to check as of (YYYY-MM-DD); blank uses today' },
    ],
  },
];
