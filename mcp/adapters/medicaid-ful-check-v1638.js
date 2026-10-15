// spec-v1638 MCP adapter: medicaid-ful-check in lib/medicaid-ful-check-v1638.js. The dom keys mirror
// views/group-v1638.js and META['medicaid-ful-check'].example. Administrative domain. Given an NDC, the
// limit comes from CMS's federal upper limits file, read from disk by mcp/aca-ful-disk.js.

import { medicaidFulCheck } from '../../lib/medicaid-ful-check-v1638.js';
import { fulLookupFromDisk } from '../aca-ful-disk.js';

export default [
  {
    id: 'medicaid-ful-check',
    summary: 'The Medicaid federal upper limit for a multiple source drug. Given an NDC, it is read from CMS\'s monthly federal upper limits file; by hand, it is 175% of the weighted average of the monthly AMPs, or the national survey acquisition cost (NADAC) when the 175% figure falls below it (42 CFR 447.514(b)). Adds the amount for a quantity plus the state dispensing fee. An aggregate limit, not a per-claim rule.',
    compute: (a) => medicaidFulCheck(String(a.ndc ?? '').trim() ? { ...a, lookup: fulLookupFromDisk(a.ndc) } : a),
    fields: [
      { dom: 'mfc-ndc', arg: 'ndc', kind: 'string', label: 'NDC, to read the limit from CMS\'s file' },
      { dom: 'mfc-amp', arg: 'weightedAmp', kind: 'number', label: 'Weighted average of the monthly AMPs, per unit (by hand)', unit: 'dollars' },
      { dom: 'mfc-nadac', arg: 'surveyCost', kind: 'number', label: 'National survey acquisition cost (NADAC), per unit', unit: 'dollars' },
      { dom: 'mfc-qty', arg: 'quantity', kind: 'number', label: 'Quantity', unit: 'units' },
      { dom: 'mfc-fee', arg: 'dispensingFee', kind: 'number', label: 'State professional dispensing fee', unit: 'dollars' },
    ],
  },
];
