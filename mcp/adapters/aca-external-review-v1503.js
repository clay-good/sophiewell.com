// spec-v1503: MCP adapter for the federal external review clock. The dom keys mirror views/group-v1503.js.

import * as AC from '../../lib/aca-external-review-v1503.js';

export default [
  {
    id: 'aca-external-review-clock',
    summary: 'External review filing deadline for group and individual health coverage. Four months from the final denial, with the plan and reviewer deadlines (45 CFR 147.136).',
    compute: AC.acaExternalReviewClock,
    fields: [
      { dom: 'acx-notice', arg: 'noticeReceived', kind: 'string', required: true, label: 'Final internal denial received (YYYY-MM-DD)' },
      { dom: 'acx-request', arg: 'requestReceived', kind: 'string', required: false, label: 'Plan received the external review request (YYYY-MM-DD)' },
      { dom: 'acx-iro', arg: 'iroReceived', kind: 'string', required: false, label: 'Independent reviewer received the request (YYYY-MM-DD)' },
    ],
  },
];
