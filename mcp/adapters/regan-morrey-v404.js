// spec-v404 MCP wave: adapter for the Regan-Morrey classification of coronoid process fractures in
// lib/regan-morrey-v404.js. The dom key mirrors the browser renderer (views/group-v404.js) and
// META['regan-morrey'].example. `type` is an enum (I/II/III). The compute reports the type and its height
// description. The example sets type II; its expected text's only digits are the "50%" threshold that the
// result echoes verbatim, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/regan-morrey-v404.js';

export default [
  {
    id: 'regan-morrey',
    summary: 'Regan-Morrey classification of a coronoid process fracture of the ulna, types I/II/III, by the height of the fragment - the companion to the Mason radial-head classification (both are terrible-triad elbow components). I: avulsion fracture of the tip of the coronoid process. II: fracture involving 50% or less of the coronoid height. III: fracture involving more than 50% of the coronoid height. Each type is subdivided A (no elbow dislocation) or B (with dislocation). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.reganMorrey,
    fields: [
      { dom: 'rm-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'Regan-Morrey type' },
    ],
  },
];
