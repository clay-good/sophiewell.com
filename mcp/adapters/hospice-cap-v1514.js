// spec-v1514: MCP adapter for the hospice aggregate cap. The dom keys mirror views/group-v1514.js.

import * as HC from '../../lib/hospice-cap-v1514.js';

export default [
  {
    id: 'hospice-aggregate-cap',
    summary: 'A hospice\'s aggregate cap for the year. The cap amount times the beneficiary count, against Medicare payments (42 CFR 418.309).',
    compute: HC.hospiceAggregateCap,
    fields: [
      { dom: 'hac-year', arg: 'capYear', kind: 'number', required: false, label: 'Cap year, federal fiscal year (blank for the current one)' },
      { dom: 'hac-benes', arg: 'beneficiaries', kind: 'number', required: true, label: 'Medicare beneficiaries for the cap year (may be fractional)' },
      { dom: 'hac-method', arg: 'method', kind: 'enum', required: false, values: HC.METHODS.map((m) => m.value), label: 'Counting method' },
      { dom: 'hac-paid', arg: 'payments', kind: 'number', required: true, label: 'Medicare hospice payments for the cap year', unit: 'USD' },
    ],
  },
];
