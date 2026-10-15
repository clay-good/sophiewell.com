// spec-v1640 MCP adapter: opioid-cyp2d6-pediatric-check in lib/opioid-cyp2d6-pediatric-check-v1640.js.
// The dom keys mirror views/group-v1640.js and META['opioid-cyp2d6-pediatric-check'].example. Clinical
// domain. Two label rows.

import * as OC from '../../lib/opioid-cyp2d6-pediatric-check-v1640.js';
import { cpicFromDisk } from '../cpic-disk.js';

export default [
  {
    id: 'opioid-cyp2d6-pediatric-check',
    summary: 'What the codeine and tramadol tablet labels state for an age. Contraindicated under 12 years, and under 18 after tonsillectomy or adenoidectomy. An "avoid" statement for ages 12 to 18 with other risk factors. Ultra-rapid CYP2D6 metabolizers "should not use" either drug. With a CYP2D6 activity score, CPIC\'s row for the score follows. A decider: no dose is given.',
    compute: (args) => OC.opioidCyp2d6WithCpic(args, cpicFromDisk(), new Date()),
    fields: [
      { dom: 'ocp-drug', arg: 'drug', kind: 'enum', required: true, values: OC.DRUGS.map((x) => x.value), label: 'Drug' },
      { dom: 'ocp-age', arg: 'age', kind: 'number', required: true, label: 'Age', unit: 'years' },
      { dom: 'ocp-procedure', arg: 'procedure', kind: 'enum', values: OC.PROCEDURES.map((x) => x.value), label: 'Pain after tonsillectomy or adenoidectomy (ages 12 to 17)' },
      { dom: 'ocp-status', arg: 'status', kind: 'enum', values: OC.STATUSES.map((x) => x.value), label: 'CYP2D6 metabolizer status (age 12 and over)' },
      { dom: 'ocp-score', arg: 'activityScore', kind: 'number', required: false, label: 'CYP2D6 activity score, if the report gives one (adds the CPIC row)' },
    ],
  },
];
