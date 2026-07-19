// spec-v432 MCP wave: adapter for the Baden-Walker prolapse grade in lib/baden-walker-v432.js. The dom key
// mirrors the browser renderer (views/group-v432.js) and META['baden-walker'].example. `grade` is an enum
// (0-4). The compute reports the grade and its examination description. The example sets grade 2; its expected
// text carries no numeric facts beyond the grade label (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/baden-walker-v432.js';

export default [
  {
    id: 'baden-walker',
    summary: 'The Baden-Walker halfway system for grading pelvic organ prolapse, by the position of the leading edge relative to the hymen at maximum strain, grades 0/1/2/3/4. 0: normal position. 1: halfway to the hymen. 2: to the hymen. 3: halfway past the hymen. 4: maximum descent (complete prolapse / procidentia). Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.badenWalker,
    fields: [
      { dom: 'bw-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'Baden-Walker grade' },
    ],
  },
];
