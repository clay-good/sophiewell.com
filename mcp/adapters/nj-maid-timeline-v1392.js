// spec-v1392: MCP adapter. The dom keys mirror views/group-v1392.js and this tile's META example.
// Dates are 'YYYY-MM-DD' and times 'YYYY-MM-DDTHH:MM'; the tile never reads the clock.

import * as NJM from '../../lib/nj-maid-timeline-v1392.js';

export default [
  {
    id: 'nj-maid-timeline',
    summary: 'Computes the earliest date a New Jersey aid-in-dying prescription may be written under N.J.S.A. 26:16-10, and which rule binds. It is the latest of 15 days after the first oral request, 48 hours after the written request is received, and a second oral request at least 15 days after the first. The patient may rescind at any time and in any manner.',
    compute: NJM.njMaidTimeline,
    fields: [
      { dom: 'njm-first', arg: 'firstOral', kind: 'string', required: true, label: 'First oral request (YYYY-MM-DDTHH:MM)' },
      { dom: 'njm-written', arg: 'written', kind: 'string', required: true, label: 'Written request received (YYYY-MM-DDTHH:MM)' },
      { dom: 'njm-second', arg: 'secondOral', kind: 'string', label: 'Second oral request (YYYY-MM-DDTHH:MM)' },
    ],
  },
];
