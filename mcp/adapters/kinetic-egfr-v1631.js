// spec-v1631 MCP adapter: kinetic-egfr in lib/kinetic-egfr-v1631.js. The dom keys mirror
// views/group-v1631.js and META['kinetic-egfr'].example. Clinical domain. Chen 2013, as reproduced
// in Kwong 2019.

import * as KE from '../../lib/kinetic-egfr-v1631.js';

export default [
  {
    id: 'kinetic-egfr',
    summary: 'Kinetic eGFR for a creatinine that is still changing, from a baseline and two consecutive creatinines. The Chen 2013 equation. Shows the maximum creatinine rise per day it assumes and the kidney-function category beside the baseline\'s. A negative result is reported as zero.',
    compute: KE.kineticEgfr,
    fields: [
      { dom: 'ke-base', arg: 'baselineCreatinine', kind: 'number', required: true, label: 'Baseline (steady-state) creatinine', unit: 'mg/dL' },
      { dom: 'ke-crcl', arg: 'baselineClearance', kind: 'number', required: true, label: 'Clearance or eGFR at that baseline', unit: 'mL/min' },
      { dom: 'ke-c1', arg: 'creatinine1', kind: 'number', required: true, label: 'First creatinine', unit: 'mg/dL' },
      { dom: 'ke-c2', arg: 'creatinine2', kind: 'number', required: true, label: 'Second creatinine', unit: 'mg/dL' },
      { dom: 'ke-hours', arg: 'hours', kind: 'number', required: true, label: 'Hours between the two', unit: 'hours' },
      { dom: 'ke-weight', arg: 'weight', kind: 'number', required: false, label: 'Weight (or enter the maximum rise per day)', unit: 'kg' },
      { dom: 'ke-max', arg: 'maxRise', kind: 'number', required: false, label: 'Maximum creatinine rise per day', unit: 'mg/dL per day' },
    ],
  },
];
