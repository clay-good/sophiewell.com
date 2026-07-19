// spec-v436 MCP wave: adapter for the Biffl BCVI grade in lib/biffl-bcvi-v436.js. The dom key mirrors the
// browser renderer (views/group-v436.js) and META['biffl-bcvi'].example. `grade` is an enum (I..V). The
// compute reports the grade and its angiographic description. The example sets grade III; its expected text
// carries no numeric facts (the description is word-only), so it flows through the default makeToArgs with no
// custom toArgs.

import * as C from '../../lib/biffl-bcvi-v436.js';

export default [
  {
    id: 'biffl-bcvi',
    summary: 'The Biffl (Denver) grading scale for blunt cerebrovascular injury (BCVI), by the angiographic appearance of the carotid or vertebral artery injury, grades I/II/III/IV/V. I: irregularity/dissection <25% narrowing. II: dissection/hematoma >=25% narrowing, thrombus, or raised intimal flap. III: pseudoaneurysm. IV: occlusion. V: transection with free extravasation. Reports the injury grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.bifflBcvi,
    fields: [
      { dom: 'biffl-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Biffl BCVI grade' },
    ],
  },
];
