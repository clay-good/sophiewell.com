// spec-v456 MCP wave: adapter for the Leddy-Packer FDP avulsion classification in lib/leddy-packer-v456.js.
// The dom key mirrors the browser renderer (views/group-v456.js) and META['leddy-packer'].example. `type` is
// an enum (I..III). The compute reports the type and its retraction/fragment description. The example sets
// type II; its expected text carries no numeric facts (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/leddy-packer-v456.js';

export default [
  {
    id: 'leddy-packer',
    summary: 'The Leddy-Packer classification of flexor digitorum profundus (FDP) avulsion — "jersey finger" — by the level of tendon retraction and any bony fragment, types I/II/III. I: retraction into the palm (blood supply lost, most time-critical). II: retraction to the PIP joint, held by the vinculum longus (most common). III: a large bony fragment caught at the A4 pulley. Reports the injury type, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.leddyPacker,
    fields: [
      { dom: 'leddy-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III'], label: 'Leddy-Packer type' },
    ],
  },
];
