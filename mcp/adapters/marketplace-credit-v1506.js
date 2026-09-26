// spec-v1506: MCP adapters for the premium tax credit and employer affordability. The dom keys mirror views/group-v1506.js.

import * as MC from '../../lib/marketplace-credit-v1506.js';
import { REGIONS } from '../../lib/income-screens-v1506.js';

export default [
  {
    id: 'premium-tax-credit',
    summary: 'Estimated Marketplace premium tax credit. Uses income, household size, the benchmark silver premium and the IRS tables for the year.',
    compute: MC.premiumTaxCredit,
    fields: [
      { dom: 'ptc-magi', arg: 'magi', kind: 'number', required: true, label: 'Household income (MAGI) a year', unit: 'USD' },
      { dom: 'ptc-size', arg: 'size', kind: 'number', required: true, label: 'Household size' },
      { dom: 'ptc-region', arg: 'region', kind: 'enum', required: true, values: REGIONS.map((r) => r.value), label: 'Where the household lives' },
      { dom: 'ptc-bench', arg: 'benchmark', kind: 'number', required: true, label: 'Benchmark silver premium a month', unit: 'USD' },
      { dom: 'ptc-year', arg: 'year', kind: 'number', required: false, label: 'Coverage year (blank for this year)' },
    ],
  },
  {
    id: 'employer-coverage-affordability',
    summary: 'Whether an employer\'s health coverage offer is affordable. Applies the IRS test for the employee and for the family.',
    compute: MC.employerAffordability,
    fields: [
      { dom: 'eca-income', arg: 'income', kind: 'number', required: true, label: 'Household income a year', unit: 'USD' },
      { dom: 'eca-self', arg: 'selfOnly', kind: 'number', required: true, label: 'Employee self-only premium a month', unit: 'USD' },
      { dom: 'eca-family', arg: 'family', kind: 'number', required: false, label: 'Family premium a month', unit: 'USD' },
      { dom: 'eca-year', arg: 'year', kind: 'number', required: false, label: 'Plan year (blank for this year)' },
    ],
  },
];
