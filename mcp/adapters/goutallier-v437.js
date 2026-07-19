// spec-v437 MCP wave: adapter for the Goutallier grade in lib/goutallier-v437.js. The dom key mirrors the
// browser renderer (views/group-v437.js) and META['goutallier'].example. `grade` is an enum (0-4). The
// compute reports the grade and its fat-vs-muscle description. The example sets grade 2; its expected text
// carries no numeric facts beyond the grade label (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/goutallier-v437.js';

export default [
  {
    id: 'goutallier',
    summary: 'The Goutallier classification of rotator cuff muscle fatty infiltration on CT/MRI, by the amount of fat relative to muscle in the cuff belly, grades 0/1/2/3/4. 0: normal, no fatty streaks. 1: some fatty streaks. 2: less fat than muscle. 3: fat equals muscle. 4: more fat than muscle. Reports the imaging grade, not a diagnosis, a reparability or treatment decision, or a prognosis.',
    compute: C.goutallier,
    fields: [
      { dom: 'goutallier-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'Goutallier grade' },
    ],
  },
];
