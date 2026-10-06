// spec-v1549 MCP adapter: f75-feed-volume in lib/f75-feed-volume-v1549.js.
// The dom keys mirror views/group-v1549.js and META['f75-feed-volume'].example. Clinical domain.

import * as M from '../../lib/f75-feed-volume-v1549.js';

export default [
  {
    id: 'f75-feed-volume',
    summary: 'Gives the F-75 volume per feed for a severely malnourished child in stabilization. 130 mL/kg/day, or 100 with severe edema, by feed interval, rounded to 5 mL, with the reference card row and the 80% minimum.',
    compute: M.f75FeedVolume,
    fields: [
      { dom: 'f75-weight', arg: 'weight', kind: 'number', required: true, label: 'Admission weight in kg', min: 1, max: 20 },
      { dom: 'f75-interval', arg: 'interval', kind: 'enum', required: true, label: 'Feeding interval', values: M.INTERVAL_OPTIONS.map((d) => d.value) },
      { dom: 'f75-edema', arg: 'edema', kind: 'enum', required: true, label: 'Severe (+++) edema', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
