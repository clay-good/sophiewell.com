// spec-v1389: MCP adapter. The dom keys mirror views/group-v1389.js and this tile's META example.

import * as NY from '../../lib/ny-mhl-hold-clock-v1389.js';

export default [
  {
    id: 'ny-mhl-hold-clock',
    summary: "New York psychiatric hold deadlines by legal status, where only the 9.37 clock skips Sundays and holidays. Under Mental Hygiene Law 9.39 a second physician confirms within 48 hours of admission, retention runs at most 15 days, and a requested hearing is held within 5 days. Under 9.37 the second certificate is filed within 72 hours of admission, excluding Sundays and holidays, counted on New York's legal holidays. Under 9.40 (CPEP) the examination begins within 6 hours of registration, retention past 24 hours needs a second physician, and 72 hours is the most. Under 9.13 a voluntary patient's written notice starts 72 hours to release or apply to court. Under 9.27 the application is executed within 10 days before admission.",
    compute: NY.nyMhlHoldClock,
    fields: [
      { dom: 'nyh-status', arg: 'status', kind: 'enum', required: true, label: 'Legal status', values: NY.NY_STATUSES.map((s) => s.value) },
      { dom: 'nyh-start', arg: 'start', kind: 'string', label: 'Start: admission, CPEP registration, or notice received (YYYY-MM-DDTHH:MM)' },
      { dom: 'nyh-hearing', arg: 'hearingRequested', kind: 'string', label: 'Hearing requested, 9.39 (YYYY-MM-DDTHH:MM)' },
      { dom: 'nyh-executed', arg: 'executed', kind: 'string', label: 'Application executed, 9.27 (YYYY-MM-DD)' },
    ],
  },
];
