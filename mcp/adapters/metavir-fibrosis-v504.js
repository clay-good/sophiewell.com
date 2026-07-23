// spec-v504 MCP wave: adapter for the METAVIR liver-fibrosis staging in lib/metavir-fibrosis-v504.js.
// The dom key mirrors the browser renderer (views/group-v504.js) and META['metavir-fibrosis'].example.
// `stage` is an enum (F0..F4). The compute reports the stage and its histologic description. The example sets
// stage F2; the only "numbers" in its expected text are the stage labels themselves, which the result band
// carries, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/metavir-fibrosis-v504.js';

export default [
  {
    id: 'metavir-fibrosis',
    summary: 'The METAVIR histologic staging of liver fibrosis on biopsy, stages F0-F4. F0: no fibrosis. F1: portal fibrosis without septa. F2: portal fibrosis with a few septa. F3: numerous septa without cirrhosis (bridging fibrosis). F4: cirrhosis. This is the stage read from the biopsy, distinct from the non-invasive serum estimates (FIB-4, NAFLD Fibrosis Score). METAVIR also grades necroinflammatory activity (A0-A3) separately; this reports the fibrosis stage the pathologist has assigned, not a diagnosis, a non-invasive substitute for biopsy, or a treatment decision.',
    compute: C.metavirFibrosis,
    fields: [
      { dom: 'metavir-stage', arg: 'stage', kind: 'enum', values: ['F0', 'F1', 'F2', 'F3', 'F4'], label: 'METAVIR fibrosis stage' },
    ],
  },
];
