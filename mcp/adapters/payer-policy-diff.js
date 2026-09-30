// spec-v1603: MCP adapter for payer-policy-diff. The dom keys mirror views/group-v1502.js.

import * as PD from '../../lib/payer-policy-diff.js';

export default [
  {
    id: 'payer-policy-diff',
    summary: 'What changed between two versions of a payer\'s published criteria, criterion by criterion, with stricter thresholds first.',
    compute: PD.payerPolicyDiff,
    fields: [
      { dom: 'ppd-before', arg: 'before', kind: 'string', required: true, label: 'Earlier version of the criteria, keeping its numbering' },
      { dom: 'ppd-before-date', arg: 'beforeDate', kind: 'string', required: false, label: 'Earlier version effective date (YYYY-MM-DD)' },
      { dom: 'ppd-after', arg: 'after', kind: 'string', required: true, label: 'Newer version of the criteria, keeping its numbering' },
      { dom: 'ppd-after-date', arg: 'afterDate', kind: 'string', required: false, label: 'Newer version effective date (YYYY-MM-DD)' },
    ],
  },
];
