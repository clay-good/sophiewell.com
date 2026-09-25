// spec-v1490: MCP adapter. The dom keys mirror views/group-v1490.js and this tile's META example.

import * as HF from '../../lib/hamp-furcation-v1490.js';

export default [
  {
    id: 'hamp-furcation',
    summary: 'Hamp furcation degree I to III from the horizontal probing depth and whether the probe passes through.',
    compute: HF.hampFurcation,
    fields: [
      { dom: 'hf-through', arg: 'through', kind: 'enum', required: true, values: ['yes', 'no'], label: 'Probe passes through the furcation' },
      { dom: 'hf-horizontal', arg: 'horizontal', kind: 'number', required: false, label: 'Horizontal probing depth into the furcation', unit: 'mm' },
    ],
  },
];
