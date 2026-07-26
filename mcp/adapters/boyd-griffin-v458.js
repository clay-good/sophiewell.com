// spec-v458 MCP wave: adapter for the Boyd-Griffin trochanteric fracture classification in
// lib/boyd-griffin-v458.js. The dom key mirrors the browser renderer (views/group-v458.js) and
// META['boyd-griffin'].example. `type` is an enum (I..IV). The compute reports the type and its fracture-line
// description. The example sets type II; its expected text carries no numeric facts (the description is
// word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/boyd-griffin-v458.js';

export default [
  {
    id: 'boyd-griffin',
    summary: 'The Boyd-Griffin classification of trochanteric (intertrochanteric) femur fractures, by fracture line and comminution, types I/II/III/IV. I: simple intertrochanteric, undisplaced. II: comminuted intertrochanteric with secondary cortical lines. III: essentially subtrochanteric. IV: trochanteric region plus proximal shaft in at least two planes. Reports the fracture type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.boydGriffin,
    fields: [
      { dom: 'boyd-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Boyd-Griffin type' },
    ],
  },
];
