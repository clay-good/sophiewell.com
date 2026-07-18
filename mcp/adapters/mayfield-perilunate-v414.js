// spec-v414 MCP wave: adapter for the Mayfield classification of progressive perilunar instability in
// lib/mayfield-perilunate-v414.js. The dom key mirrors the browser renderer (views/group-v414.js) and
// META['mayfield-perilunate'].example. `stage` is an enum (I/II/III/IV). The compute reports the stage and
// its ligament-disruption description. The example sets stage III; its expected text carries no numeric
// facts (the stage description is word-only), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/mayfield-perilunate-v414.js';

export default [
  {
    id: 'mayfield-perilunate',
    summary: 'Mayfield classification of progressive perilunar (perilunate) instability, stages I/II/III/IV, by how far the ligamentous disruption has progressed around the lunate. I: scapholunate dissociation. II: perilunate dislocation (capitolunate). III: midcarpal dislocation (lunotriquetral). IV: lunate dislocation (dorsal radiocarpal; the lunate is extruded volarly). Each stage adds the prior disruptions. Reports the stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.mayfieldPerilunate,
    fields: [
      { dom: 'mf-stage', arg: 'stage', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Mayfield stage' },
    ],
  },
];
