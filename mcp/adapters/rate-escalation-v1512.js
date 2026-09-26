// spec-v1512: MCP adapter for the infusion rate escalation schedule. The dom keys mirror views/group-v1512.js.

import * as RE from '../../lib/rate-escalation-v1512.js';

export default [
  {
    id: 'rate-escalation-schedule',
    summary: 'An infusion rate escalation schedule and finish time. Steps a starting rate up by an increment each interval to a maximum until the total is in.',
    compute: RE.rateEscalation,
    fields: [
      { dom: 're-unit', arg: 'unit', kind: 'enum', required: true, values: RE.UNITS.map((u) => u.value), label: 'Amounts in' },
      { dom: 're-total', arg: 'total', kind: 'number', required: true, label: 'Total to infuse' },
      { dom: 're-start', arg: 'startRate', kind: 'number', required: true, label: 'Starting rate per hour' },
      { dom: 're-inc', arg: 'increment', kind: 'number', required: true, label: 'Increase per step, per hour' },
      { dom: 're-every', arg: 'interval', kind: 'number', required: true, label: 'Minutes between increases', unit: 'min' },
      { dom: 're-max', arg: 'maxRate', kind: 'number', required: true, label: 'Maximum rate per hour' },
      { dom: 're-time', arg: 'startTime', kind: 'string', required: false, label: 'Start time (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
