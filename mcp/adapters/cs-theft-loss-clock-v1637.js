// spec-v1637 MCP adapter: cs-theft-loss-clock in lib/cs-theft-loss-clock-v1637.js. The dom keys
// mirror views/group-v1637.js and META['cs-theft-loss-clock'].example. Administrative domain.

import * as TL from '../../lib/cs-theft-loss-clock-v1637.js';

export default [
  {
    id: 'cs-theft-loss-clock',
    summary: 'Report deadlines for a theft or significant loss of controlled substances. Counted from the day of discovery: written notice to the DEA Field Division Office within one business day and DEA Form 106 within 45 days (21 CFR 1301.76(b), 1301.74(c)). Lists the six factors for a significant loss. It does not decide significance.',
    compute: (args) => TL.csTheftLossClock(args, new Date()),
    fields: [
      { dom: 'ctl-registrant', arg: 'registrant', kind: 'enum', required: true, values: TL.REGISTRANTS.map((k) => k.value).filter(Boolean), label: 'Registrant' },
      { dom: 'ctl-discovered', arg: 'discovered', kind: 'string', required: true, label: 'Date the theft or loss was discovered (YYYY-MM-DD)' },
      { dom: 'ctl-closed', arg: 'closedDays', kind: 'string', label: 'Other days the business is closed, separated by commas (YYYY-MM-DD)' },
    ],
  },
];
