// spec-v1506: MCP adapters for a Part D drug's yearly cost and the payment plan bill. The dom keys mirror views/group-v1506.js.

import * as PC from '../../lib/partd-costs-v1506.js';

export default [
  {
    id: 'partd-year-cost',
    summary: 'What a Part D drug costs through the year. Walks the deductible, 25% coinsurance and the out-of-pocket cap month by month.',
    compute: PC.partdYearCost,
    fields: [
      { dom: 'pdy-cost', arg: 'monthlyCost', kind: 'number', required: true, label: 'Drug monthly cost (plan price)', unit: 'USD' },
      { dom: 'pdy-start', arg: 'startMonth', kind: 'number', required: true, label: 'First month filled, 1 to 12' },
      { dom: 'pdy-ded', arg: 'deductible', kind: 'number', required: false, label: 'Plan deductible, if lower than the maximum', unit: 'USD' },
      { dom: 'pdy-year', arg: 'year', kind: 'number', required: false, label: 'Plan year (blank for this year)' },
    ],
  },
  {
    id: 'm3p-monthly-bill',
    summary: 'The Medicare Prescription Payment Plan bills month by month. Spreads Part D costs over the year without reducing them (42 CFR 423.137).',
    compute: PC.m3pMonthlyBill,
    fields: [
      { dom: 'm3p-month', arg: 'optInMonth', kind: 'number', required: true, label: 'Month of opting in, 1 to 12' },
      { dom: 'm3p-prior', arg: 'priorOop', kind: 'number', required: true, label: 'Part D out-of-pocket costs already paid this year', unit: 'USD' },
      { dom: 'm3p-monthly', arg: 'monthlyOop', kind: 'number', required: true, label: 'Out-of-pocket cost each month from opting in', unit: 'USD' },
      { dom: 'm3p-extra', arg: 'firstMonthExtra', kind: 'number', required: false, label: 'Extra cost in the first month', unit: 'USD' },
      { dom: 'm3p-year', arg: 'year', kind: 'number', required: false, label: 'Plan year (blank for this year)' },
    ],
  },
];
