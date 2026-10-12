// spec-v1637 MCP adapter: dea-registration-renewal in lib/dea-registration-renewal-v1637.js. The
// dom keys mirror views/group-v1637.js and META['dea-registration-renewal'].example.
// Administrative domain. The clock is read here for "where today falls".

import * as DR from '../../lib/dea-registration-renewal-v1637.js';

export default [
  {
    id: 'dea-registration-renewal',
    summary: 'DEA registration renewal dates from the expiration date. Gives the earliest application date (60 days before, or 120 for bulk manufacturers and importers of Schedule I or II), the 45-day mark for the automatic extension, the end of the one-month reinstatement DEA allows, and the next 36-month expiration. Federal rule only.',
    compute: (args) => DR.deaRegistrationRenewal(args, new Date()),
    fields: [
      { dom: 'drr-kind', arg: 'kind', kind: 'enum', required: true, values: DR.KINDS.map((k) => k.value).filter(Boolean), label: 'Kind of registrant' },
      { dom: 'drr-expires', arg: 'expires', kind: 'string', required: true, label: 'Expiration date on the certificate (YYYY-MM-DD)' },
      { dom: 'drr-submitted', arg: 'submitted', kind: 'string', label: 'Date the renewal application was submitted (YYYY-MM-DD)' },
      { dom: 'drr-registered', arg: 'registered', kind: 'string', label: 'Date of first registration (YYYY-MM-DD)' },
    ],
  },
];
