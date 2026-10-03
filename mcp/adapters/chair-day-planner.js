// spec-v1512 tool 4: MCP adapter for chair-day-planner. The dom keys mirror views/group-v1512.js.

import * as CD from '../../lib/chair-day-planner.js';

export default [
  {
    id: 'chair-day-planner',
    summary: 'An infusion center\'s chair day, scheduled first-fit. Each appointment\'s premedication, infusion and observation time per chair, the ones that do not fit, and utilization.',
    compute: CD.chairDayPlanner,
    fields: [
      { dom: 'cdp-chairs', arg: 'chairs', kind: 'number', required: true, label: 'Chairs' },
      { dom: 'cdp-open', arg: 'open', kind: 'string', required: true, label: 'Opening time (HH:MM)' },
      { dom: 'cdp-close', arg: 'close', kind: 'string', required: true, label: 'Closing time (HH:MM)' },
      { dom: 'cdp-appts', arg: 'appointments', kind: 'string', required: true, label: 'Appointments, one per line: reference, chair minutes, premedication minutes, observation minutes, preferred start (HH:MM, optional)' },
    ],
  },
];
