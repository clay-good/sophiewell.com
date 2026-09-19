// spec-v1395: MCP adapter. The dom keys mirror views/group-v1395.js and this tile's META example.
// Times are local wall-clock 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as RC from '../../lib/reportable-condition-urgency-v1395.js';

export default [
  {
    id: 'reportable-condition-urgency',
    summary: 'Gives the reporting deadline for a notifiable condition in California or Texas, from each state\'s current list. California (Title 17, June 2025) sorts conditions into immediately by phone, one working day, and seven days. Texas (DSHS 2026 list) uses call immediately, one work day, one week, one month, and 10 work days. Each answer names its edition. New York and New Jersey are not offered yet.',
    compute: RC.reportableConditionUrgency,
    fields: [
      { dom: 'rc-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: RC.RC_STATES.map((s) => s.value) },
      { dom: 'rc-ca', arg: 'caCondition', kind: 'enum', label: 'California condition', values: RC.CA_CONDITIONS.map((c) => c.value) },
      { dom: 'rc-tx', arg: 'txCondition', kind: 'enum', label: 'Texas condition', values: RC.TX_CONDITIONS.map((c) => c.value) },
      { dom: 'rc-time', arg: 'identified', kind: 'string', required: true, label: 'Identified (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
