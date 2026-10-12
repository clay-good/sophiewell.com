// spec-v1637 MCP adapter: mat-injection-admin-deadline in lib/mat-injection-admin-deadline-v1637.js.
// The dom keys mirror views/group-v1637.js and META['mat-injection-admin-deadline'].example.
// Administrative domain.

import { matInjectionAdminDeadline } from '../../lib/mat-injection-admin-deadline-v1637.js';

export default [
  {
    id: 'mat-injection-admin-deadline',
    summary: 'The administer-by date for injectable buprenorphine a pharmacy delivered to the practitioner. An injectable or implantable Schedule III to V narcotic for opioid use disorder must be given not later than 45 days after the practitioner received it (21 CFR 1306.07(f)(5)). Lists the conditions of the delivery rule. Older references say 14 days.',
    compute: (args) => matInjectionAdminDeadline(args, new Date()),
    fields: [
      { dom: 'mia-received', arg: 'received', kind: 'string', required: true, label: 'Date the practitioner received the drug from the pharmacy (YYYY-MM-DD)' },
    ],
  },
];
