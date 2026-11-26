// spec-v1769 MCP adapter: sample-size-proportion and sample-size-two-groups in lib/sample-size-v1769.js. The dom
// keys mirror views/group-v1769.js and the META examples; proportions, precisions, significance and power are in
// percent, as on the page.

import * as S from '../../lib/sample-size-v1769.js';

export default [
  {
    id: 'sample-size-proportion',
    summary: 'Sample size to estimate one proportion to an absolute or relative precision, from the WHO manual of Lwanga and Lemeshow (1991). It rounds to the nearest whole number as the manual\'s tables do and multiplies by an optional design effect.',
    compute: S.sampleSizeProportion,
    fields: [
      { dom: 'ssp-mode', arg: 'mode', kind: 'enum', required: true, values: S.PRECISION_MODES.map((m) => m.value), label: 'Precision wanted (absolute or relative)' },
      { dom: 'ssp-p', arg: 'proportion', kind: 'number', required: true, label: 'Anticipated proportion', unit: '%', min: 0, exclusiveMin: true, max: 100 },
      { dom: 'ssp-conf', arg: 'confidence', kind: 'enum', required: true, values: S.CONFIDENCE_OPTIONS.map((c) => c.value), label: 'Confidence level (%)' },
      { dom: 'ssp-d', arg: 'precision', kind: 'number', label: 'Absolute precision in percentage points (absolute mode)', min: 0, exclusiveMin: true, max: 100 },
      { dom: 'ssp-eps', arg: 'relativePrecision', kind: 'number', label: 'Relative precision as a percentage of the proportion (relative mode)', unit: '%' },
      { dom: 'ssp-deff', arg: 'designEffect', kind: 'number', min: 1, max: 100, label: 'Design effect (optional; blank is 1, simple random sampling)' },
    ],
  },
  {
    id: 'sample-size-two-groups',
    summary: 'Sample size per group to compare two proportions, by a hypothesis test or by the precision of their difference. From the WHO manual of Lwanga and Lemeshow (1991), it rounds up as the manual\'s tables do, gives the total, and multiplies by an optional design effect.',
    compute: S.sampleSizeTwoGroups,
    fields: [
      { dom: 'ss2-mode', arg: 'mode', kind: 'enum', required: true, values: S.TWO_GROUP_MODES.map((m) => m.value), label: 'Hypothesis test or estimate of the difference' },
      { dom: 'ss2-p1', arg: 'p1', kind: 'number', required: true, label: 'First group: anticipated proportion', unit: '%', min: 0, exclusiveMin: true, max: 100 },
      { dom: 'ss2-p2', arg: 'p2', kind: 'number', required: true, label: 'Second group: anticipated proportion', unit: '%', min: 0, exclusiveMin: true, max: 100 },
      { dom: 'ss2-alpha', arg: 'alpha', kind: 'number', label: 'Significance level (test mode)', unit: '%', min: 0, exclusiveMin: true, max: 20 },
      { dom: 'ss2-power', arg: 'power', kind: 'number', min: 50, max: 99, label: 'Power (test mode)', unit: '%' },
      { dom: 'ss2-sides', arg: 'sides', kind: 'enum', values: S.SIDES.map((s) => s.value), label: 'One- or two-sided test (test mode)' },
      { dom: 'ss2-conf', arg: 'confidence', kind: 'enum', values: S.CONFIDENCE_OPTIONS.map((c) => c.value), label: 'Confidence level (difference mode, %)' },
      { dom: 'ss2-d', arg: 'precision', kind: 'number', label: 'Absolute precision of the difference in percentage points (difference mode)' },
      { dom: 'ss2-deff', arg: 'designEffect', kind: 'number', min: 1, max: 100, label: 'Design effect (optional; blank is 1, simple random sampling)' },
    ],
  },
];
