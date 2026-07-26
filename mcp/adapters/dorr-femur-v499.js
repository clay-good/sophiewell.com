// spec-v499 MCP wave: adapter for the Dorr proximal-femoral-morphology classification in
// lib/dorr-femur-v499.js. The dom key mirrors the browser renderer (views/group-v499.js) and
// META['dorr-femur'].example. `type` is an enum (A/B/C). The compute reports the type and its cortical /
// canal description. The example sets type B; the ratio cut points in its expected text (0.5, 0.75) are
// carried by the result band, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/dorr-femur-v499.js';

export default [
  {
    id: 'dorr-femur',
    summary: 'The Dorr classification of proximal femoral bone morphology on a plain radiograph, from the cortical thickness and the canal-to-calcar ratio, types A / B / C. A: the champagne-flute femur, thick medial and posterior cortices and a narrow canal, ratio below 0.5. B: intermediate, ratio 0.5 to 0.75. C: the stovepipe femur, extensive cortical loss and a wide canal, ratio above 0.75. Reports the morphologic type the clinician has determined, not a diagnosis, a bone-quality or osteoporosis diagnosis, or a cemented-versus-cementless stem recommendation.',
    compute: C.dorrFemur,
    fields: [
      { dom: 'dorr-type', arg: 'type', kind: 'enum', values: ['A', 'B', 'C'], label: 'Dorr type' },
    ],
  },
];
