// spec-v1656 MCP adapter: fmcsa-hearing-standard in lib/fmcsa-hearing-standard-v1656.js. The dom keys
// mirror views/group-v1656.js and META['fmcsa-hearing-standard'].example.

import * as FHS from '../../lib/fmcsa-hearing-standard-v1656.js';

export default [
  {
    id: 'fmcsa-hearing-standard',
    summary: 'Whether a commercial driver meets the DOT hearing standard: a forced whisper at 5 feet, or a better-ear average of no more than 40 dB. The average is at 500, 1,000 and 2,000 Hz, ISO converted to ANSI, per 49 CFR 391.41(b)(11).',
    compute: FHS.fmcsaHearingStandard,
    fields: [
      { dom: 'fhs-whisper', arg: 'whisperFeet', kind: 'number', required: false, label: 'Forced whisper first perceived in the better ear at (feet)' },
      { dom: 'fhs-500', arg: 'hz500', kind: 'number', required: false, label: 'Better ear, 500 Hz (dB)' },
      { dom: 'fhs-1000', arg: 'hz1000', kind: 'number', required: false, label: 'Better ear, 1,000 Hz (dB)' },
      { dom: 'fhs-2000', arg: 'hz2000', kind: 'number', required: false, label: 'Better ear, 2,000 Hz (dB)' },
      { dom: 'fhs-calibration', arg: 'calibration', kind: 'enum', values: ['ansi', 'iso'], required: false, label: 'Audiometer calibration' },
    ]
  },
];
