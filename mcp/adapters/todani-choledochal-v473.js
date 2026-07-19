// spec-v473 MCP wave: adapter for the Todani choledochal cyst classification in lib/todani-choledochal-v473.js.
// The dom key mirrors the browser renderer (views/group-v473.js) and META['todani-choledochal'].example.
// `type` is an enum (I..V). The compute reports the type and its location/shape description. The example sets
// type I; its expected text carries no numeric facts (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/todani-choledochal-v473.js';

export default [
  {
    id: 'todani-choledochal',
    summary: 'The Todani classification of choledochal (congenital bile duct) cysts, by location and shape, types I/II/III/IV/V. I: extrahepatic fusiform/cystic dilatation (most common). II: a true extrahepatic diverticulum. III: choledochocele (intraduodenal segment). IV: multiple cysts (IVa intra- and extrahepatic; IVb extrahepatic only). V: Caroli disease (intrahepatic only). Reports the anatomic type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.todaniCholedochal,
    fields: [
      { dom: 'todani-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Todani type' },
    ],
  },
];
