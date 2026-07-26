// spec-v489 MCP wave: adapter for the Fernandez distal radius fracture classification in
// lib/fernandez-radius-v489.js. The dom key mirrors the browser renderer (views/group-v489.js) and
// META['fernandez-radius'].example. `type` is an enum (I..V). The compute reports the type and its mechanism
// description. The example sets type I; its expected text carries no numeric facts (the description is
// word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/fernandez-radius-v489.js';

export default [
  {
    id: 'fernandez-radius',
    summary: 'The Fernandez classification of distal radius fractures, by the mechanism of injury, types I/II/III/IV/V. I: bending (Colles/Smith). II: shearing (Barton, radial styloid). III: compression (die-punch). IV: avulsion / radiocarpal fracture-dislocation. V: combined, high-velocity. Complements the Frykman fracture-line pattern. Reports the fracture type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.fernandezRadius,
    fields: [
      { dom: 'fernandez-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Fernandez type' },
    ],
  },
];
