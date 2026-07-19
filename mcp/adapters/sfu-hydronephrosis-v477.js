// spec-v477 MCP wave: adapter for the SFU hydronephrosis grading in lib/sfu-hydronephrosis-v477.js. The dom key
// mirrors the browser renderer (views/group-v477.js) and META['sfu-hydronephrosis'].example. `grade` is an enum
// (0-4). The compute reports the grade and its dilatation description. The example sets grade 2; its expected
// text carries no numeric facts beyond the word-only description, so it flows through the default makeToArgs
// with no custom toArgs.

import * as C from '../../lib/sfu-hydronephrosis-v477.js';

export default [
  {
    id: 'sfu-hydronephrosis',
    summary: 'The Society for Fetal Urology (SFU) ultrasound grading of hydronephrosis, by renal-sinus and calyceal dilatation and parenchymal thinning, grades 0-4. 0: intact central renal complex. 1: renal pelvis only. 2: pelvis and a few calyces. 3: pelvis and all calyces uniformly dilated (normal parenchyma). 4: as grade 3 plus parenchymal thinning. Reports the ultrasound grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.sfuHydronephrosis,
    fields: [
      { dom: 'sfu-grade', arg: 'grade', kind: 'enum', values: ['0', '1', '2', '3', '4'], label: 'SFU grade' },
    ],
  },
];
