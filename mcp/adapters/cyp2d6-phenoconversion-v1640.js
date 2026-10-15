// spec-v1640 MCP adapter: cyp2d6-phenoconversion in lib/cyp2d6-phenoconversion-v1640.js. The dom keys
// mirror views/group-v1640.js and META['cyp2d6-phenoconversion'].example.

import * as PC from '../../lib/cyp2d6-phenoconversion-v1640.js';

export default [
  {
    id: 'cyp2d6-phenoconversion',
    summary: 'A CYP2D6 activity score adjusted for an inhibitor by the CPIC opioid guideline\'s rule: strong sets it to 0, moderate halves it. For codeine, tramadol and hydrocodone only; the inhibitor\'s strength is the caller\'s input.',
    compute: (a) => PC.cyp2d6Phenoconversion(a, new Date()),
    fields: [
      { dom: 'cpc-score', arg: 'activityScore', kind: 'number', required: true, label: 'CYP2D6 activity score from the genotype' },
      { dom: 'cpc-inhibitor', arg: 'inhibitor', kind: 'enum', required: true, values: PC.STRENGTHS.map((s) => s.value), label: 'Strength of the CYP2D6 inhibitor taken: none, weak, moderate or strong' },
    ],
  },
];
