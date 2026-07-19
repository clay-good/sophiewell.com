// spec-v451 MCP wave: adapter for the Sade tympanic-membrane retraction grade in
// lib/sade-retraction-v451.js. The dom key mirrors the browser renderer (views/group-v451.js) and
// META['sade-retraction'].example. `grade` is an enum (I..IV). The compute reports the grade and its otoscopy
// description. The example sets grade III; its expected text carries no numeric facts (the description is
// word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/sade-retraction-v451.js';

export default [
  {
    id: 'sade-retraction',
    summary: 'The Sade classification of pars tensa tympanic-membrane retraction, by the depth of the retraction pocket on otoscopy, grades I/II/III/IV. I: mild, not touching the incus. II: touching the incus or stapes. III: touching the promontory (atelectasis) but not adherent. IV: adherent to the promontory (adhesive otitis media). Reports the otoscopy grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.sadeRetraction,
    fields: [
      { dom: 'sade-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Sade grade' },
    ],
  },
];
