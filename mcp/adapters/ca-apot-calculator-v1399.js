// spec-v1399: MCP adapter. The dom keys mirror views/group-v1399.js and this tile's META example.

import * as APOT from '../../lib/ca-apot-calculator-v1399.js';

export default [
  {
    id: 'ca-apot-calculator',
    summary: 'Computes California ambulance patient offload time from arrival and transfer-of-care pairs: the 90th percentile and the share within 30 minutes. It checks them against AB 40\'s ceiling (HSC 1797.120.5): a local standard may not exceed 30 minutes, 90 percent of the time. The percentile is nearest-rank, and a row missing a time is listed and excluded, never counted as zero.',
    compute: APOT.caApotCalculator,
    fields: [
      { dom: 'apot-rows', arg: 'rows', kind: 'string', required: true, label: 'Offloads, one per line: arrival, transfer of care (HH:MM)' },
    ],
  },
];
