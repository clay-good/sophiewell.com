// spec-v482 MCP wave: adapter for the Russell-Taylor subtrochanteric fracture classification in
// lib/russell-taylor-subtroch-v482.js. The dom key mirrors the browser renderer (views/group-v482.js) and
// META['russell-taylor-subtroch'].example. `type` is an enum (IA/IB/IIA/IIB). The compute reports the type and
// its piriformis/lesser-trochanter description. The example sets type IA; its expected text carries no numeric
// facts (the description is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/russell-taylor-subtroch-v482.js';

export default [
  {
    id: 'russell-taylor-subtroch',
    summary: 'The Russell-Taylor classification of subtrochanteric femur fractures, by piriformis-fossa involvement (type I intact, type II involved) and lesser-trochanter status (A attached, B detached), types IA/IB/IIA/IIB. Devised to guide intramedullary nail selection. Reports the fracture type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.russellTaylorSubtroch,
    fields: [
      { dom: 'rt-type', arg: 'type', kind: 'enum', values: ['IA', 'IB', 'IIA', 'IIB'], label: 'Russell-Taylor type' },
    ],
  },
];
