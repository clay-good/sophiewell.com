// spec-v375 MCP wave: adapter for the Pipkin classification of a femoral head fracture in
// lib/pipkin-femoral-head-v375.js. The dom key mirrors the browser renderer (views/group-v375.js) and
// META['pipkin-femoral-head'].example. `type` is an enum (I/II/III/IV). The compute reports the Pipkin
// type and its description. The example sets type III; its expected text is the type description (a roman
// numeral, no numeric facts), so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/pipkin-femoral-head-v375.js';

export default [
  {
    id: 'pipkin-femoral-head',
    summary: 'Pipkin classification (Pipkin 1957) of a femoral HEAD fracture (types I-IV), which typically occurs with a posterior hip dislocation. I: a femoral head fracture caudad to (below) the fovea centralis; spares the main weight-bearing surface. II: cephalad to (above) the fovea centralis; involves the weight-bearing surface. III: a type I or II femoral head fracture with an associated femoral neck fracture. IV: a type I or II femoral head fracture with an associated acetabular fracture (most commonly the posterior wall). Types III and IV carry worse outcomes. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.pipkinFemoralHead,
    fields: [
      { dom: 'pipkin-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Pipkin type' },
    ],
  },
];
