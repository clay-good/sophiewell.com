// spec-v1657 MCP adapter: pbj-case-mix-adjusted-hours in lib/pbj-case-mix-adjusted-hours-v1657.js. The dom keys mirror views/group-v1657.js and
// META['pbj-case-mix-adjusted-hours'].example.

import * as ADJ from '../../lib/pbj-case-mix-adjusted-hours-v1657.js';

export default [
  {
    id: 'pbj-case-mix-adjusted-hours',
    summary: 'Case-mix adjusted nursing home staffing hours by the CMS formula: reported over case-mix hours, times the national average. The case-mix hours come from CMS\'s staffing file.',
    compute: ADJ.pbjCaseMixAdjustedHours,
    fields: [
      { dom: 'cma-staff', arg: 'staffType', kind: 'enum', values: ADJ.STAFF.map((x) => x.value), required: false, label: 'Staff type' },
      { dom: 'cma-reported', arg: 'reported', kind: 'number', required: true, label: 'Reported hours per resident day' },
      { dom: 'cma-casemix', arg: 'caseMix', kind: 'number', required: true, label: 'Case-mix hours per resident day (CMS staffing file)' },
      { dom: 'cma-national', arg: 'national', kind: 'number', required: true, label: 'National average case-mix hours (State US Averages)' },
    ]
  },
];
