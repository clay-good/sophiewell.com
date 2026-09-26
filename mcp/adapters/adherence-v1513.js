// spec-v1513: MCP adapter for MPR, PDC and gap days. The dom keys mirror views/group-v1513.js.

import * as AD from '../../lib/adherence-v1513.js';

export default [
  {
    id: 'mpr-gap-days',
    summary: 'Proportion of days covered, medication possession ratio and gaps from one drug\'s fills. Shifts early refills as the Part D adherence measures do.',
    compute: AD.mprGapDays,
    fields: [
      { dom: 'mpr-fills', arg: 'fills', kind: 'string', required: true, label: 'Fills, one per line: fill date (YYYY-MM-DD), days supply' },
      { dom: 'mpr-start', arg: 'periodStart', kind: 'string', required: false, label: 'Period start (YYYY-MM-DD; blank for the first fill)' },
      { dom: 'mpr-end', arg: 'periodEnd', kind: 'string', required: false, label: 'Period end (YYYY-MM-DD; blank for December 31)' },
      { dom: 'mpr-gap', arg: 'gapDays', kind: 'number', required: false, label: 'List gaps longer than this many days', unit: 'days' },
    ],
  },
  {
    id: 'med-sync-plan',
    summary: 'A medication synchronization plan. The sync date and each medication\'s one-time short fill, rounded up to whole units.',
    compute: AD.medSyncPlan,
    fields: [
      { dom: 'sync-meds', arg: 'meds', kind: 'string', required: true, label: 'Medications, one per line: name, last fill date (YYYY-MM-DD), days supply, units a day' },
      { dom: 'sync-date', arg: 'syncDate', kind: 'string', required: false, label: 'Sync date (YYYY-MM-DD; blank for the earliest practical)' },
    ],
  },
];
