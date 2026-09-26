// spec-v1572: MCP adapter. The dom keys mirror views/group-v1572.js and this tile's META example.

import * as TO from '../../lib/thomazeau-occupation-v1572.js';

export default [
  {
    id: 'thomazeau-occupation',
    summary: 'Thomazeau occupation ratio of the supraspinatus, grade I to III, from the muscle and fossa areas.',
    compute: TO.thomazeauOccupation,
    fields: [
      { dom: 'to-muscle', arg: 'muscle', kind: 'number', required: true, label: 'Supraspinatus muscle area', unit: 'cm^2' },
      { dom: 'to-fossa', arg: 'fossa', kind: 'number', required: true, label: 'Supraspinatus fossa area', unit: 'cm^2' },
    ],
  },
];
