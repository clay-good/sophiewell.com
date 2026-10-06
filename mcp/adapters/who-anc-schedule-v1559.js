// spec-v1559 MCP adapter: who-anc-schedule in lib/who-anc-schedule-v1559.js.
// The dom keys mirror views/group-v1559.js and META['who-anc-schedule'].example. Clinical domain.

import * as M from '../../lib/who-anc-schedule-v1559.js';

export default [
  {
    id: 'who-anc-schedule',
    summary: 'Gives the WHO eight-contact antenatal schedule for a gestational age. Which contact is due, when the next is, and the earlier contacts to catch up, with the daily iron, folic acid and calcium lines.',
    compute: M.whoAncSchedule,
    fields: [
      { dom: 'anc-weeks', arg: 'weeks', kind: 'number', required: true, label: 'Gestational age, completed weeks', min: 4, max: 44 },
      { dom: 'anc-days', arg: 'days', kind: 'number', label: 'Plus days (0-6)', min: 0, max: 6 },
    ],
  },
];
