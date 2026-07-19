// spec-v428 MCP wave: adapter for the MRC muscle-power grade in lib/mrc-power-v428.js. The dom key mirrors
// the browser renderer (views/group-v428.js) and META['mrc-power'].example. `grade` is an enum (0-5). The
// compute reports the grade and its examination description. The example sets grade 3; its expected text
// carries no numeric facts beyond the grade label (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/mrc-power-v428.js';

export default [
  {
    id: 'mrc-power',
    summary: 'The Medical Research Council (MRC) muscle-power grade, the standard 0-5 bedside grading of the strength of a single muscle or movement. 0: no contraction. 1: a flicker or trace. 2: active movement with gravity eliminated. 3: against gravity. 4: against gravity and resistance. 5: normal power. It is the unit the MRC sum score aggregates. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.mrcPower,
    fields: [
      { dom: 'mrc-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], label: 'MRC muscle-power grade' },
    ],
  },
];
