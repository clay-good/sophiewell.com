// spec-v1637 MCP adapter: dea-222-validity in lib/dea-222-validity-v1637.js. The dom keys mirror
// views/group-v1637.js and META['dea-222-validity'].example. Administrative domain.

import * as F2 from '../../lib/dea-222-validity-v1637.js';

export default [
  {
    id: 'dea-222-validity',
    summary: 'How long a DEA Form 222 or an electronic (CSOS) order stays valid. The last shipment date is 60 days after the purchaser executed it, or six months for a Defense Supply Center order (21 CFR 1305.13, 1305.22). Checks each shipment date entered and gives the month-end deadline for a non-ARCOS supplier to send DEA its copy.',
    compute: (args) => F2.dea222Validity(args, new Date()),
    fields: [
      { dom: 'd22-kind', arg: 'kind', kind: 'enum', required: true, values: F2.KINDS.map((k) => k.value).filter(Boolean), label: 'Paper form or electronic order' },
      { dom: 'd22-purchaser', arg: 'purchaser', kind: 'enum', required: true, values: F2.PURCHASERS.map((k) => k.value).filter(Boolean), label: 'Purchaser' },
      { dom: 'd22-executed', arg: 'executed', kind: 'string', required: true, label: 'Date the purchaser executed the order (YYYY-MM-DD)' },
      { dom: 'd22-shipments', arg: 'shipments', kind: 'string', label: 'Shipment dates so far, separated by commas (YYYY-MM-DD)' },
    ],
  },
];
