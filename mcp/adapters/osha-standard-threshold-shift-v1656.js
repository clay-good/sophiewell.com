// spec-v1656 MCP adapter: osha-standard-threshold-shift in lib/osha-standard-threshold-shift-v1656.js. The
// dom keys mirror views/group-v1656.js and META['osha-standard-threshold-shift'].example.

import * as STS from '../../lib/osha-standard-threshold-shift-v1656.js';

const EARS = [['right', 'Right'], ['left', 'Left']];
const audiogram = [];
for (const [ear, Ear] of EARS) {
  for (const [k, when] of [['b', 'baseline'], ['r', 'recent']]) {
    for (const hz of [2, 3, 4]) {
      audiogram.push({ dom: `sts-${ear}-${k}${hz}`, arg: `${ear}${k.toUpperCase()}${hz}`, kind: 'number', required: false, label: `${Ear} ear, ${when}, ${hz}000 Hz (dB)` });
    }
  }
}

export default [
  {
    id: 'osha-standard-threshold-shift',
    summary: 'OSHA standard threshold shift: an average change of 10 dB or more at 2000, 3000 and 4000 Hz in either ear. Uncorrected, or with the Appendix F age correction from Tables F-1 and F-2.',
    compute: STS.oshaStandardThresholdShift,
    fields: [
      ...audiogram,
      { dom: 'sts-correct', arg: 'ageCorrection', kind: 'enum', values: ['yes', 'no'], required: false, label: 'Apply the Appendix F age correction' },
      { dom: 'sts-sex', arg: 'sex', kind: 'enum', values: ['male', 'female'], required: false, label: 'Sex (selects Table F-1 or F-2)' },
      { dom: 'sts-baseline-age', arg: 'baselineAge', kind: 'number', required: false, label: 'Age at the baseline audiogram (years)' },
      { dom: 'sts-recent-age', arg: 'recentAge', kind: 'number', required: false, label: 'Age at the recent audiogram (years)' },
    ]
  },
];
