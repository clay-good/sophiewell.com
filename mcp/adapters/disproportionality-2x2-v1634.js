// spec-v1634 MCP adapter: disproportionality-2x2 in lib/disproportionality-2x2-v1634.js. The dom
// keys mirror views/group-v1634.js and META['disproportionality-2x2'].example. Clinical domain.

import * as DP from '../../lib/disproportionality-2x2-v1634.js';

export default [
  {
    id: 'disproportionality-2x2',
    summary: 'Reporting odds ratio, proportional reporting ratio and information component from four report counts. From a 2×2 table the reader took from a spontaneous-report database, it gives the ROR with its 95% interval, the PRR, and the IC with approximate limits, and states each EudraVigilance signal criterion separately. These are screening statistics, not rates or risks; no report data is included or fetched.',
    compute: DP.disproportionality2x2,
    fields: [
      { dom: 'dpr-a', arg: 'a', kind: 'number', required: true, label: 'a: reports with the drug and the event' },
      { dom: 'dpr-b', arg: 'b', kind: 'number', required: true, label: 'b: reports with the drug and other events' },
      { dom: 'dpr-c', arg: 'c', kind: 'number', required: true, label: 'c: reports with other drugs and the event' },
      { dom: 'dpr-d', arg: 'd', kind: 'number', required: true, label: 'd: reports with other drugs and other events' },
      { dom: 'dpr-monitoring', arg: 'monitoring', kind: 'enum', values: DP.MONITORING.map((m) => m.value), label: 'EU additional monitoring list (optional)' },
      { dom: 'dpr-ime', arg: 'ime', kind: 'enum', values: DP.IME.map((m) => m.value), label: 'Event on the Important Medical Event list (optional)' },
    ],
  },
];
