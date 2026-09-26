// spec-v1507: MCP adapter for the Medicaid work requirement check. The dom keys mirror views/group-v1507.js.

import * as WR from '../../lib/medicaid-work-requirement-v1507.js';

const vals = (list) => list.map((x) => x.value);

export default [
  {
    id: 'medicaid-work-requirement-check',
    summary: 'Whether a Medicaid expansion adult meets the monthly work requirement or is excepted. Counts 80 hours, half-time school or $580 of income (42 CFR 435.552).',
    compute: WR.medicaidWorkRequirement,
    fields: [
      { dom: 'wr-exception', arg: 'exception', kind: 'enum', required: true, values: vals(WR.EXCEPTIONS), label: 'Exception that applies, or none' },
      { dom: 'wr-age', arg: 'age', kind: 'number', required: false, label: 'Age', unit: 'years' },
      { dom: 'wr-medicare', arg: 'medicare', kind: 'enum', required: false, values: vals(WR.YES_NO), label: 'Has Medicare Part A or B' },
      { dom: 'wr-work', arg: 'workHours', kind: 'number', required: false, label: 'Hours of work in the month' },
      { dom: 'wr-service', arg: 'serviceHours', kind: 'number', required: false, label: 'Hours of community service' },
      { dom: 'wr-program', arg: 'programHours', kind: 'number', required: false, label: 'Hours in a work program' },
      { dom: 'wr-halftime', arg: 'halfTime', kind: 'enum', required: false, values: vals(WR.YES_NO), label: 'Enrolled in school at least half-time' },
      { dom: 'wr-school', arg: 'schoolHours', kind: 'number', required: false, label: 'Hours of school, if less than half-time' },
      { dom: 'wr-income', arg: 'income', kind: 'number', required: false, label: 'Income in the month', unit: 'USD' },
      { dom: 'wr-seasonal', arg: 'seasonal', kind: 'enum', required: false, values: vals(WR.YES_NO), label: 'Seasonal worker' },
      { dom: 'wr-avg', arg: 'sixMonthIncome', kind: 'number', required: false, label: 'Seasonal: 6-month average monthly income', unit: 'USD' },
    ],
  },
];
