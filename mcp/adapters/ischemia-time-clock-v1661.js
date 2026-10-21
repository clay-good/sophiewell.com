// spec-v1661 MCP adapter: ischemia-time-clock in lib/ischemia-time-clock-v1661.js. The dom keys mirror views/group-v1661.js and
// META['ischemia-time-clock'].example.

import * as ITC from '../../lib/ischemia-time-clock-v1661.js';

export default [
  {
    id: 'ischemia-time-clock',
    summary: 'The intervals between an organ\'s recovery and implant events, from the times you record. Also when an hour limit from the first event runs out; each interval is named by its two events.',
    compute: ITC.ischemiaTimeClock,
    fields: [
      { dom: 'itc-events', arg: 'events', kind: 'string', required: true, label: 'Events in order, one per line: name, then YYYY-MM-DD HH:MM' },
      { dom: 'itc-limit', arg: 'limitHours', kind: 'number', required: false, label: 'A limit in hours from the first event (optional)' },
    ]
  },
];
