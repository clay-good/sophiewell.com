// spec-v1632 MCP adapter: hepatic-label-dose in lib/hepatic-label-dose-v1632.js. The dom keys mirror
// views/group-v1632.js and META['hepatic-label-dose'].example. Clinical domain. Fourteen label rows.

import * as HP from '../../lib/hepatic-label-dose-v1632.js';

export default [
  {
    id: 'hepatic-label-dose',
    summary: 'The hepatic row of the FDA label for a Child-Pugh class. For fourteen drugs (voriconazole, caspofungin, tigecycline, ondansetron, atomoxetine, desvenlafaxine, metoclopramide, sacubitril-valsartan, mirabegron, solifenacin, argatroban, nirmatrelvir with ritonavir, lacosamide, entecavir) it reports what the label gives for class A, B or C, says so when the label has no sentence for a class, and does not map a label that speaks only of mild, moderate and severe impairment.',
    compute: HP.hepaticLabelDose,
    fields: [
      { dom: 'hep-drug', arg: 'drug', kind: 'enum', required: true, values: HP.DRUGS.map((d) => d.value), label: 'Drug' },
      { dom: 'hep-class', arg: 'childPugh', kind: 'enum', required: true, values: HP.CLASSES.map((c) => c.value), label: 'Child-Pugh class' },
    ],
  },
];
