// spec-v1634 MCP adapter: sedative-load in lib/sedative-load-v1634.js. The dom keys mirror views/group-v1634.js
// and META['sedative-load'].example. Clinical domain.

import * as SL from '../../lib/sedative-load-v1634.js';

export default [
  {
    id: 'sedative-load',
    summary: 'Sedative load by the Linjakumpu model: 2 for each primary sedative and 1 for each drug with sedation as a prominent side effect, summed over the drugs taken regularly.',
    compute: SL.sedativeLoad,
    fields: [
      { dom: 'sl-g1', arg: 'group1', kind: 'number', required: true, label: 'Group 1 drugs (primary sedatives)' },
      { dom: 'sl-g2', arg: 'group2', kind: 'number', required: true, label: 'Group 2 drugs (sedation a prominent side effect)' },
    ],
  },
];
