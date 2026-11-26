// spec-v1502: MCP adapter for the quantity-limit check. The dom keys mirror views/group-v1502.js.

import * as QL from '../../lib/quantity-limit-check-v1502.js';

export default [
  {
    id: 'quantity-limit-check',
    summary: 'Whether a prescription fits a plan quantity limit. Checks another strength, or the excess that needs an exception.',
    compute: QL.quantityLimitCheck,
    fields: [
      { dom: 'ql-per', arg: 'unitsPerDose', kind: 'number', required: true, label: 'Units taken per dose', min: 0, exclusiveMin: true, max: 1000 },
      { dom: 'ql-freq', arg: 'dosesPerDay', kind: 'number', required: true, label: 'Doses per day', min: 0, exclusiveMin: true, max: 48 },
      { dom: 'ql-strength', arg: 'strength', kind: 'number', required: true, label: 'Strength of one unit', unit: 'mg', min: 0, exclusiveMin: true, max: 100000 },
      { dom: 'ql-limit', arg: 'limitQty', kind: 'number', required: true, label: 'Plan quantity limit in units', min: 0, exclusiveMin: true, max: 100000 },
      { dom: 'ql-days', arg: 'limitDays', kind: 'number', required: true, label: 'Days the limit covers', min: 0, exclusiveMin: true, max: 366 },
      { dom: 'ql-other', arg: 'otherStrength', kind: 'number', required: false, label: 'Another available strength', unit: 'mg' },
    ],
  },
];
