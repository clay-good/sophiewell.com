// spec-v1491: MCP adapter. The dom keys mirror views/group-v1491.js and this tile's META example.

import * as PU from '../../lib/pufa-index-v1491.js';

export default [
  {
    id: 'pufa-index',
    summary: 'PUFA/pufa index: teeth with pulp involvement, ulceration, a fistula or an abscess, counted for the permanent and primary teeth.',
    compute: PU.pufaIndex,
    // spec-v1793: PUFA_FIELDS has carried each code's tooth-count ceiling as its third element since the
    // tool was built, and the library refuses past it; the descriptor dropped it on the floor.
    fields: PU.PUFA_FIELDS.map(([k, label, hi]) => ({ dom: `pufa-${k}`, arg: k, kind: 'number', required: false, label: `${label.charAt(0).toUpperCase()}${label.slice(1)}`, min: 0, max: hi })),
  },
];
