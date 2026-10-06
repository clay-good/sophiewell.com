// spec-v1555 MCP adapter: the 20-minute whole blood clotting test in lib/wbct20-v1555.js.
// The dom keys mirror views/group-v1555.js and META['wbct20'].example. Clinical domain.

import * as W from '../../lib/wbct20-v1555.js';

export default [
  {
    id: 'wbct20',
    summary: 'Reads a 20-minute whole blood clotting test after a snakebite. It checks the vessel (only clean, dry glass is valid), says what clotted or not clotted means, and when to retest: hourly then 6-hourly, or 6 hours after antivenom.',
    compute: W.wbct20,
    fields: [
      { dom: 'wb-vessel', arg: 'vessel', kind: 'enum', required: true, label: 'Vessel the blood was tested in', values: W.VESSEL_OPTIONS.map((d) => d.value) },
      { dom: 'wb-result', arg: 'result', kind: 'enum', required: true, label: 'Result after 20 minutes', values: W.RESULT_OPTIONS.map((d) => d.value) },
      { dom: 'wb-timing', arg: 'timing', kind: 'enum', required: true, label: 'When the test was done', values: W.TIMING_OPTIONS.map((d) => d.value) },
      { dom: 'wb-hours', arg: 'hours', kind: 'number', label: 'Hours since the antivenom loading dose', min: 0, max: 72 },
      { dom: 'wb-region', arg: 'region', kind: 'enum', label: 'Region', values: W.REGION_OPTIONS.map((d) => d.value) },
    ],
  },
];
