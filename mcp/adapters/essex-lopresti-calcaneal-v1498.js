// spec-v1498: MCP adapter. The dom keys mirror views/group-v1498.js and this tile's META example.

import * as EL from '../../lib/essex-lopresti-calcaneal-v1498.js';

export default [
  {
    id: 'essex-lopresti-calcaneal',
    summary: 'Essex-Lopresti calcaneal fracture type: extra-articular, tongue-type or joint-depression, from where the fracture lines run.',
    compute: EL.essexLoprestiCalcaneal,
    fields: [
      { dom: 'el-subtalar', arg: 'subtalar', kind: 'enum', required: true, values: ['yes', 'no'], label: 'Subtalar joint involved' },
      { dom: 'el-exit', arg: 'exit', kind: 'enum', required: false, values: EL.EXIT.map((x) => x.value), label: 'Where the secondary fracture line runs' },
    ],
  },
];
