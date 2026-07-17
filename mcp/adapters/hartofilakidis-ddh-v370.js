// spec-v370 MCP wave: adapter for the Hartofilakidis classification of adult DDH in
// lib/hartofilakidis-ddh-v370.js. The dom key mirrors the browser renderer (views/group-v370.js) and
// META['hartofilakidis-ddh'].example. `type` is an enum (A/B/C). The compute reports the Hartofilakidis
// type and its description. The example sets type B; its expected text is the type description (a
// letter, no numeric facts), so it round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/hartofilakidis-ddh-v370.js';

export default [
  {
    id: 'hartofilakidis-ddh',
    summary: 'Hartofilakidis classification (Hartofilakidis 1988) of adult developmental dysplasia of the hip (types A/B/C) — the second widely used adult-DDH classification alongside Crowe, grading the hip by the relationship of the femoral head to the true acetabulum. A: dysplasia (the femoral head is within the true acetabulum despite subluxation, with segmental superior-wall deficiency). B: low dislocation (the false acetabulum partially overlaps the true acetabulum, with complete absence of the superior wall). C: high dislocation (the false acetabulum has no connection with the true one; the head has migrated superiorly and posteriorly and is completely uncovered). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.hartofilakidisDdh,
    fields: [
      { dom: 'hart-type', arg: 'type', kind: 'enum', values: ['A', 'B', 'C'], label: 'Hartofilakidis type' },
    ],
  },
];
