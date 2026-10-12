// spec-v1638 MCP adapter: supd-measure in lib/supd-measure-v1638.js. The dom keys mirror
// views/group-v1638.js and META['supd-measure'].example. Administrative domain. No clock.

import { supdMeasure } from '../../lib/supd-measure-v1638.js';

export default [
  {
    id: 'supd-measure',
    summary: 'Statin Use in Persons with Diabetes by CMS\'s Star Ratings method (2027 Technical Notes, measure D11). From members and a fill list it finds who is in the denominator (age 40 to 75, two diabetes fills on different dates, the first at least 90 days before year end, continuously enrolled, not excluded), who has a statin fill, the rate and the gap list. The reader assigns each fill\'s class.',
    compute: supdMeasure,
    fields: [
      { dom: 'supd-year', arg: 'measurementYear', kind: 'number', required: true, label: 'Measurement year', min: 2020, max: 2100 },
      { dom: 'supd-members', arg: 'members', kind: 'string', required: true, label: 'Members, one per line: member, age, continuously enrolled (yes or no), exclusion (optional)' },
      { dom: 'supd-fills', arg: 'fills', kind: 'string', required: true, label: 'Fills, one per line: member, fill date (YYYY-MM-DD), class (diabetes or statin)' },
    ],
  },
];
