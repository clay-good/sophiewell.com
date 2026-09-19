// spec-v1395: MCP adapter. The dom keys mirror views/group-v1395.js and this tile's META example.
// Times are local wall-clock 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as RC from '../../lib/reportable-condition-urgency-v1395.js';

export default [
  {
    id: 'reportable-condition-urgency',
    summary: 'Gives the reporting deadline for a notifiable condition in NY, NJ, CA, or TX, from each state\'s current list. California (Title 17, June 2025) sorts conditions into immediately by phone, one working day, and seven days. Texas (DSHS 2026 list) uses call immediately, one work day, one week, one month, and 10 work days. New York (DOH-389 requirements, 08/26) phones in the diseases it prints in red bold and reports the rest within 24 hours (10 NYCRR 2.10). New Jersey (NJDOH summary of N.J.A.C. 8:57-2.2-2.4, January 2026) phones in its immediate list and takes the rest by the next business day. Each answer names its edition.',
    compute: RC.reportableConditionUrgency,
    fields: [
      { dom: 'rc-state', arg: 'state', kind: 'enum', required: true, label: 'State', values: RC.RC_STATES.map((s) => s.value) },
      { dom: 'rc-ca', arg: 'caCondition', kind: 'enum', label: 'California condition', values: RC.CA_CONDITIONS.map((c) => c.value) },
      { dom: 'rc-tx', arg: 'txCondition', kind: 'enum', label: 'Texas condition', values: RC.TX_CONDITIONS.map((c) => c.value) },
      { dom: 'rc-ny', arg: 'nyCondition', kind: 'enum', label: 'New York condition', values: RC.NY_CONDITIONS.map((c) => c.value) },
      { dom: 'rc-nj', arg: 'njCondition', kind: 'enum', label: 'New Jersey condition', values: RC.NJ_CONDITIONS.map((c) => c.value) },
      { dom: 'rc-time', arg: 'identified', kind: 'string', required: true, label: 'Identified (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
