// spec-v441 MCP wave: adapter for the Borden DAVF classification in lib/borden-davf-v441.js. The dom key
// mirrors the browser renderer (views/group-v441.js) and META['borden-davf'].example. `type` is an enum
// (I/II/III). The compute reports the type and its venous-drainage description. The example sets type II; its
// expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/borden-davf-v441.js';

export default [
  {
    id: 'borden-davf',
    summary: 'The Borden classification of a dural arteriovenous fistula (DAVF), by the pattern of venous drainage, types I/II/III. I: dural sinus / meningeal vein, antegrade flow, no cortical venous drainage (benign). II: dural sinus with retrograde cortical venous reflux. III: cortical venous drainage only (aggressive). The key discriminator is cortical venous drainage (II/III). Reports the type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.bordenDavf,
    fields: [
      { dom: 'borden-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'Borden type' },
    ],
  },
];
