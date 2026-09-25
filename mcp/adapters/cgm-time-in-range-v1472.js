// spec-v1472: MCP adapter. The dom keys mirror views/group-v1472.js and this tile's META example.

import * as TIR from '../../lib/cgm-time-in-range-v1472.js';

export default [
  {
    id: 'cgm-time-in-range',
    summary: 'Checks the five CGM report percentages against the International Consensus time-in-range targets. Covers type 1 or type 2 diabetes and older or high-risk adults; pregnancy is not covered.',
    compute: TIR.cgmTimeInRange,
    fields: [
      { dom: 'tir-pop', arg: 'pop', kind: 'enum', required: true, label: 'Population', values: TIR.TIR_POPULATIONS.map((x) => x.value) },
      { dom: 'tir-vlow', arg: 'vlow', kind: 'number', required: true, label: 'Time below 54 mg/dL', unit: '%' },
      { dom: 'tir-low', arg: 'low', kind: 'number', required: true, label: 'Time from 54 to 69 mg/dL', unit: '%' },
      { dom: 'tir-in', arg: 'tir', kind: 'number', required: true, label: 'Time from 70 to 180 mg/dL', unit: '%' },
      { dom: 'tir-high', arg: 'high', kind: 'number', required: true, label: 'Time from 181 to 250 mg/dL', unit: '%' },
      { dom: 'tir-vhigh', arg: 'vhigh', kind: 'number', required: true, label: 'Time above 250 mg/dL', unit: '%' },
      { dom: 'tir-cv', arg: 'cv', kind: 'number', required: false, label: 'Glucose variability (%CV)', unit: '%' },
      { dom: 'tir-days', arg: 'days', kind: 'number', required: false, label: 'Days worn', unit: 'days' },
      { dom: 'tir-active', arg: 'active', kind: 'number', required: false, label: 'Time the CGM was active', unit: '%' },
    ],
  },
];
