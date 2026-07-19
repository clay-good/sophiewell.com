// spec-v448 MCP wave: adapter for the Traynelis AOD classification in lib/traynelis-v448.js. The dom key
// mirrors the browser renderer (views/group-v448.js) and META['traynelis'].example. `type` is an enum
// (I/II/III). The compute reports the type and its displacement description. The example sets type II; its
// expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/traynelis-v448.js';

export default [
  {
    id: 'traynelis',
    summary: 'The Traynelis classification of traumatic atlanto-occipital dislocation (AOD), by the direction of occiput displacement relative to the atlas, types I/II/III. I: anterior displacement. II: longitudinal distraction (vertical separation). III: posterior displacement. Reports the imaging type, not a diagnosis, a stability determination, a treatment decision, or a prognosis.',
    compute: C.traynelis,
    fields: [
      { dom: 'traynelis-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'Traynelis type' },
    ],
  },
];
