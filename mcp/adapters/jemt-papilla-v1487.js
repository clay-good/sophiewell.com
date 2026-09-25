// spec-v1487: MCP adapter. The dom keys mirror views/group-v1487.js and this tile's META example.

import * as JP from '../../lib/jemt-papilla-v1487.js';

const SCORES = ['0', '1', '2', '3', '4'];

export default [
  {
    id: 'jemt-papilla',
    summary: 'Jemt papilla index 0 to 4 beside a single implant. The mesial and distal papillae are scored and reported separately.',
    compute: JP.jemtPapilla,
    fields: [
      { dom: 'jemt-mesial', arg: 'mesial', kind: 'enum', required: false, values: SCORES, label: 'Mesial papilla Jemt score' },
      { dom: 'jemt-distal', arg: 'distal', kind: 'enum', required: false, values: SCORES, label: 'Distal papilla Jemt score' },
    ],
  },
];
