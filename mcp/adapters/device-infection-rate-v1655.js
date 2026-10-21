// spec-v1655 MCP adapter: device-infection-rate in lib/device-infection-rate-v1655.js. The dom keys mirror views/group-v1655.js and
// META['device-infection-rate'].example.

import * as DIR from '../../lib/device-infection-rate-v1655.js';

export default [
  {
    id: 'device-infection-rate',
    summary: 'CLABSI, CAUTI or VAE rate per 1,000 device days, as the NHSN Patient Safety Component Manual computes it. It also gives the VAE rate per 100 episodes of mechanical ventilation.',
    compute: DIR.deviceInfectionRate,
    fields: [
      { dom: 'dir-device', arg: 'device', kind: 'enum', values: DIR.DEVICES.map((d) => d.value), required: true, label: 'Device and event' },
      { dom: 'dir-events', arg: 'events', kind: 'number', required: true, label: 'Events in the period' },
      { dom: 'dir-device-days', arg: 'deviceDays', kind: 'number', required: true, label: 'Device days' },
      { dom: 'dir-episodes', arg: 'episodes', kind: 'number', required: false, label: 'Episodes of mechanical ventilation (VAE only)' },
    ]
  },
];
