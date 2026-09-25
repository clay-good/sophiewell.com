// spec-v1429: MCP adapter. The dom keys mirror views/group-v1429.js and this tile's META example.

import * as NS from '../../lib/nerot-sirveaux-v1429.js';

export default [
  {
    id: 'nerot-sirveaux',
    summary: 'Grades scapular notching after reverse shoulder arthroplasty from 1 to 4 by how far the notch reaches on the radiograph. The lower screw and the baseplate are the landmarks; a projection other than a true AP tangential to the baseplate is flagged.',
    compute: NS.nerotSirveaux,
    fields: [
      { dom: 'nsn-extent', arg: 'extent', kind: 'enum', required: true, label: 'How far the notch reaches', values: NS.NSN_EXTENT.map((x) => x.value) },
      { dom: 'nsn-view', arg: 'view', kind: 'enum', label: 'Radiograph projection', values: NS.NSN_VIEW.map((x) => x.value) },
    ],
  },
];
