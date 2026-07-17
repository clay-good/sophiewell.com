// spec-v378 MCP wave: adapter for the Delbet (Delbet-Colonna) classification of a pediatric femoral neck
// fracture in lib/delbet-femoral-neck-v378.js. The dom key mirrors the browser renderer
// (views/group-v378.js) and META['delbet-femoral-neck'].example. `type` is an enum (I/II/III/IV). The
// compute reports the type and its anatomic description. The example sets type I; its expected text is
// the type description (a roman numeral, no numeric facts to round-trip), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/delbet-femoral-neck-v378.js';

export default [
  {
    id: 'delbet-femoral-neck',
    summary: 'Delbet (Delbet-Colonna) classification (Colonna 1929) of a pediatric femoral NECK / proximal femur fracture (types I-IV), by the anatomic level of the fracture line - the standard grading that stratifies the risk of avascular necrosis (AVN) of the femoral head, which falls from type I to type IV. I: transepiphyseal (separation of the proximal femoral epiphysis); the highest AVN risk and worst long-term outcomes. II: transcervical (through the mid femoral neck); the most common type, with a high AVN risk. III: cervicotrochanteric / basicervical (at the base of the neck); a lower AVN risk. IV: intertrochanteric (between the trochanters); the lowest AVN risk. Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.delbetFemoralNeck,
    fields: [
      { dom: 'delbet-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Delbet type' },
    ],
  },
];
