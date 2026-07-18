// spec-v411 MCP wave: adapter for the Levine-Edwards classification of hangman's fractures in
// lib/levine-edwards-v411.js. The dom key mirrors the browser renderer (views/group-v411.js) and
// META['levine-edwards'].example. `type` is an enum (I/II/IIa/III). The compute reports the type and its
// displacement/angulation description. The example sets type II; its expected text's digits are the "3 mm"
// translation threshold that the result echoes verbatim, so it flows through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/levine-edwards-v411.js';

export default [
  {
    id: 'levine-edwards',
    summary: 'Levine-Edwards classification of a traumatic spondylolisthesis of the axis (hangman\'s fracture, a bilateral C2 pars/pedicle fracture), types I/II/IIa/III, by translation and angulation. I: a fracture through the pars with less than 3 mm of translation and no significant angulation (stable). II: more than 3 mm of translation with significant angulation (unstable). IIa: minimal translation but severe angulation (flexion-distraction) - axial traction is contraindicated. III: a type I fracture plus bilateral C2-C3 facet dislocation (most severe). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.levineEdwards,
    fields: [
      { dom: 'le-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'IIa', 'III'], label: 'Levine-Edwards type' },
    ],
  },
];
