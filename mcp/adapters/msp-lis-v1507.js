// spec-v1507: MCP adapter for the Extra Help and Medicare Savings Program screen. The dom keys mirror views/group-v1507.js.

import * as ML from '../../lib/msp-lis-v1507.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: 'extra-help-msp-screen',
    summary: 'Screens for Extra Help and the Medicare Savings Programs. Counts income the SSI way and tests it and resources against the federal limits.',
    compute: ML.extraHelpMspScreen,
    fields: [
      { dom: 'msp-marital', arg: 'marital', kind: 'enum', required: true, values: vals(ML.MARITAL), label: 'Marital status' },
      { dom: 'msp-region', arg: 'region', kind: 'enum', required: true, values: vals(ML.REGIONS), label: 'Where the person lives' },
      { dom: 'msp-unearned', arg: 'unearned', kind: 'number', required: true, label: 'Monthly unearned income (Social Security, pensions)', unit: 'USD' },
      { dom: 'msp-earned', arg: 'earned', kind: 'number', required: false, label: 'Monthly earned income (wages)', unit: 'USD' },
      { dom: 'msp-resources', arg: 'resources', kind: 'number', required: true, label: 'Countable resources', unit: 'USD' },
      { dom: 'msp-burial', arg: 'burial', kind: 'enum', required: false, values: vals(ML.YES_NO), label: 'Some resources set aside for burial' },
      { dom: 'msp-deps', arg: 'dependents', kind: 'number', required: false, label: 'Dependent relatives living in the home' },
      { dom: 'msp-year', arg: 'year', kind: 'number', required: false, label: 'Year (blank for this year)' },
    ],
  },
];
