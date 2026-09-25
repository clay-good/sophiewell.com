// spec-v1448: MCP adapter. The dom keys mirror views/group-v1448.js and this tile's META example.

import * as AB from '../../lib/abc-psi-v1448.js';

const v = (list) => list.map((x) => x.value);

export default [
  {
    id: 'abc-psi',
    summary: 'Derives the ABC type of posterior shoulder instability: A for a first event within 3 months, B for recurrent dynamic instability, and C for static decentering. Each group splits in two by one further question from the history or imaging.',
    compute: AB.abcPsi,
    fields: [
      { dom: 'abc-pattern', arg: 'pattern', kind: 'enum', required: true, label: 'Pattern of posterior instability', values: v(AB.ABC_PATTERN) },
      { dom: 'abc-acute', arg: 'acute', kind: 'enum', label: 'If a first event: subluxation or dislocation', values: v(AB.ABC_ACUTE) },
      { dom: 'abc-dynamic', arg: 'dynamic', kind: 'enum', label: 'If recurrent: functional or structural', values: v(AB.ABC_DYNAMIC) },
      { dom: 'abc-static', arg: 'static', kind: 'enum', label: 'If static: constitutional or acquired', values: v(AB.ABC_STATIC) },
    ],
  },
];
