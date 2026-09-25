// spec-v1445: MCP adapter. The dom key mirrors views/group-v1445.js and this tile's META example.

import * as NG from '../../lib/ng-tube-length-v1445.js';

export default [
  {
    id: 'ng-tube-length',
    summary: 'Turns an adult nose-earlobe-xiphoid (NEX) measurement into a nasogastric tube insertion length with the corrected NEX formula. It shows the NEX and Hanson lengths for comparison and says the length never replaces checking where the tip is.',
    compute: NG.ngTubeLength,
    fields: [
      { dom: 'ng-nex', arg: 'nexCm', kind: 'number', required: true, label: 'NEX distance (nose tip to earlobe to xiphoid)', unit: 'cm' },
    ],
  },
];
