// spec-v374 MCP wave: adapter for the Pauwels classification of a femoral neck fracture in
// lib/pauwels-femoral-neck-v374.js. The dom key mirrors the browser renderer (views/group-v374.js) and
// META['pauwels-femoral-neck'].example. `type` is an enum (I/II/III). The compute reports the Pauwels
// type and its angle/force description. The example sets type III; its expected number (50) is the angle
// threshold echoed in the band, so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/pauwels-femoral-neck-v374.js';

export default [
  {
    id: 'pauwels-femoral-neck',
    summary: 'Pauwels classification (Pauwels 1935) of a femoral neck fracture (types I-III), by the angle of the fracture line from the horizontal — the biomechanical grading of the compression-vs-shear balance, the shear-angle counterpart to the Garden classification (displacement). I: < 30 degrees, compressive forces dominate (the most stable pattern). II: 30-50 degrees, shear forces appear (intermediate). III: > 50 degrees, shear forces dominate, with the highest risk of nonunion and avascular necrosis. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.pauwelsFemoralNeck,
    fields: [
      { dom: 'pauwels-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'Pauwels type' },
    ],
  },
];
