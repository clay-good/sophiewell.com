// spec-v1637 MCP adapter: cs-disposal-clock in lib/cs-disposal-clock-v1637.js. The dom keys mirror
// views/group-v1637.js and META['cs-disposal-clock'].example. Administrative domain.

import * as DS from '../../lib/cs-disposal-clock-v1637.js';

export default [
  {
    id: 'cs-disposal-clock',
    summary: 'Controlled-substance disposal deadlines under 21 CFR part 1317. A reverse distributor destroys within 30 calendar days of receipt; a long-term care facility places a resident\'s drugs in the collection receptacle within three business days of the resident stopping; a removed inner liner is stored at most three business days.',
    compute: (args) => DS.csDisposalClock(args, new Date()),
    fields: [
      { dom: 'cdc-who', arg: 'who', kind: 'enum', required: true, values: DS.WHO.map((k) => k.value), label: 'Who is disposing, and what started the clock' },
      { dom: 'cdc-trigger', arg: 'trigger', kind: 'string', required: true, label: 'The date it happened (YYYY-MM-DD)' },
    ],
  },
];
