// spec-v1704 MCP adapter: spo2-arms-accuracy in lib/spo2-arms-accuracy-v1704.js. The dom keys mirror views/group-v1704.js and
// META['spo2-arms-accuracy'].example.

import * as SAA from '../../lib/spo2-arms-accuracy-v1704.js';

export default [
  {
    id: 'spo2-arms-accuracy',
    summary: "Pulse oximeter accuracy from paired SpO2 and co-oximeter readings: Arms, bias and Bland-Altman limits for repeated measures. Checked against FDA's 2013 guidance and the 2025 draft.",
    compute: (a) => SAA.spo2ArmsAccuracy(a, new Date()),
    fields: [
      { dom: 'saa-sensor', arg: 'sensor', kind: 'enum', values: ['transmittance', 'ear', 'reflectance'], required: true, label: 'Sensor type' },
      { dom: 'saa-pairs', arg: 'pairs', kind: 'string', required: true, label: 'Pairs, one per line: subject, SpO2, SaO2' },
      { dom: 'saa-subjects', arg: 'subjects', kind: 'string', required: false, label: 'Subjects: subject, dark yes/no, MST 1-10, ITA, sex' },
    ]
  },
];
