// spec-v1638 MCP adapter: partd-insulin-cost-cap in lib/partd-insulin-cost-cap-v1638.js. The dom
// keys mirror views/group-v1638.js and META['partd-insulin-cost-cap'].example. Administrative
// domain. No clock: the plan year is an input.

import { partdInsulinCostCap } from '../../lib/partd-insulin-cost-cap-v1638.js';

export default [
  {
    id: 'partd-insulin-cost-cap',
    summary: 'The Part D cost-sharing cap on a covered insulin fill, plan year 2026 and later. Per one-month supply it is the lesser of $35, 25% of the negotiated price and 25% of the maximum fair price; a longer fill takes the fewest one-month increments (42 CFR 423.120(h)). Shows which amount set the cap and any overcharge.',
    compute: partdInsulinCostCap,
    fields: [
      { dom: 'pic-year', arg: 'planYear', kind: 'number', required: true, label: 'Plan year (2026 or later)' },
      { dom: 'pic-days', arg: 'daysSupply', kind: 'number', required: true, label: 'Days supply of the fill', unit: 'days' },
      { dom: 'pic-month', arg: 'monthDays', kind: 'number', required: true, label: 'Days in a one-month supply under the plan', unit: 'days' },
      { dom: 'pic-price', arg: 'negotiatedPrice', kind: 'number', required: true, label: 'Negotiated price for a one-month supply', unit: 'dollars' },
      { dom: 'pic-mfp', arg: 'maxFairPrice', kind: 'number', label: 'Maximum fair price for a one-month supply, if the insulin has one', unit: 'dollars' },
      { dom: 'pic-charged', arg: 'charged', kind: 'number', label: 'Cost sharing the claim charged', unit: 'dollars' },
    ],
  },
];
