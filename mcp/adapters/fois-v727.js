// spec-v727 MCP adapter: Functional Oral Intake Scale in lib/fois-v727.js.
// The dom keys mirror the browser renderer (views/group-v727.js) and META['fois'].example.
// One enum (level 1-7); decision logic returns the FOIS level. Clinical domain.

import { fois } from '../../lib/fois-v727.js';

export default [
  {
    id: 'fois',
    summary: 'Functional Oral Intake Scale (FOIS; Crary 2005): 7-level ordinal scale of oral intake in dysphagia. 1 no oral intake; 2 tube-dependent, minimal oral; 3 tube supplements + consistent oral; 4 total oral, single consistency; 5 total oral, multiple consistencies, special prep; 6 total oral, avoid specific foods/liquids; 7 total oral, no restrictions. Levels 1-3 involve tube feeding; 4-7 total oral.',
    compute: fois,
    fields: [
      { dom: 'fois-level', arg: 'level', kind: 'enum', values: ['1', '2', '3', '4', '5', '6', '7'], required: true, label: 'Functional level of oral intake (1-7)' },
    ],
  },
];
