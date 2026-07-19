// spec-v444 MCP wave: adapter for the McCormick spinal-cord function grade in lib/mccormick-v444.js. The dom
// key mirrors the browser renderer (views/group-v444.js) and META['mccormick'].example. `grade` is an enum
// (I..IV). The compute reports the grade and its functional description. The example sets grade II; its
// expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/mccormick-v444.js';

export default [
  {
    id: 'mccormick',
    summary: 'The McCormick neurological grading scale for spinal-cord (intramedullary) lesion function, by the motor / sensory deficit and ambulation, grades I/II/III/IV. I: intact or mild deficit, normal gait. II: deficit affecting the involved limb but functions and ambulates independently. III: needs a cane or brace, or significant bilateral upper-limb impairment. IV: severe, needs a wheelchair, usually not independent. Reports the functional grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.mccormick,
    fields: [
      { dom: 'mccormick-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'McCormick grade' },
    ],
  },
];
