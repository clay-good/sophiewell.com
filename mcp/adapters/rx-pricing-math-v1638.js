// spec-v1638 MCP adapter: rx-pricing-math in lib/rx-pricing-math-v1638.js. The dom keys mirror
// views/group-v1638.js and META['rx-pricing-math'].example. Administrative domain. No clock.

import { rxPricingMath } from '../../lib/rx-pricing-math-v1638.js';

export default [
  {
    id: 'rx-pricing-math',
    summary: 'Markup, gross margin and price for a pharmacy sale. Enter any two of cost, selling price, markup percent and margin percent. Markup is measured on cost and margin on price, so the same sale has two percentages. Also gives the price for a target margin plus a dispensing fee. Stated arithmetic; it refuses a margin of 100% or more.',
    compute: rxPricingMath,
    fields: [
      { dom: 'rpm-cost', arg: 'cost', kind: 'number', label: 'Acquisition cost', unit: 'dollars' },
      { dom: 'rpm-price', arg: 'price', kind: 'number', label: 'Selling price', unit: 'dollars' },
      { dom: 'rpm-markup', arg: 'markupPercent', kind: 'number', label: 'Markup on cost', unit: 'percent' },
      { dom: 'rpm-margin', arg: 'marginPercent', kind: 'number', label: 'Gross margin on price', unit: 'percent' },
      { dom: 'rpm-target', arg: 'targetMarginPercent', kind: 'number', label: 'A target margin, to price for', unit: 'percent' },
      { dom: 'rpm-fee', arg: 'fee', kind: 'number', label: 'Dispensing fee added to that price', unit: 'dollars' },
    ],
  },
];
