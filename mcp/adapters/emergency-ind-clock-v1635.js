// spec-v1635 MCP adapter: emergency-ind-clock in lib/emergency-ind-clock-v1635.js. The dom keys
// mirror views/group-v1635.js and META['emergency-ind-clock'].example. Operational domain. At least
// one of the two dates is needed.

import * as EI from '../../lib/emergency-ind-clock-v1635.js';

export default [
  {
    id: 'emergency-ind-clock',
    summary: 'Follow-up deadlines after an emergency expanded access use of an investigational drug. The written submission to FDA is due 15 working days after FDA authorized the use (21 CFR 312.310), and the report to the IRB 5 working days after the use (21 CFR 56.104). Working days are counted Monday to Friday without federal holidays, which the rules do not define.',
    compute: EI.emergencyIndClock,
    fields: [
      { dom: 'eic-authorized', arg: 'authorized', kind: 'string', label: 'Date FDA authorized the emergency use (YYYY-MM-DD)' },
      { dom: 'eic-used', arg: 'used', kind: 'string', label: 'Date of the emergency use at the institution (YYYY-MM-DD)' },
    ],
  },
];
