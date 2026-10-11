// spec-v1633 MCP adapter: lai-antipsychotic-start in lib/lai-antipsychotic-start-v1633.js. The dom
// keys mirror views/group-v1633.js and META['lai-antipsychotic-start'].example. Clinical domain. Four
// label rows: Invega Sustenna, Invega Trinza, Aristada and Abilify Maintena.

import * as LA from '../../lib/lai-antipsychotic-start-v1633.js';

export default [
  {
    id: 'lai-antipsychotic-start',
    summary: 'The starting dose of a long-acting injectable antipsychotic, by its label. Invega Sustenna from the oral paliperidone dose, with the two initiation injections; Invega Trinza from the last Sustenna dose; Aristada from the oral aripiprazole dose, with the two ways to start; and Abilify Maintena\'s 1-day or 14-day initiation. With a date it gives the initiation dates. Missed doses and injection windows are not covered.',
    compute: LA.laiAntipsychoticStart,
    fields: [
      { dom: 'las-product', arg: 'product', kind: 'enum', required: true, values: LA.PRODUCTS.map((d) => d.value), label: 'Product and start' },
      { dom: 'las-dose', arg: 'dose', kind: 'number', label: 'Current dose: oral mg a day (Sustenna, Aristada) or the last Sustenna dose in mg (Trinza)', unit: 'mg' },
      { dom: 'las-date', arg: 'startDate', kind: 'string', label: 'Date of the first injection, or for Trinza the date the next monthly dose is due (YYYY-MM-DD, optional)' },
    ],
  },
];
