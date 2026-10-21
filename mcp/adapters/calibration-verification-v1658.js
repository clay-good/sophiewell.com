// spec-v1658 MCP adapter: calibration-verification in lib/calibration-verification-v1658.js. The dom keys mirror views/group-v1658.js and
// META['calibration-verification'].example.

import * as CAL from '../../lib/calibration-verification-v1658.js';

export default [
  {
    id: 'calibration-verification',
    summary: 'Calibration verification recovery at each level against the laboratory\'s limit, with reportable range coverage. Also the line of measured on assigned; the levels follow 42 CFR 493.1255.',
    compute: CAL.calibrationVerification,
    fields: [
      { dom: 'cal-levels', arg: 'levels', kind: 'string', required: true, label: 'One level per line: assigned value, measured value' },
      { dom: 'cal-limit', arg: 'limitPct', kind: 'number', required: true, label: 'Laboratory\'s acceptable recovery limit (± %)' },
      { dom: 'cal-low', arg: 'rangeLow', kind: 'number', required: false, label: 'Reportable range, low end (optional)' },
      { dom: 'cal-high', arg: 'rangeHigh', kind: 'number', required: false, label: 'Reportable range, high end (optional)' },
    ]
  },
];
