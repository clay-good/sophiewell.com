// spec-v412 MCP wave: adapter for the Myerson classification of Lisfranc (tarsometatarsal) injuries in
// lib/lisfranc-myerson-v412.js. The dom key mirrors the browser renderer (views/group-v412.js) and
// META['lisfranc-myerson'].example. `type` is an enum (A/B1/B2/C1/C2). The compute reports the type and its
// incongruity/displacement description. The example sets type B2; its expected text carries no numeric
// facts (the type descriptions are word-only), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/lisfranc-myerson-v412.js';

export default [
  {
    id: 'lisfranc-myerson',
    summary: 'Myerson classification (a modification of the Hardcastle / Quenu-Kuss classification) of a Lisfranc (tarsometatarsal, TMT) injury, types A/B1/B2/C1/C2, by the pattern and direction of the tarsometatarsal incongruity. A: total incongruity - all five metatarsals displaced in the same direction (homolateral). B1: partial incongruity, medial - medial displacement of the first metatarsal. B2: partial incongruity, lateral - lateral displacement of one or more of the lateral four metatarsals. C1: divergent, partial. C2: divergent, total (all five metatarsals). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.lisfrancMyerson,
    fields: [
      { dom: 'lf-type', arg: 'type', kind: 'enum', values: ['A', 'B1', 'B2', 'C1', 'C2'], label: 'Myerson type' },
    ],
  },
];
