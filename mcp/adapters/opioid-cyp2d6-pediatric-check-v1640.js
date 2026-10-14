// spec-v1640 MCP adapter: opioid-cyp2d6-pediatric-check in lib/opioid-cyp2d6-pediatric-check-v1640.js.
// The dom keys mirror views/group-v1640.js and META['opioid-cyp2d6-pediatric-check'].example. Clinical
// domain. Two label rows.

import * as OC from '../../lib/opioid-cyp2d6-pediatric-check-v1640.js';

export default [
  {
    id: 'opioid-cyp2d6-pediatric-check',
    summary: 'What the codeine and tramadol tablet labels state for an age. Contraindicated under 12 years, and under 18 after tonsillectomy or adenoidectomy. An "avoid" statement for ages 12 to 18 with other risk factors. Ultra-rapid CYP2D6 metabolizers "should not use" either drug. A decider: no dose is given.',
    compute: (args) => OC.opioidCyp2d6PediatricCheck(args, new Date()),
    fields: [
      { dom: 'ocp-drug', arg: 'drug', kind: 'enum', required: true, values: OC.DRUGS.map((x) => x.value), label: 'Drug' },
      { dom: 'ocp-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ocp-procedure', arg: 'procedure', kind: 'enum', values: OC.PROCEDURES.map((x) => x.value), label: 'Pain after tonsillectomy or adenoidectomy (ages 12 to 17)' },
      { dom: 'ocp-status', arg: 'status', kind: 'enum', values: OC.STATUSES.map((x) => x.value), label: 'CYP2D6 metabolizer status (age 12 and over)' },
    ],
  },
];
