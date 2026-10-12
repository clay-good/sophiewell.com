// spec-v1638 MCP adapter: ltc-mrr-tracker in lib/ltc-mrr-tracker-v1638.js. The dom keys mirror
// views/group-v1638.js and META['ltc-mrr-tracker'].example. Administrative domain. No clock: the
// as-of date is an input.

import { ltcMrrTracker } from '../../lib/ltc-mrr-tracker-v1638.js';

export default [
  {
    id: 'ltc-mrr-tracker',
    summary: 'A monthly medication regimen review tracker for a nursing facility. From a list of residents it finds calendar months with no pharmacist review on record, residents not yet reviewed this month, and irregularity reports with no documented physician response (42 CFR 483.45(c)). The facility\'s own response time frame is entered; none is invented.',
    compute: ltcMrrTracker,
    fields: [
      { dom: 'mrr-residents', arg: 'residents', kind: 'string', required: true, label: 'Residents, one per line: resident, admitted, last review, report sent, physician response (dates as YYYY-MM-DD)' },
      { dom: 'mrr-asof', arg: 'asOf', kind: 'string', required: true, label: 'As-of date (YYYY-MM-DD)' },
      { dom: 'mrr-days', arg: 'responseDays', kind: 'number', label: 'Facility time frame for the physician response', unit: 'days' },
    ],
  },
];
