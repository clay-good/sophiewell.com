// spec-v1486: MCP adapter. The dom keys mirror views/group-v1486.js and this tile's META example.

import * as PA from '../../lib/pai-periapical-v1486.js';

const SCORES = ['1', '2', '3', '4', '5'];

export default [
  {
    id: 'pai-periapical',
    summary: 'Periapical Index (PAI) 1 to 5 for up to four roots. The tooth takes its highest root score, read as healthy (1 or 2) or apical periodontitis (3 to 5).',
    compute: PA.paiPeriapical,
    fields: PA.PAI_ROOTS.map((k, i) => ({ dom: `pai-${k}`, arg: k, kind: 'enum', required: false, values: SCORES, label: `Root ${i + 1} PAI score` })),
  },
];
