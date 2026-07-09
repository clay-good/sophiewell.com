// spec-v268 MCP wave (ninety-fourth): adapter for the Advanced Lung Cancer
// Inflammation Index in lib/inflam-v268.js. dom keys mirror the browser renderer
// and META['ali-index'].example.fields.

import * as F from '../../lib/inflam-v268.js';

export default [
  {
    id: 'ali-index',
    summary: 'Advanced Lung Cancer Inflammation Index (Jafri 2013) = BMI (kg/m^2) x serum albumin (g/dL) / neutrophil-to-lymphocyte ratio (ANC / ALC); a higher value is more favorable, so a lower value marks a worse profile (cohort-specific cutoff).',
    compute: F.ali,
    fields: [
      { dom: 'ali-bmi', arg: 'bmi', kind: 'number', required: true, label: 'BMI', unit: 'kg/m^2' },
      { dom: 'ali-alb', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/dL' },
      { dom: 'ali-anc', arg: 'anc', kind: 'number', required: true, label: 'Absolute neutrophil count', unit: '10^9/L' },
      { dom: 'ali-alc', arg: 'alc', kind: 'number', required: true, label: 'Absolute lymphocyte count', unit: '10^9/L' },
    ],
  },
];
