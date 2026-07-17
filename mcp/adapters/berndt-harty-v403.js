// spec-v403 MCP wave: adapter for the Berndt-Harty classification of an osteochondral lesion of the talus
// in lib/berndt-harty-v403.js. The dom key mirrors the browser renderer (views/group-v403.js) and
// META['berndt-harty'].example. `stage` is an enum (I/II/III/IV). The compute reports the stage and its
// radiographic description. The example sets stage III; its expected text is the stage description (a roman
// numeral, no free numeric facts to round-trip), so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/berndt-harty-v403.js';

export default [
  {
    id: 'berndt-harty',
    summary: 'Berndt-Harty classification of an osteochondral lesion (transchondral fracture) of the talus, stages I/II/III/IV, by the radiographic stage of the fragment. I: small area of subchondral compression, the overlying cartilage intact. II: partially detached osteochondral fragment (incomplete separation). III: completely detached fragment remaining in the crater, without displacement (in situ). IV: displaced osteochondral fragment (a loose body). Reports the stage, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.berndtHarty,
    fields: [
      { dom: 'bh-stage', arg: 'stage', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Berndt-Harty stage' },
    ],
  },
];
