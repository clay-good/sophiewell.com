// spec-v363 MCP wave: adapter for the Shaffer gonioscopy angle grade in lib/shaffer-angle-v363.js. The
// dom key mirrors the browser renderer (views/group-v363.js) and META['shaffer-angle'].example. `grade`
// is an enum (0-4). The compute reports the Shaffer grade and its angle-width description. The example
// sets grade 1; its expected number (1, and the ~10 degrees) round-trips through the default makeToArgs
// with no custom toArgs.

import * as C from '../../lib/shaffer-angle-v363.js';

export default [
  {
    id: 'shaffer-angle',
    summary: 'Shaffer gonioscopy grading (Shaffer 1960) of the anterior chamber (drainage) angle (grades 0-4) — used to gauge the risk of angle-closure glaucoma. A HIGHER grade is a WIDER, safer angle. 4: wide open (~35-45 degrees), incapable of closure. 3: open (~20-35 degrees), incapable of closure. 2: moderately narrow (~20 degrees), angle closure possible. 1: very narrow (~10 degrees), angle closure probable. 0: closed. Grades 0-2 are narrow angles at angle-closure risk; grades 3-4 are open. Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.shafferAngle,
    fields: [
      { dom: 'shaffer-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'Shaffer grade' },
    ],
  },
];
