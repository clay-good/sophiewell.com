// spec-v1506: MCP adapters for the poverty-guideline percentage and IRMAA. The dom keys mirror views/group-v1506.js.

import * as IN from '../../lib/income-screens-v1506.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'fpl-percent',
    summary: 'Income as a percent of the federal poverty guidelines. Uses the right guideline year for the program, with an optional limit to check.',
    compute: IN.fplPercent,
    fields: [
      { dom: 'fpl-size', arg: 'size', kind: 'number', required: true, label: 'Household size' },
      { dom: 'fpl-income', arg: 'income', kind: 'number', required: true, label: 'Household income', unit: 'USD' },
      { dom: 'fpl-period', arg: 'period', kind: 'enum', required: false, values: vals(IN.PERIODS), label: 'Income period (annual by default)' },
      { dom: 'fpl-region', arg: 'region', kind: 'enum', required: true, values: vals(IN.REGIONS), label: 'Where the household lives' },
      { dom: 'fpl-program', arg: 'program', kind: 'enum', required: true, values: vals(IN.PROGRAMS), label: 'Program (sets the guideline year)' },
      { dom: 'fpl-year', arg: 'year', kind: 'number', required: false, label: 'Coverage or program year (blank for this year)' },
      { dom: 'fpl-limit', arg: 'threshold', kind: 'number', required: false, label: 'Program limit to check', unit: 'percent' },
    ],
  },
  {
    id: 'irmaa',
    summary: 'Medicare IRMAA: the monthly Part B and Part D amounts added for income above the published brackets, by filing status.',
    compute: IN.irmaa,
    fields: [
      { dom: 'irm-filing', arg: 'filing', kind: 'enum', required: true, values: vals(IN.FILING), label: 'Tax filing status' },
      { dom: 'irm-magi', arg: 'magi', kind: 'number', required: true, label: 'Modified adjusted gross income, two years earlier', unit: 'USD' },
      { dom: 'irm-year', arg: 'year', kind: 'number', required: false, label: 'Premium year (blank for this year)' },
    ],
  },
];
