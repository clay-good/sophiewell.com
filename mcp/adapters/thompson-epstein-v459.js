// spec-v459 MCP wave: adapter for the Thompson-Epstein posterior hip dislocation classification in
// lib/thompson-epstein-v459.js. The dom key mirrors the browser renderer (views/group-v459.js) and
// META['thompson-epstein'].example. `type` is an enum (I..V). The compute reports the type and its
// associated-fracture description. The example sets type II; its expected text carries no numeric facts (the
// description is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/thompson-epstein-v459.js';

export default [
  {
    id: 'thompson-epstein',
    summary: 'The Thompson-Epstein classification of posterior hip dislocations, by the associated acetabular or femoral-head fracture, types I/II/III/IV/V. I: no or minor rim fracture. II: a single large posterior rim fracture. III: a comminuted rim fracture. IV: an acetabular rim and floor fracture. V: a femoral-head fracture. Reports the injury type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.thompsonEpstein,
    fields: [
      { dom: 'te-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Thompson-Epstein type' },
    ],
  },
];
