// spec-v881 MCP adapter: the 25-hydroxyvitamin D reading in lib/vitamin-d-level-v881.js. The dom
// keys mirror the browser renderer (views/group-v881.js) and META['vitamin-d-level'].example.
//
// It returns BOTH published readings and does not pick one. Clinical domain.

import { vitaminDLevel } from '../../lib/vitamin-d-level-v881.js';

export default [
  {
    id: 'vitamin-d-level',
    summary: 'Reads a serum 25-hydroxyvitamin D level against the two frameworks that disagree about it, and returns both. The Institute of Medicine concluded that 20 ng/mL meets the needs of at least 97.5 percent of the population for bone health and that below 12 ng/mL is deficiency; the Endocrine Society treatment guideline set deficiency below 20, insufficiency at 21 to 29, and sufficiency at 30 and above. THE WORD DEFICIENT DEPENDS ON WHICH FRAMEWORK IS USED, so 25 ng/mL is adequate under one and insufficient under the other, and neither is offered here as the answer. THE 20 ng/mL FIGURE IS A POPULATION REFERENCE, NOT AN INDIVIDUAL TREATMENT TARGET. THE 2024 ENDOCRINE SOCIETY GUIDELINE RECOMMENDS AGAINST ROUTINE TESTING IN HEALTHY ADULTS. The assay varies with binding protein and between laboratories, so a value near a threshold does not separate cleanly from the other side.',
    compute: vitaminDLevel,
    fields: [
      { dom: 'vd-level', arg: 'level', kind: 'number', required: true, label: 'Serum 25-hydroxyvitamin D' },
      { dom: 'vd-unit', arg: 'unit', kind: 'enum', required: false, label: 'Units of the entered level', values: ['ng-ml', 'nmol-l'] },
    ],
  },
];
