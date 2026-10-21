// spec-v1657 MCP adapter: bed-occupancy-alos in lib/bed-occupancy-alos-v1657.js. The dom keys mirror views/group-v1657.js and
// META['bed-occupancy-alos'].example.

import * as BED from '../../lib/bed-occupancy-alos-v1657.js';

export default [
  {
    id: 'bed-occupancy-alos',
    summary: 'Hospital occupancy, average daily census, average length of stay and bed turnover. Beds and discharges are counted as the CMS cost report defines them, including a mid-period bed change.',
    compute: BED.bedOccupancyAlos,
    fields: [
      { dom: 'boa-beds', arg: 'beds', kind: 'number', required: false, label: 'Beds' },
      { dom: 'boa-days', arg: 'days', kind: 'number', required: false, label: 'Days in the period' },
      { dom: 'boa-periods', arg: 'bedPeriods', kind: 'string', required: false, label: 'When the bed count changed, one line per part: beds, days' },
      { dom: 'boa-ip-days', arg: 'inpatientDays', kind: 'number', required: true, label: 'Inpatient days' },
      { dom: 'boa-discharges', arg: 'discharges', kind: 'number', required: false, label: 'Discharges, including deaths, excluding newborns and DOAs' },
    ]
  },
];
