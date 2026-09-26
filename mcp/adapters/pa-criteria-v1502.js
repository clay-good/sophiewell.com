// spec-v1502: MCP adapter for the payer criteria checklist. The dom keys mirror views/group-v1502.js.

import * as PC from '../../lib/pa-criteria-v1502.js';

export default [
  {
    id: 'pa-criteria-checklist',
    summary: 'Checks marked prior authorization criteria against the policy\'s own logic. Splits the pasted criteria at their numbering and evaluates stated "all of" and "one of" lists.',
    compute: PC.paCriteriaChecklist,
    fields: [
      { dom: 'pac-text', arg: 'criteria', kind: 'string', required: true, label: 'Criteria from the policy, one item per line, each ending [met], [not met] or [not documented], optionally "-- evidence location"' },
      { dom: 'pac-drug', arg: 'drug', kind: 'string', required: false, label: 'Drug' },
      { dom: 'pac-plan', arg: 'plan', kind: 'string', required: false, label: 'Plan name' },
    ],
  },
];
