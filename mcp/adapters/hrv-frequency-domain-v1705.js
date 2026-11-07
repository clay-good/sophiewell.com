// spec-v1705 MCP adapter: hrv-frequency-domain in lib/hrv-frequency-domain-v1705.js. The dom keys mirror views/group-v1705.js and
// META['hrv-frequency-domain'].example.

import * as HFD from '../../lib/hrv-frequency-domain-v1705.js';

export default [
  {
    id: 'hrv-frequency-domain',
    summary: 'Heart rate variability in the frequency domain from RR intervals: LF, HF and LF/HF by the 1996 Task Force bands.',
    compute: HFD.hrvFrequencyDomain,
    fields: [
      { dom: 'hfd-type', arg: 'recording', kind: 'enum', values: ['short', 'long'], required: true, label: 'Recording type' },
      { dom: 'hfd-rr', arg: 'intervals', kind: 'string', required: true, label: 'RR intervals in ms, one per line' },
    ]
  },
];
