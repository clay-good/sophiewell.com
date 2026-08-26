// spec-v799 MCP adapter: Caine criteria in lib/caine-wernicke-v799.js.
// The dom keys mirror the browser renderer (views/group-v799.js) and
// META['caine-wernicke'].example. Two of four booleans meet the criteria. Clinical domain.

import { caineWernicke } from '../../lib/caine-wernicke-v799.js';

export default [
  {
    id: 'caine-wernicke',
    summary: 'Flags possible Wernicke encephalopathy when TWO of four signs are present (Caine 1997): dietary deficiency, oculomotor abnormalities, cerebellar dysfunction, and either an altered mental state or mild memory impairment. The rule exists because the classic triad appears in only about 16% of cases and about 19% show none of it at first assessment; at two signs the criteria are about 85% sensitive. Not meeting two does NOT exclude the diagnosis, and thiamine is given on suspicion.',
    compute: caineWernicke,
    fields: [
      { dom: 'caine-diet', arg: 'dietaryDeficiency', kind: 'boolean', required: false, label: 'Dietary deficiency' },
      { dom: 'caine-ocular', arg: 'oculomotor', kind: 'boolean', required: false, label: 'Oculomotor abnormalities' },
      { dom: 'caine-cerebellar', arg: 'cerebellar', kind: 'boolean', required: false, label: 'Cerebellar dysfunction' },
      { dom: 'caine-mental', arg: 'mentalOrMemory', kind: 'boolean', required: false, label: 'Altered mental state or memory' },
    ],
  },
];
