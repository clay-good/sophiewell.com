// spec-v420 MCP wave: adapter for the Friedman tongue position in lib/friedman-tongue-v420.js. The dom key
// mirrors the browser renderer (views/group-v420.js) and META['friedman-tongue'].example. `grade` is an enum
// (I/II/III/IV). The compute reports the grade and its visualization description. The example sets grade II;
// its expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/friedman-tongue-v420.js';

export default [
  {
    id: 'friedman-tongue',
    summary: 'Friedman tongue position (FTP), the anatomical grade of what the observer can visualize of the oropharynx with the mouth open (no tongue protrusion), grades I/II/III/IV, used in obstructive-sleep-apnea staging. I: the entire uvula and the tonsils / pillars. II: the uvula but not the tonsils. III: the soft palate but not the uvula. IV: only the hard palate. One input to the Friedman OSA stage (with tonsil size and BMI), not the stage itself. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.friedmanTongue,
    fields: [
      { dom: 'ft-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Friedman tongue position' },
    ],
  },
];
