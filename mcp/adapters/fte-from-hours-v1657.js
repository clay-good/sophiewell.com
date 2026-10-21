// spec-v1657 MCP adapter: fte-from-hours in lib/fte-from-hours-v1657.js. The dom keys mirror views/group-v1657.js and
// META['fte-from-hours'].example.

import * as FTE from '../../lib/fte-from-hours-v1657.js';

export default [
  {
    id: 'fte-from-hours',
    summary: 'Full-time equivalents from hours over a period at your full-time standard. Or by the CMS cost report\'s sample-week method (divide by 160 quarterly, or 80 semi-annually).',
    compute: FTE.fteFromHours,
    fields: [
      { dom: 'fte-method', arg: 'method', kind: 'enum', values: FTE.METHODS.map((x) => x.value), required: true, label: 'Method' },
      { dom: 'fte-hours', arg: 'hours', kind: 'number', required: false, label: 'Hours in the period (worked or paid)' },
      { dom: 'fte-weeks', arg: 'weeks', kind: 'number', required: false, label: 'Weeks in the period' },
      { dom: 'fte-per-week', arg: 'hoursPerWeek', kind: 'number', required: false, label: 'Hours per FTE per week' },
      { dom: 'fte-sample', arg: 'sampleHours', kind: 'number', required: false, label: 'Cost report: hours in the sample weeks, summed' },
    ]
  },
];
