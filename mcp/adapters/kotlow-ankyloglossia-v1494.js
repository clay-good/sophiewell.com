// spec-v1494: MCP adapter. The dom keys mirror views/group-v1494.js and this tile's META example.

import * as KA from '../../lib/kotlow-ankyloglossia-v1494.js';

export default [
  {
    id: 'kotlow-ankyloglossia',
    summary: 'Kotlow classification of ankyloglossia, Class I to IV, from the free tongue length in mm.',
    compute: KA.kotlowAnkyloglossia,
    fields: [
      { dom: 'ka-length', arg: 'length', kind: 'number', required: true, label: 'Free tongue length', unit: 'mm' },
    ],
  },
];
