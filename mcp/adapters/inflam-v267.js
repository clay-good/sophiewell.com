// spec-v267 MCP wave (ninety-third): adapter for the HALP score in
// lib/inflam-v267.js. dom keys mirror the browser renderer and
// META['halp-score'].example.fields. Hemoglobin and albumin are in g/L.

import * as F from '../../lib/inflam-v267.js';

export default [
  {
    id: 'halp-score',
    summary: 'HALP score (Chen 2015) = hemoglobin (g/L) x albumin (g/L) x absolute lymphocyte count (10^9/L) / platelet count (10^9/L); a combined nutrition/inflammation/immune-reserve marker where a lower value is less favorable (cohort-specific cutoff).',
    compute: F.halp,
    fields: [
      { dom: 'halp-hgb', arg: 'hgb', kind: 'number', required: true, label: 'Hemoglobin', unit: 'g/L' },
      { dom: 'halp-alb', arg: 'albumin', kind: 'number', required: true, label: 'Serum albumin', unit: 'g/L' },
      { dom: 'halp-alc', arg: 'alc', kind: 'number', required: true, label: 'Absolute lymphocyte count', unit: '10^9/L' },
      { dom: 'halp-plt', arg: 'plt', kind: 'number', required: true, label: 'Platelet count', unit: '10^9/L' },
    ],
  },
];
