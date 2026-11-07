// spec-v1706 MCP adapter: qrs-detect-trace in lib/qrs-detect-trace-v1706.js. The dom keys mirror
// views/group-v1706.js and META['qrs-detect-trace'].example.

import * as QRS from '../../lib/qrs-detect-trace-v1706.js';

export default [
  {
    id: 'qrs-detect-trace',
    summary: 'R-peaks, RR intervals and mean heart rate from a single-lead ECG trace by the Pan-Tompkins algorithm. Validated on the MIT-BIH Arrhythmia Database.',
    compute: QRS.qrsDetectTrace,
    fields: [
      { dom: 'qrs-fs', arg: 'samplingRate', kind: 'number', required: true, label: 'Sampling rate (Hz)' },
      { dom: 'qrs-x', arg: 'samples', kind: 'string', required: true, label: 'ECG samples of one lead, one per line' },
    ]
  },
];
