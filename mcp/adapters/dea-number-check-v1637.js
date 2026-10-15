// spec-v1637 MCP adapter: dea-number-check in lib/dea-number-check-v1637.js. The dom keys mirror
// views/group-v1637.js and META['dea-number-check'].example. Administrative domain. No clock.

import { deaNumberCheck } from '../../lib/dea-number-check-v1637.js';

export default [
  {
    id: 'dea-number-check',
    summary: 'Whether a DEA registration number is well formed: two letters, seven digits and a check digit. The check is the formula a pharmacy-law article states, which DEA does not publish but its own example obeys. A pass does not show the registration is real.',
    compute: deaNumberCheck,
    fields: [
      { dom: 'dnc-number', arg: 'deaNumber', kind: 'string', required: true, label: 'DEA number' },
      { dom: 'dnc-name', arg: 'lastName', kind: 'string', label: 'Registrant last name (optional, for the second letter)' },
    ],
  },
];
