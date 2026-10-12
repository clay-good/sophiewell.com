// spec-v1638 MCP adapter: cost-of-dispensing in lib/cost-of-dispensing-v1638.js. The dom keys
// mirror views/group-v1638.js and META['cost-of-dispensing'].example. Administrative domain.
// No clock.

import * as CD from '../../lib/cost-of-dispensing-v1638.js';

export default [
  {
    id: 'cost-of-dispensing',
    summary: 'A pharmacy\'s cost of dispensing per prescription, from its own costs. Adds staff, packaging, delivery and the allocated share of overhead, the categories in the federal dispensing fee definition (42 CFR 447.502), and divides by prescriptions. Shows the gap against the fee received and a break-even prescription count. No benchmark is supplied.',
    compute: CD.costOfDispensing,
    fields: [
      { dom: 'cod-rx', arg: 'prescriptions', kind: 'number', required: true, label: 'Prescriptions dispensed in the period' },
      ...CD.CATEGORIES.map((c) => ({ dom: c.dom, arg: c.arg, kind: 'number', label: c.label, unit: 'dollars' })),
      { dom: 'cod-shared', arg: 'sharedCost', kind: 'number', label: 'Shared rent, utilities, equipment and systems', unit: 'dollars' },
      { dom: 'cod-alloc', arg: 'allocationPercent', kind: 'number', label: 'Percent of the shared cost allocated to the prescription department', unit: 'percent' },
      { dom: 'cod-fee', arg: 'dispensingFee', kind: 'number', label: 'Average dispensing fee received', unit: 'dollars' },
      { dom: 'cod-fixed', arg: 'fixedCosts', kind: 'number', label: 'Break-even, fixed costs for the period', unit: 'dollars' },
      { dom: 'cod-reimb', arg: 'averageReimbursement', kind: 'number', label: 'Break-even, average reimbursement per prescription', unit: 'dollars' },
      { dom: 'cod-ingredient', arg: 'averageIngredientCost', kind: 'number', label: 'Break-even, average ingredient cost per prescription', unit: 'dollars' },
      { dom: 'cod-variable', arg: 'variableCostPerRx', kind: 'number', label: 'Break-even, variable cost per prescription (0 if none)', unit: 'dollars' },
    ],
  },
];
