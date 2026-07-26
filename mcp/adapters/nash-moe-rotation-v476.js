// spec-v476 MCP wave: adapter for the Nash-Moe vertebral rotation grading in lib/nash-moe-rotation-v476.js. The
// dom key mirrors the browser renderer (views/group-v476.js) and META['nash-moe-rotation'].example. `grade` is
// an enum (0-4). The compute reports the grade and its pedicle-position description. The example sets grade 2;
// its expected text carries no numeric facts beyond the word-only description, so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/nash-moe-rotation-v476.js';

export default [
  {
    id: 'nash-moe-rotation',
    summary: 'The Nash-Moe method of grading vertebral rotation in scoliosis, by the position of the convex-side pedicle on the AP radiograph, grades 0-4. 0: symmetric pedicles (no rotation). 1: convex pedicle slightly toward the midline. 2: convex pedicle in the middle third. 3: convex pedicle central, near the midline. 4: convex pedicle past the midline. Reports the rotation grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.nashMoeRotation,
    fields: [
      { dom: 'nash-moe-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'Nash-Moe grade' },
    ],
  },
];
