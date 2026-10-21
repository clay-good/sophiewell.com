// spec-v1660 MCP adapter: x-linked-bayes-risk in lib/x-linked-bayes-risk-v1660.js. The dom keys mirror views/group-v1660.js and
// META['x-linked-bayes-risk'].example.

import * as XL from '../../lib/x-linked-bayes-risk-v1660.js';

export default [
  {
    id: 'x-linked-bayes-risk',
    summary: 'An X-linked carrier probability revised by unaffected sons, and optionally a negative carrier test, by Bayes\' theorem. The prior is the one you enter.',
    compute: XL.xLinkedBayesRisk,
    fields: [
      { dom: 'xl-prior', arg: 'prior', kind: 'string', required: true, label: 'Prior carrier probability' },
      { dom: 'xl-sons', arg: 'unaffectedSons', kind: 'number', required: true, label: 'Unaffected sons' },
      { dom: 'xl-dr', arg: 'detectionRate', kind: 'string', required: false, label: 'A negative carrier test\'s detection rate (optional)' },
    ]
  },
];
