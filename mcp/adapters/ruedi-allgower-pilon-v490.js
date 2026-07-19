// spec-v490 MCP wave: adapter for the Ruedi-Allgower pilon fracture classification in
// lib/ruedi-allgower-pilon-v490.js. The dom key mirrors the browser renderer (views/group-v490.js) and
// META['ruedi-allgower-pilon'].example. `type` is an enum (I/II/III). The compute reports the type and its
// displacement/comminution description. The example sets type II; its expected text carries no numeric facts
// (the description is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/ruedi-allgower-pilon-v490.js';

export default [
  {
    id: 'ruedi-allgower-pilon',
    summary: 'The Ruedi-Allgower classification of tibial pilon (plafond) fractures, by articular displacement and comminution, types I/II/III. I: nondisplaced cleavage fracture. II: significant displacement with minimal comminution. III: comminution and impaction of the articular surface. Reports the fracture type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.ruediAllgowerPilon,
    fields: [
      { dom: 'ruedi-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'Ruedi-Allgower type' },
    ],
  },
];
