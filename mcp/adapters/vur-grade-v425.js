// spec-v425 MCP wave: adapter for the vesicoureteral reflux grade in lib/vur-grade-v425.js. The dom key
// mirrors the browser renderer (views/group-v425.js) and META['vur-grade'].example. `grade` is an enum
// (I..V). The compute reports the grade and its imaging description. The example sets grade III; its expected
// text carries no numeric facts (the description is word-only), so it flows through the default makeToArgs
// with no custom toArgs.

import * as C from '../../lib/vur-grade-v425.js';

export default [
  {
    id: 'vur-grade',
    summary: 'International Reflux Study grading of vesicoureteral reflux (VUR) on a voiding cystourethrogram (VCUG), by the extent of reflux and the degree of ureteral/pelvicalyceal dilatation, grades I/II/III/IV/V. I: ureter only. II: up to the pelvis, no dilatation. III: mild to moderate dilatation. IV: moderate dilatation and tortuosity, fornices obliterated. V: gross dilatation and tortuosity, intrarenal reflux. Reports the imaging grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.vurGrade,
    fields: [
      { dom: 'vur-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Vesicoureteral reflux grade' },
    ],
  },
];
