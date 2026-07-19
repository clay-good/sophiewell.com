// spec-v470 MCP wave: adapter for the Larsen RA radiographic grading in lib/larsen-ra-v470.js. The dom key
// mirrors the browser renderer (views/group-v470.js) and META['larsen-ra'].example. `grade` is an enum (0-5).
// The compute reports the grade and its radiographic-damage description. The example sets grade 2; its expected
// text carries no numeric facts beyond the word-only description, so it flows through the default makeToArgs
// with no custom toArgs.

import * as C from '../../lib/larsen-ra-v470.js';

export default [
  {
    id: 'larsen-ra',
    summary: 'The Larsen (Larsen-Dale-Eek) radiographic grading of joint damage in rheumatoid arthritis, by erosion and joint-space change, grades 0-5. 0: normal. 1: slight (swelling, osteoporosis, slight narrowing). 2: definite early (erosion and narrowing). 3: medium destructive (marked erosions). 4: severe destructive (gross deformity). 5: mutilating (articular surfaces lost). Reports the radiographic grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.larsenRa,
    fields: [
      { dom: 'larsen-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4', '5'], label: 'Larsen grade' },
    ],
  },
];
