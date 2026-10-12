// spec-v1638 MCP adapter: medicaid-ful-check in lib/medicaid-ful-check-v1638.js. The dom keys mirror
// views/group-v1638.js and META['medicaid-ful-check'].example. Administrative domain. No clock.

import { medicaidFulCheck } from '../../lib/medicaid-ful-check-v1638.js';

export default [
  {
    id: 'medicaid-ful-check',
    summary: 'The Medicaid federal upper limit for a multiple source drug, by hand. It is 175% of the weighted average of the monthly AMPs, or the national survey acquisition cost (NADAC) when the 175% figure falls below it (42 CFR 447.514(b)). Adds the amount for a quantity plus the state dispensing fee. An aggregate limit, not a per-claim rule.',
    compute: medicaidFulCheck,
    fields: [
      { dom: 'mfc-amp', arg: 'weightedAmp', kind: 'number', required: true, label: 'Weighted average of the monthly AMPs, per unit', unit: 'dollars' },
      { dom: 'mfc-nadac', arg: 'surveyCost', kind: 'number', label: 'National survey acquisition cost (NADAC), per unit', unit: 'dollars' },
      { dom: 'mfc-qty', arg: 'quantity', kind: 'number', label: 'Quantity', unit: 'units' },
      { dom: 'mfc-fee', arg: 'dispensingFee', kind: 'number', label: 'State professional dispensing fee', unit: 'dollars' },
    ],
  },
];
