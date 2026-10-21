// spec-v1657 MCP adapter: unit-budget-variance in lib/unit-budget-variance-v1657.js. The dom keys mirror views/group-v1657.js and
// META['unit-budget-variance'].example.

import * as BUD from '../../lib/unit-budget-variance-v1657.js';

export default [
  {
    id: 'unit-budget-variance',
    summary: 'A unit\'s flexible budget for its actual volume, with the spending, volume and total variances. Each is signed and marked favorable or unfavorable for a cost.',
    compute: BUD.unitBudgetVariance,
    fields: [
      { dom: 'ubv-budget-volume', arg: 'budgetVolume', kind: 'number', required: true, label: 'Budgeted volume (patient days or visits)' },
      { dom: 'ubv-actual-volume', arg: 'actualVolume', kind: 'number', required: true, label: 'Actual volume' },
      { dom: 'ubv-budget', arg: 'budgetAmount', kind: 'number', required: true, label: 'Budgeted hours or dollars' },
      { dom: 'ubv-actual', arg: 'actualAmount', kind: 'number', required: true, label: 'Actual hours or dollars' },
      { dom: 'ubv-fixed', arg: 'fixedAmount', kind: 'number', required: false, label: 'Fixed portion of the budget (0 if it all varies)' },
    ]
  },
];
