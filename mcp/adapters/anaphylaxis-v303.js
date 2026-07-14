// spec-v303 MCP wave: adapter for the Ring & Messmer anaphylaxis severity grade
// in lib/anaphylaxis-v303.js. The single dom key mirrors the browser renderer
// (views/group-v303.js) and META['anaphylaxis-grade'].example. `grade` is a
// required enum over the 4 grades; the compute returns the grade's clinical
// features and the life-threatening flag (grades III-IV). The `band` carries the
// "grade III" example, so it round-trips through the default makeToArgs with no
// custom toArgs.

import * as A from '../../lib/anaphylaxis-v303.js';

export default [
  {
    id: 'anaphylaxis-grade',
    summary: 'Ring & Messmer (1977) anaphylaxis severity grade: given the grade (I-IV), reports the clinical features (I cutaneous-mucous only; II moderate multi-organ; III life-threatening collapse/bronchospasm; IV cardiac/respiratory arrest) and whether it is life-threatening (grades III-IV, managed as anaphylaxis). Reports the classification descriptor, not a diagnosis or a treatment order.',
    compute: A.anaphylaxisGrade,
    fields: [
      { dom: 'anp-grade', arg: 'grade', kind: 'enum', required: true, values: ['I', 'II', 'III', 'IV'], label: 'Ring & Messmer grade' },
    ],
  },
];
