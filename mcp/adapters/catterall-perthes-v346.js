// spec-v346 MCP wave: adapter for the Catterall classification of Legg-Calve-Perthes disease in
// lib/catterall-perthes-v346.js. The dom key mirrors the browser renderer (views/group-v346.js) and
// META['catterall-perthes'].example. `group` is an enum (I / II / III / IV). The compute reports the
// Catterall group and its epiphyseal-involvement description. The example sets group III; its
// expected text is the group description with no numeric facts (the group is a roman numeral), so it
// round-trips through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/catterall-perthes-v346.js';

export default [
  {
    id: 'catterall-perthes',
    summary: 'Catterall classification (Catterall 1971) of Legg-Calve-Perthes disease — grades the childhood osteonecrosis of the femoral head by how much of the capital femoral epiphysis is involved at fragmentation. I: only the anterior epiphysis, no sequestrum; the best prognosis. II: anterior and central epiphysis with a sequestrum; the medial and lateral pillars are preserved. III: most of the epiphysis, only a small medial and lateral part uninvolved (the "head within a head" appearance). IV: the entire epiphysis. More extensive involvement (III-IV) classically carries a worse prognosis; the head-at-risk signs are separate modifiers. Reports the group, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.catterallPerthes,
    fields: [
      { dom: 'catterall-group', arg: 'group', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Catterall group' },
    ],
  },
];
