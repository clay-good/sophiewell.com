// spec-v483 MCP wave: adapter for the Vancouver periprosthetic femoral fracture classification in
// lib/vancouver-periprosthetic-v483.js. The dom key mirrors the browser renderer (views/group-v483.js) and
// META['vancouver-periprosthetic'].example. `type` is an enum (AG/AL/B1/B2/B3/C). The compute reports the type
// and its location/stem-stability description. The example sets type B2; its expected text carries no numeric
// facts (the description is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/vancouver-periprosthetic-v483.js';

export default [
  {
    id: 'vancouver-periprosthetic',
    summary: 'The Vancouver classification of periprosthetic femoral fractures after hip replacement, by location, stem stability, and bone stock, types AG/AL/B1/B2/B3/C. AG/AL: trochanteric. B1: around the stem, stem well-fixed. B2: around the stem, stem loose, adequate bone. B3: around the stem, stem loose, deficient bone. C: well below the stem tip. Reports the fracture type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.vancouverPeriprosthetic,
    fields: [
      { dom: 'vancouver-type', arg: 'type', kind: 'enum', values: ['AG', 'AL', 'B1', 'B2', 'B3', 'C'], label: 'Vancouver type' },
    ],
  },
];
