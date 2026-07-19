// spec-v485 MCP wave: adapter for the Dejour trochlear dysplasia classification in lib/dejour-trochlea-v485.js.
// The dom key mirrors the browser renderer (views/group-v485.js) and META['dejour-trochlea'].example. `type` is
// an enum (A/B/C/D). The compute reports the type and its trochlear-morphology description. The example sets
// type B; its expected text carries no numeric facts (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/dejour-trochlea-v485.js';

export default [
  {
    id: 'dejour-trochlea',
    summary: 'The Dejour classification of trochlear dysplasia, by the radiographic / CT appearance of the femoral trochlea, types A/B/C/D. A: shallow but symmetric (low-grade). B: flat or convex with a supratrochlear spur (high-grade). C: facet asymmetry (double contour) without a spur (high-grade). D: asymmetry plus a spur with a facet cliff (high-grade). Reports the imaging type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.dejourTrochlea,
    fields: [
      { dom: 'dejour-type', arg: 'type', kind: 'enum', values: ['A', 'B', 'C', 'D'], label: 'Dejour type' },
    ],
  },
];
