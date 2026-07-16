// spec-v345 MCP wave: adapter for the Lichtman staging of Kienbock disease (lunate osteonecrosis) in
// lib/lichtman-kienbock-v345.js. The dom key mirrors the browser renderer (views/group-v345.js) and
// META['lichtman-kienbock'].example. `stage` is an enum (I / II / IIIA / IIIB / IV). The compute
// reports the Lichtman stage and its radiographic description. The example sets stage IIIB; its
// expected radioscaphoid angle (> 60 degrees) round-trips through the default makeToArgs with no
// custom toArgs (the result echoes the angle in the band text).

import * as C from '../../lib/lichtman-kienbock-v345.js';

export default [
  {
    id: 'lichtman-kienbock',
    summary: 'Lichtman staging (Lichtman 1977) of Kienbock disease (osteonecrosis of the carpal lunate) — the radiographic staging of lunate avascular necrosis. I: normal radiograph, lunate signal change on MRI. II: lunate sclerosis (increased density), shape preserved, no collapse. IIIA: lunate collapse and fragmentation with carpal alignment maintained (radioscaphoid angle < 60 degrees). IIIB: lunate collapse with fixed carpal collapse — scaphoid flexion and proximal capitate migration (radioscaphoid angle > 60 degrees). IV: advanced carpal collapse with generalized perilunate / radiocarpal degenerative arthrosis. The pre-collapse (I-II) vs collapse (IIIA-IV) distinction is the classic reconstruct-vs-salvage watershed. Reports the stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.lichtmanKienbock,
    fields: [
      { dom: 'lichtman-stage', arg: 'stage', kind: 'enum', values: ['I', 'II', 'IIIA', 'IIIB', 'IV'], label: 'Lichtman stage' },
    ],
  },
];
