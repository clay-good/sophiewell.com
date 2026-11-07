// spec-v1705 MCP adapter: eeg-band-power in lib/eeg-band-power-v1705.js. The dom keys mirror views/group-v1705.js and
// META['eeg-band-power'].example.

import * as EBP from '../../lib/eeg-band-power-v1705.js';

export default [
  {
    id: 'eeg-band-power',
    summary: "EEG band power (delta, theta, alpha, beta, gamma) from one channel's samples, with the IFCN glossary's band edges.",
    compute: EBP.eegBandPower,
    fields: [
      { dom: 'ebp-fs', arg: 'samplingRate', kind: 'number', required: true, label: 'Sampling rate (Hz)' },
      { dom: 'ebp-x', arg: 'samples', kind: 'string', required: true, label: 'Samples, one per line' },
      { dom: 'ebp-seg', arg: 'segmentSeconds', kind: 'number', required: false, label: 'Analysis window (s)' },
      { dom: 'ebp-delta', arg: 'deltaFrom', kind: 'enum', values: ['0.5', '0.1'], required: false, label: 'Lower edge of delta (Hz)' },
    ]
  },
];
