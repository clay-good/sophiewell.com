// spec-v1562 MCP adapter: helminth-intensity in lib/helminth-intensity-v1562.js.
// The dom keys mirror views/group-v1562.js and META['helminth-intensity'].example. Clinical domain.

import * as M from '../../lib/helminth-intensity-v1562.js';

export default [
  {
    id: 'helminth-intensity',
    summary: 'Classes a worm egg count as light, moderate or heavy by WHO Table 5.1. Roundworm, whipworm, hookworm and S. mansoni per gram of stool, S. haematobium per 10 mL of urine.',
    compute: M.helminthIntensity,
    fields: [
      { dom: 'hi-parasite', arg: 'parasite', kind: 'enum', required: true, label: 'Parasite', values: M.PARASITE_OPTIONS.map((d) => d.value) },
      { dom: 'hi-eggs', arg: 'eggs', kind: 'number', required: true, label: 'Eggs per gram of stool (or per 10 mL of urine for S. haematobium)', min: 0, max: 1000000 },
      { dom: 'hi-hematuria', arg: 'hematuria', kind: 'enum', label: 'S. haematobium: visible blood in the urine', values: M.YES_NO.map((d) => d.value) },
    ],
  },
];
