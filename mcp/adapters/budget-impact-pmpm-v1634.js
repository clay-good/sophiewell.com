// spec-v1634 MCP adapter: budget-impact-pmpm in lib/budget-impact-pmpm-v1634.js. The dom keys mirror
// views/group-v1634.js and META['budget-impact-pmpm'].example. Administrative domain.

import * as BI from '../../lib/budget-impact-pmpm-v1634.js';

export default [
  {
    id: 'budget-impact-pmpm',
    summary: 'Spreads a budget impact across a health plan\'s members and months. It is the form budget impact analyses report, with the per-member-per-year figure too.',
    compute: BI.budgetImpactPmpm,
    fields: [
      { dom: 'bip-impact', arg: 'budgetImpact', kind: 'number', required: true, label: 'Budget impact over the period', unit: 'USD' },
      { dom: 'bip-members', arg: 'members', kind: 'number', required: true, label: 'Members covered' },
      { dom: 'bip-months', arg: 'months', kind: 'number', required: true, label: 'Months in the period' },
    ],
  },
];
