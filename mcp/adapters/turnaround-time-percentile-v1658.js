// spec-v1658 MCP adapter: turnaround-time-percentile in lib/turnaround-time-percentile-v1658.js. The dom keys mirror views/group-v1658.js and
// META['turnaround-time-percentile'].example.

import * as TAT from '../../lib/turnaround-time-percentile-v1658.js';

export default [
  {
    id: 'turnaround-time-percentile',
    summary: 'Laboratory turnaround time: the median and a nearest-rank percentile from a list of minutes, and the share meeting a target.',
    compute: TAT.turnaroundTimePercentile,
    fields: [
      { dom: 'tat-minutes', arg: 'minutes', kind: 'string', required: true, label: 'Turnaround times in minutes, one per line' },
      { dom: 'tat-pct', arg: 'percentile', kind: 'number', required: false, label: 'Percentile (default 90)' },
      { dom: 'tat-target', arg: 'target', kind: 'number', required: false, label: 'The laboratory\'s target in minutes (optional)' },
    ]
  },
];
