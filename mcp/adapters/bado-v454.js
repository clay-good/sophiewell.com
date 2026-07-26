// spec-v454 MCP wave: adapter for the Bado Monteggia fracture classification in lib/bado-v454.js. The dom key
// mirrors the browser renderer (views/group-v454.js) and META['bado'].example. `type` is an enum (I..IV). The
// compute reports the type and its dislocation/fracture description. The example sets type I; its expected
// text carries no numeric facts beyond the word-only description, so it flows through the default makeToArgs
// with no custom toArgs.

import * as C from '../../lib/bado-v454.js';

export default [
  {
    id: 'bado',
    summary: 'The Bado classification of Monteggia fractures, by the direction of radial-head dislocation and the ulnar fracture, types I/II/III/IV. I: anterior dislocation, anterior ulnar angulation (most common). II: posterior dislocation, posterior ulnar angulation. III: lateral dislocation with an ulnar metaphyseal fracture. IV: anterior dislocation with both-bone proximal-third fractures. Reports the fracture type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.bado,
    fields: [
      { dom: 'bado-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Bado type' },
    ],
  },
];
