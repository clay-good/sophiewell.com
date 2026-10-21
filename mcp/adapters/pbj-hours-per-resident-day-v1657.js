// spec-v1657 MCP adapter: pbj-hours-per-resident-day in lib/pbj-hours-per-resident-day-v1657.js. The dom keys mirror views/group-v1657.js and
// META['pbj-hours-per-resident-day'].example.

import * as PBJ from '../../lib/pbj-hours-per-resident-day-v1657.js';

export default [
  {
    id: 'pbj-hours-per-resident-day',
    summary: 'Nursing home reported nurse staffing hours per resident day by the CMS PBJ method, with CMS\'s six exclusions. Also checks the one-star exception for four or more days without an RN (Five-Star guide, September 2026).',
    compute: PBJ.pbjHoursPerResidentDay,
    fields: [
      { dom: 'pbj-rn', arg: 'rnHours', kind: 'number', required: true, label: 'RN hours (job codes 5 to 7)' },
      { dom: 'pbj-lpn', arg: 'lpnHours', kind: 'number', required: true, label: 'LPN hours (job codes 8 and 9)' },
      { dom: 'pbj-aide', arg: 'aideHours', kind: 'number', required: true, label: 'Nurse aide hours (job codes 10 to 12)' },
      { dom: 'pbj-census', arg: 'census', kind: 'number', required: true, label: 'Resident census, summed over the days' },
      { dom: 'pbj-wk-nurse', arg: 'weekendNurseHours', kind: 'number', required: false, label: 'Weekend nurse hours (job codes 5 to 12)' },
      { dom: 'pbj-wk-aide', arg: 'weekendAideHours', kind: 'number', required: false, label: 'Weekend nurse aide hours (job codes 10 to 12)' },
      { dom: 'pbj-wk-census', arg: 'weekendCensus', kind: 'number', required: false, label: 'Weekend resident census, summed' },
      { dom: 'pbj-no-rn', arg: 'daysWithoutRn', kind: 'number', required: false, label: 'Days with residents and no RN hours' },
    ]
  },
];
