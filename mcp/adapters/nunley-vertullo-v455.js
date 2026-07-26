// spec-v455 MCP wave: adapter for the Nunley-Vertullo midfoot sprain classification in
// lib/nunley-vertullo-v455.js. The dom key mirrors the browser renderer (views/group-v455.js) and
// META['nunley-vertullo'].example. `stage` is an enum (I..III). The compute reports the stage and its
// radiograph description. The example sets stage II; its expected text carries the "1 to 5 mm" diastasis fact,
// so the default makeToArgs flows through with no custom toArgs.

import * as C from '../../lib/nunley-vertullo-v455.js';

export default [
  {
    id: 'nunley-vertullo',
    summary: 'The Nunley-Vertullo classification of athletic midfoot (Lisfranc) sprains, by weightbearing-radiograph diastasis and arch height, stages I/II/III. I: no diastasis or arch-height loss. II: 1 to 5 mm diastasis, no arch-height loss. III: more than 5 mm diastasis with arch-height loss. Reports the stage the clinician has determined, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.nunleyVertullo,
    fields: [
      { dom: 'nunley-stage', arg: 'stage', kind: 'enum', values: ['I', 'II', 'III'], label: 'Nunley-Vertullo stage' },
    ],
  },
];
