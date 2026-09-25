// spec-v1488: MCP adapter. The dom keys mirror views/group-v1488.js and this tile's META example.

import * as NT from '../../lib/nordland-tarnow-papilla-v1488.js';

const YN = ['yes', 'no'];

export default [
  {
    id: 'nordland-tarnow-papilla',
    summary: 'Nordland-Tarnow papilla loss, Normal or Class I to III. The class is derived from the contact point and the two cementoenamel junctions.',
    compute: NT.nordlandTarnowPapilla,
    fields: [
      { dom: 'nt-space', arg: 'space', kind: 'enum', required: true, values: YN, label: 'Space between the papilla tip and the contact point' },
      { dom: 'nt-intercej', arg: 'interproximalCej', kind: 'enum', required: false, values: YN, label: 'Interproximal cementoenamel junction visible' },
      { dom: 'nt-facial', arg: 'facialCej', kind: 'enum', required: false, values: YN, label: 'Papilla tip level with or apical to the facial cementoenamel junction' },
    ],
  },
];
