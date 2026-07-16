// spec-v344 MCP wave: adapter for the Ficat-Arlet staging of femoral-head osteonecrosis (AVN) in
// lib/ficat-arlet-v344.js. The dom key mirrors the browser renderer (views/group-v344.js) and
// META['ficat-arlet'].example. `stage` is an enum (0 / I / II / III / IV). The compute reports the
// Ficat-Arlet stage and its radiographic description. The example sets stage III; its expected text
// is the stage description with no numeric facts (the stage is a roman numeral), so it round-trips
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/ficat-arlet-v344.js';

export default [
  {
    id: 'ficat-arlet',
    summary: 'Ficat-Arlet staging (Ficat 1985; Ficat & Arlet 1980) of osteonecrosis (avascular necrosis) of the femoral head — the radiographic staging of hip osteonecrosis. 0: silent hip, pre-clinical and pre-radiographic, normal X-ray. I: pre-radiographic, normal X-ray but abnormal MRI / bone scan. II: pre-collapse, X-ray shows sclerosis and/or subchondral cysts with the femoral-head sphericity preserved (IIA cysts, IIB crescent sign). III: subchondral collapse (crescent sign) with femoral-head flattening / loss of sphericity, joint space preserved. IV: secondary osteoarthritis with joint-space narrowing and acetabular changes. The pre-collapse (0-II) vs post-collapse (III-IV) distinction is the classic joint-preservation-vs-replacement watershed. Reports the stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.ficatArlet,
    fields: [
      { dom: 'ficat-stage', arg: 'stage', kind: 'enum', values: ['0', 'I', 'II', 'III', 'IV'], label: 'Ficat-Arlet stage' },
    ],
  },
];
