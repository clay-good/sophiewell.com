// spec-v1499: MCP adapter. The dom keys mirror views/group-v1499.js and this tile's META example.

import * as PD from '../../lib/paed-delirium-v1499.js';

const VALUES = PD.ANCHORS.map((a) => a.value);

export default [
  {
    id: 'paed-delirium',
    summary: 'PAED scale for pediatric emergence delirium: five items totaled 0 to 20, read against the cutoffs of 10 or more and more than 12.',
    compute: PD.paedDelirium,
    fields: PD.PAED_ITEMS.map(([k, label]) => ({ dom: `paed-${k}`, arg: k, kind: 'enum', required: false, values: VALUES, label })),
  },
];
