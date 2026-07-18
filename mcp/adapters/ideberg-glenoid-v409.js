// spec-v409 MCP wave: adapter for the Ideberg classification of glenoid-fossa fractures in
// lib/ideberg-glenoid-v409.js. The dom key mirrors the browser renderer (views/group-v409.js) and
// META['ideberg-glenoid'].example. `type` is an enum (I/II/III/IV/V/VI). The compute reports the type and
// its exit-border description. The example sets type II; its expected text is the type description (a roman
// numeral, no free numeric facts to round-trip), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/ideberg-glenoid-v409.js';

export default [
  {
    id: 'ideberg-glenoid',
    summary: 'Ideberg classification of an intra-articular glenoid-fossa fracture, types I/II/III/IV/V/VI, by which scapular border the fracture line exits. I: glenoid rim fracture (Ia anterior, Ib posterior). II: exits the lateral (axillary) border, with an inferior triangular fragment. III: exits the superior border (often with the coracoid / acromion). IV: exits the medial (vertebral) border, through the body. V: a combination of types II/III/IV. VI: a severely comminuted glenoid fracture (Goss). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.idebergGlenoid,
    fields: [
      { dom: 'idb-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V', 'VI'], label: 'Ideberg type' },
    ],
  },
];
