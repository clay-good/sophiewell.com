// spec-v1639 MCP adapter: emergency-contraception-window in
// lib/emergency-contraception-window-v1639.js. The dom keys mirror views/group-v1639.js and
// META['emergency-contraception-window'].example. Two label rows: Plan B One-Step and ella.

import * as EC from '../../lib/emergency-contraception-window-v1639.js';

export default [
  {
    id: 'emergency-contraception-window',
    summary: 'Hours since unprotected intercourse against each source, side by side. Plan B One-Step label: within 72 hours. ella label: within 120 hours. CDC 2024: pills and the copper IUD within 5 days. Gives the time each closes, the dates for starting regular contraception after, and the vomiting lines.',
    compute: EC.emergencyContraceptionWindow,
    fields: [
      { dom: 'ecw-sex', arg: 'intercourseAt', kind: 'string', required: true, label: 'Date and time of unprotected intercourse (YYYY-MM-DDTHH:MM)' },
      { dom: 'ecw-now', arg: 'nowAt', kind: 'string', required: true, label: 'Date and time now (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
