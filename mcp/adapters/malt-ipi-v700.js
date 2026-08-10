// spec-v700 MCP adapter: MALT-IPI in lib/malt-ipi-v700.js.
// The dom keys mirror the browser renderer (views/group-v700.js) and META['malt-ipi'].example.
// Three booleans; a count 0-3 maps to a prognostic risk group. Clinical domain.

import { maltIpi } from '../../lib/malt-ipi-v700.js';

export default [
  {
    id: 'malt-ipi',
    summary: 'MALT-IPI (Thieblemont 2017): prognostic index for extranodal marginal-zone (MALT) lymphoma. One point each for age >=70, Ann Arbor stage III/IV, and elevated LDH (>ULN). Total 0-3; 0 low, 1 intermediate, >=2 high risk (approx 5-year event-free survival ~70% / ~56% / ~29%).',
    compute: maltIpi,
    fields: [
      { dom: 'malt-age', arg: 'ageOver70', kind: 'boolean', required: false, label: 'Age >= 70 years' },
      { dom: 'malt-stage', arg: 'advancedStage', kind: 'boolean', required: false, label: 'Ann Arbor stage III or IV' },
      { dom: 'malt-ldh', arg: 'elevatedLdh', kind: 'boolean', required: false, label: 'Elevated LDH (above upper limit of normal)' },
    ],
  },
];
