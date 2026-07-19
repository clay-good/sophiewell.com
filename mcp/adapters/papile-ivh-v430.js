// spec-v430 MCP wave: adapter for the Papile grade of germinal matrix / IVH in lib/papile-ivh-v430.js. The
// dom key mirrors the browser renderer (views/group-v430.js) and META['papile-ivh'].example. `grade` is an
// enum (I..IV). The compute reports the grade and its imaging description. The example sets grade III; its
// expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/papile-ivh-v430.js';

export default [
  {
    id: 'papile-ivh',
    summary: 'The Papile grading of germinal matrix / intraventricular hemorrhage (IVH) in the preterm newborn, by the extent of hemorrhage on cranial imaging, grades I/II/III/IV. I: confined to the germinal matrix (subependymal). II: IVH without ventricular dilatation. III: IVH with ventricular dilatation. IV: IVH with parenchymal extension. Reports the imaging grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.papileIvh,
    fields: [
      { dom: 'papile-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Papile grade' },
    ],
  },
];
