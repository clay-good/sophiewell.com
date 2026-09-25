// spec-v1496: MCP adapter. The dom keys mirror views/group-v1496.js and this tile's META example.

import * as TP from '../../lib/turesky-plaque-v1496.js';

export default [
  {
    id: 'turesky-plaque',
    summary: 'Turesky modified Quigley-Hein plaque index: the mean 0 to 5 score from the number of surfaces at each score.',
    compute: TP.tureskyPlaque,
    fields: TP.TQH_SCORES.map(([s]) => ({ dom: `tqh-n${s}`, arg: `n${s}`, kind: 'number', required: true, label: `Surfaces scored ${s}` })),
  },
];
