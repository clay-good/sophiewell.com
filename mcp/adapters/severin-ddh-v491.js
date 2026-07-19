// spec-v491 MCP wave: adapter for the Severin DDH outcome classification in lib/severin-ddh-v491.js. The dom
// key mirrors the browser renderer (views/group-v491.js) and META['severin-ddh'].example. `group` is an enum
// (I..VI). The compute reports the group and its hip-congruency description. The example sets group II; its
// expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/severin-ddh-v491.js';

export default [
  {
    id: 'severin-ddh',
    summary: 'The Severin classification of the radiographic outcome of the hip after treatment for developmental dysplasia (DDH), by congruency and the center-edge angle at maturity, groups I/II/III/IV/V/VI. I: normal. II: concentric with moderate deformity. III: dysplastic without subluxation. IV: subluxated. V: false (secondary) acetabulum. VI: redislocation. Reports the radiographic group, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.severinDdh,
    fields: [
      { dom: 'severin-group', arg: 'group', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V', 'VI'], label: 'Severin group' },
    ],
  },
];
