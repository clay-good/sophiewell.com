// spec-v462 MCP wave: adapter for the GMFCS cerebral-palsy classification in lib/gmfcs-v462.js. The dom key
// mirrors the browser renderer (views/group-v462.js) and META['gmfcs'].example. `level` is an enum (I..V). The
// compute reports the level and its mobility description. The example sets level III; its expected text carries
// no numeric facts (the description is word-only), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/gmfcs-v462.js';

export default [
  {
    id: 'gmfcs',
    summary: 'The Gross Motor Function Classification System (GMFCS) for cerebral palsy, by self-initiated movement, levels I/II/III/IV/V. I: walks without limitations. II: walks with limitations. III: walks using a hand-held mobility device. IV: self-mobility with limitations, may use powered mobility. V: transported in a manual wheelchair. Reports the functional level, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.gmfcs,
    fields: [
      { dom: 'gmfcs-level', arg: 'level', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'GMFCS level' },
    ],
  },
];
