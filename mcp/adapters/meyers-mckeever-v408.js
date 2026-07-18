// spec-v408 MCP wave: adapter for the Meyers-McKeever classification of tibial eminence fractures in
// lib/meyers-mckeever-v408.js. The dom key mirrors the browser renderer (views/group-v408.js) and
// META['meyers-mckeever'].example. `type` is an enum (I/II/III/IV). The compute reports the type and its
// displacement description. The example sets type II; its expected text is the type description (a roman
// numeral, no free numeric facts to round-trip), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/meyers-mckeever-v408.js';

export default [
  {
    id: 'meyers-mckeever',
    summary: 'Meyers-McKeever classification of a tibial intercondylar-eminence fracture (the bony ACL avulsion off the tibia), types I/II/III/IV, by fragment displacement. I: a minimally displaced or non-displaced fragment. II: the anterior third to half elevated, producing a beak (hinged posteriorly). III: the fragment completely separated / displaced from its bed, no bony apposition. IV: a comminuted fragment (Zaricznyj modification). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.meyersMckeever,
    fields: [
      { dom: 'mm-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Meyers-McKeever type' },
    ],
  },
];
