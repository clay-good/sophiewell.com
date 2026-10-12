// spec-v1638 MCP adapter: partd-dmp-notice-clock in lib/partd-dmp-notice-clock-v1638.js. The dom
// keys mirror views/group-v1638.js and META['partd-dmp-notice-clock'].example. Administrative
// domain. No clock: every date is an input.

import * as NC from '../../lib/partd-dmp-notice-clock-v1638.js';

export default [
  {
    id: 'partd-dmp-notice-clock',
    summary: 'Part D drug management program notice dates from the initial notice. The member has 30 days to respond; the second notice goes out no earlier than day 30 and no later than 3 days after the determination or day 60; a limitation ends after one year, or two if extended (42 CFR 423.153(f)). Checks a notice already sent.',
    compute: NC.partdDmpNoticeClock,
    fields: [
      { dom: 'dnc-initial', arg: 'initialNotice', kind: 'string', required: true, label: 'Date of the initial notice (YYYY-MM-DD)' },
      { dom: 'dnc-determination', arg: 'determination', kind: 'string', label: 'Date of the sponsor determination (YYYY-MM-DD)' },
      { dom: 'dnc-found', arg: 'found', kind: 'enum', values: NC.FOUND.map((k) => k.value), label: 'What the determination found' },
      { dom: 'dnc-sent', arg: 'secondNoticeSent', kind: 'string', label: 'Date the second notice was sent (YYYY-MM-DD)' },
      { dom: 'dnc-attempts', arg: 'outreachAttempts', kind: 'string', label: 'Dates of attempts to reach prescribers, separated by commas (YYYY-MM-DD)' },
      { dom: 'dnc-effective', arg: 'limitationEffective', kind: 'string', label: 'Effective date of the limitation (YYYY-MM-DD)' },
      { dom: 'dnc-extended', arg: 'extended', kind: 'enum', values: NC.EXTENDED.map((k) => k.value), label: 'Whether the limitation was extended' },
    ],
  },
];
