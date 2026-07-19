// spec-v463 MCP wave: adapter for the Waldenstrom Perthes staging in lib/waldenstrom-perthes-v463.js. The dom
// key mirrors the browser renderer (views/group-v463.js) and META['waldenstrom-perthes'].example. `stage` is
// an enum (I..IV). The compute reports the stage and its temporal radiographic description. The example sets
// stage II; its expected text carries no numeric facts (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/waldenstrom-perthes-v463.js';

export default [
  {
    id: 'waldenstrom-perthes',
    summary: 'The Waldenstrom radiographic staging of active Legg-Calve-Perthes disease, by the temporal appearance of the femoral epiphysis, stages I/II/III/IV. I: initial (sclerosis). II: fragmentation. III: reossification (healing). IV: healed (remodeling). Reports the radiographic stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.waldenstromPerthes,
    fields: [
      { dom: 'wp-stage', arg: 'stage', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Waldenstrom stage' },
    ],
  },
];
