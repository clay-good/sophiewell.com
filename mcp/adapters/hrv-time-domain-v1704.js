// spec-v1704 MCP adapter: hrv-time-domain in lib/hrv-time-domain-v1704.js. The dom keys mirror views/group-v1704.js and
// META['hrv-time-domain'].example.

import * as HTD from '../../lib/hrv-time-domain-v1704.js';

export default [
  {
    id: 'hrv-time-domain',
    summary: 'Heart rate variability time-domain measures from RR intervals: SDNN, RMSSD, NN50, pNN50 and the triangular index, as the 1996 Task Force defines them.',
    compute: HTD.hrvTimeDomain,
    fields: [
      { dom: 'htd-rr', arg: 'intervals', kind: 'string', required: true, label: 'RR intervals in ms, one per line' },
      { dom: 'htd-flag', arg: 'flagPercent', kind: 'number', required: false, label: 'Flag a change above this percent' },
    ]
  },
];
