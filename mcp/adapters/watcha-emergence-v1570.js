// spec-v1570: MCP adapter. The dom keys mirror views/group-v1570.js and this tile's META example.

import * as WE from '../../lib/watcha-emergence-v1570.js';

export default [
  {
    id: 'watcha-emergence',
    summary: 'Watcha scale for emergence agitation in children: the most agitated behavior since emergence, 3 or more is agitation.',
    compute: WE.watchaEmergence,
    fields: [
      { dom: 'we-behavior', arg: 'behavior', kind: 'enum', required: true, values: WE.BEHAVIORS.map((b) => b.value), label: 'Most agitated behavior since emergence' },
    ],
  },
];
