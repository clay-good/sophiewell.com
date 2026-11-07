// spec-v1704 MCP adapter: ectopy-burden in lib/ectopy-burden-v1704.js. The dom keys mirror views/group-v1704.js and
// META['ectopy-burden'].example.

import * as ECB from '../../lib/ectopy-burden-v1704.js';

export default [
  {
    id: 'ectopy-burden',
    summary: 'Ectopic beat burden as a percent of total beats and per hour, and arrhythmia time burden as a percent of monitored time.',
    compute: ECB.ectopyBurden,
    fields: [
      { dom: 'ecb-total', arg: 'totalBeats', kind: 'number', required: false, label: 'Total beats' },
      { dom: 'ecb-v', arg: 'ventricular', kind: 'number', required: false, label: 'Ventricular ectopic beats' },
      { dom: 'ecb-sv', arg: 'supraventricular', kind: 'number', required: false, label: 'Supraventricular ectopic beats' },
      { dom: 'ecb-hours', arg: 'monitoredHours', kind: 'number', required: false, label: 'Monitored time (hours)' },
      { dom: 'ecb-arr', arg: 'arrhythmiaHours', kind: 'number', required: false, label: 'Time in the arrhythmia (hours)' },
      { dom: 'ecb-ref', arg: 'referencePercent', kind: 'number', required: false, label: 'Reference value (percent)' },
    ]
  },
];
