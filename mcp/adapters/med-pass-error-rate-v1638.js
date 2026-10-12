// spec-v1638 MCP adapter: med-pass-error-rate in lib/med-pass-error-rate-v1638.js. The dom keys mirror
// views/group-v1638.js and META['med-pass-error-rate'].example. Administrative domain. No clock.

import { medPassErrorRate } from '../../lib/med-pass-error-rate-v1638.js';

export default [
  {
    id: 'med-pass-error-rate',
    summary: 'The nursing-facility medication administration error rate. Errors observed divided by opportunities (doses given plus doses ordered but not given), never rounded up, against the 5% line in 42 CFR 483.45(f). Any significant error fails whatever the rate. Shows how far the count is from 5%. It does not judge whether an error is significant.',
    compute: medPassErrorRate,
    fields: [
      { dom: 'mpe-given', arg: 'dosesGiven', kind: 'number', required: true, label: 'Doses observed being administered' },
      { dom: 'mpe-omitted', arg: 'dosesOmitted', kind: 'number', required: true, label: 'Doses ordered but not administered (0 if none)' },
      { dom: 'mpe-errors', arg: 'errors', kind: 'number', required: true, label: 'Errors observed, significant and non-significant together' },
      { dom: 'mpe-significant', arg: 'significantErrors', kind: 'number', required: true, label: 'How many of the errors were significant (0 if none)' },
    ],
  },
];
