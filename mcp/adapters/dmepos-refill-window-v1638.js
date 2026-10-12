// spec-v1638 MCP adapter: dmepos-refill-window in lib/dmepos-refill-window-v1638.js. The dom keys mirror
// views/group-v1638.js and META['dmepos-refill-window'].example. Administrative domain. No clock.

import * as DR from '../../lib/dmepos-refill-window-v1638.js';

export default [
  {
    id: 'dmepos-refill-window',
    summary: 'The Medicare window for refilling DMEPOS supplies. The supplier\'s contact and the beneficiary\'s yes must fall within 30 calendar days of the expected end of the current supply, and the refill\'s date of service no earlier than 10 days before it (42 CFR 410.38(d)(4)). Checks a contact date and a planned delivery date.',
    compute: DR.dmeposRefillWindow,
    fields: [
      { dom: 'drw-last', arg: 'lastService', kind: 'string', label: 'Date of the last delivery or shipment (YYYY-MM-DD)' },
      { dom: 'drw-qty', arg: 'quantity', kind: 'number', label: 'Quantity delivered' },
      { dom: 'drw-use', arg: 'dailyUse', kind: 'number', label: 'Daily use' },
      { dom: 'drw-end', arg: 'expectedEnd', kind: 'string', label: 'Or the expected end of the current supply (YYYY-MM-DD)' },
      { dom: 'drw-contact', arg: 'contacted', kind: 'string', label: 'Date the supplier contacted the beneficiary (YYYY-MM-DD)' },
      { dom: 'drw-planned', arg: 'plannedService', kind: 'string', label: 'Planned delivery or shipping date (YYYY-MM-DD)' },
    ],
  },
];
