// spec-v1655 MCP adapter: device-utilization-ratio in lib/device-utilization-ratio-v1655.js. The dom keys mirror views/group-v1655.js and
// META['device-utilization-ratio'].example.

import * as DUR from '../../lib/device-utilization-ratio-v1655.js';

export default [
  {
    id: 'device-utilization-ratio',
    summary: 'Device days divided by patient days for a central line, urinary catheter or ventilator: the NHSN device utilization ratio. It tracks one unit\'s device use over time.',
    compute: DUR.deviceUtilizationRatio,
    fields: [
      { dom: 'dur-device', arg: 'device', kind: 'enum', values: DUR.DEVICES.map((d) => d.value), required: true, label: 'Device' },
      { dom: 'dur-device-days', arg: 'deviceDays', kind: 'number', required: true, label: 'Device days' },
      { dom: 'dur-patient-days', arg: 'patientDays', kind: 'number', required: true, label: 'Patient days' },
    ]
  },
];
