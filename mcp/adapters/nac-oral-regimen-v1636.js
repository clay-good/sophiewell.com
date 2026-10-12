// spec-v1636 MCP adapter: nac-oral-regimen in lib/nac-oral-regimen-v1636.js. The dom keys mirror
// views/group-v1636.js and META['nac-oral-regimen'].example. Clinical domain. One label row.

import * as NA from '../../lib/nac-oral-regimen-v1636.js';

export default [
  {
    id: 'nac-oral-regimen',
    summary: 'Oral acetylcysteine 72-hour regimen for acetaminophen overdose, as the label states it. It returns the label table row for the weight (loading and maintenance grams, mL of solution and diluent), the calculated doses under 20 kg, and the 18-dose clock. A weight between two rows returns both; above 109 kg the table has no row. It does not decide whether to treat.',
    compute: (args) => NA.nacOralRegimen(args, new Date()),
    fields: [
      { dom: 'nor-weight', arg: 'weight', kind: 'number', required: true, label: 'Weight', unit: 'kg' },
      { dom: 'nor-strength', arg: 'strength', kind: 'enum', required: true, values: NA.STRENGTHS.map((x) => x.value), label: 'Solution strength' },
      { dom: 'nor-load', arg: 'loadTime', kind: 'string', label: 'Time of the loading dose (YYYY-MM-DDTHH:MM, optional)' },
    ],
  },
];
