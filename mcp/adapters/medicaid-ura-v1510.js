// spec-v1510: MCP adapter for the Medicaid unit rebate amount. The dom keys mirror views/group-v1510.js.

import * as UR from '../../lib/medicaid-ura-v1510.js';

export default [
  {
    id: 'medicaid-ura',
    summary: 'A drug\'s Medicaid unit rebate amount. The basic rebate and the CPI-U inflation rebate per unit (42 U.S.C. 1396r-8(c)).',
    compute: UR.medicaidUra,
    fields: [
      { dom: 'ur-cat', arg: 'category', kind: 'enum', required: true, values: UR.DRUG_CATEGORIES.map((c) => c.value), label: 'Drug category' },
      { dom: 'ur-amp', arg: 'amp', kind: 'number', required: true, label: 'Average manufacturer price per unit', unit: 'USD' },
      { dom: 'ur-bp', arg: 'bestPrice', kind: 'number', required: false, label: 'Best price per unit (brand drugs)', unit: 'USD' },
      { dom: 'ur-bamp', arg: 'baselineAmp', kind: 'number', required: false, label: 'Baseline AMP per unit', unit: 'USD' },
      { dom: 'ur-bcpi', arg: 'baselineCpi', kind: 'number', required: false, label: 'Baseline CPI-U' },
      { dom: 'ur-ccpi', arg: 'currentCpi', kind: 'number', required: false, label: 'CPI-U for the month before the quarter' },
      { dom: 'ur-year', arg: 'year', kind: 'number', required: false, label: 'Year of the rebate quarter' },
    ],
  },
];
