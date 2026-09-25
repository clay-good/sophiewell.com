// spec-v1491: MCP adapter. The dom keys mirror views/group-v1491.js and this tile's META example.

import * as PU from '../../lib/pufa-index-v1491.js';

export default [
  {
    id: 'pufa-index',
    summary: 'PUFA/pufa index: teeth with pulp involvement, ulceration, a fistula or an abscess, counted for the permanent and primary teeth.',
    compute: PU.pufaIndex,
    fields: PU.PUFA_FIELDS.map(([k, label]) => ({ dom: `pufa-${k}`, arg: k, kind: 'number', required: false, label: `${label.charAt(0).toUpperCase()}${label.slice(1)}` })),
  },
];
