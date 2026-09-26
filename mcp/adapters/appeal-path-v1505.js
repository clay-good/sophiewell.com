// spec-v1505: MCP adapter for the coverage-request and appeal triage. The dom keys mirror views/group-v1505.js.

import * as AP from '../../lib/appeal-path-v1505.js';

const vals = (xs) => xs.map((x) => x.value);

export default [
  {
    id: 'which-appeal-path',
    summary: 'Which coverage-request and appeal rules apply to a plan and item. Names the rule set, its first deadline, and the tool that counts it.',
    compute: AP.whichAppealPath,
    fields: [
      { dom: 'wap-cov', arg: 'coverage', kind: 'enum', required: true, values: vals(AP.COVERAGE), label: 'Coverage type' },
      { dom: 'wap-item', arg: 'item', kind: 'enum', required: true, values: vals(AP.ITEMS), label: 'What is being requested' },
    ],
  },
];
