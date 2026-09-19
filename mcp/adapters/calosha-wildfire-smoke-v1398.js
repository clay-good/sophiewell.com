// spec-v1398: MCP adapter. The dom keys mirror views/group-v1398.js and this tile's META example.

import * as WS from '../../lib/calosha-wildfire-smoke-v1398.js';

export default [
  {
    id: 'calosha-wildfire-smoke',
    summary: 'States what California\'s wildfire smoke rule (8 CCR 5141.1) requires at the current AQI for PM2.5. Below 151, nothing; from 151 to 500, N95s provided for voluntary use with no fit test; above 500, respirators required under the full respiratory protection standard. A total of one hour or less of exposure in the shift is exempt.',
    compute: WS.caloshaWildfireSmoke,
    fields: [
      { dom: 'ws-aqi', arg: 'aqi', kind: 'number', label: 'Current AQI for PM2.5' },
      { dom: 'ws-conc', arg: 'conc', kind: 'number', label: 'PM2.5 concentration (ug/m3)' },
      { dom: 'ws-hours', arg: 'hours', kind: 'number', required: true, label: 'Hours of exposure this shift' },
    ],
  },
];
