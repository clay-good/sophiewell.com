// spec-v460 MCP wave: adapter for the Enneking surgical staging in lib/enneking-v460.js. The dom key mirrors
// the browser renderer (views/group-v460.js) and META['enneking'].example. `stage` is an enum
// (IA/IB/IIA/IIB/III). The compute reports the stage and its G/T/M combination. The example sets stage IIB;
// its expected text carries the G2/T2/M0 facts, so the default makeToArgs flows through with no custom toArgs.

import * as C from '../../lib/enneking-v460.js';

export default [
  {
    id: 'enneking',
    summary: 'The Enneking (MSTS) surgical staging of malignant musculoskeletal tumors, combining grade (G), compartment (T), and metastasis (M), stages IA/IB/IIA/IIB/III. IA: G1 T1 M0. IB: G1 T2 M0. IIA: G2 T1 M0. IIB: G2 T2 M0. III: any M1. Reports the surgical stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.enneking,
    fields: [
      { dom: 'enneking-stage', arg: 'stage', kind: 'enum', values: ['IA', 'IB', 'IIA', 'IIB', 'III'], label: 'Enneking stage' },
    ],
  },
];
