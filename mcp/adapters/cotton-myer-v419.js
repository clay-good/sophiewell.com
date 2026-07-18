// spec-v419 MCP wave: adapter for the Myer-Cotton grading of subglottic stenosis in
// lib/cotton-myer-v419.js. The dom key mirrors the browser renderer (views/group-v419.js) and
// META['cotton-myer'].example. `grade` is an enum (I/II/III/IV). The compute reports the grade and its
// percent-obstruction description. The example sets grade II; its expected text's digits are the 51%/70%
// band bounds that the result echoes verbatim, so it flows through the default makeToArgs with no custom
// toArgs.

import * as C from '../../lib/cotton-myer-v419.js';

export default [
  {
    id: 'cotton-myer',
    summary: 'Myer-Cotton (Cotton-Myer) grading of subglottic stenosis by the percent obstruction of the subglottic airway lumen, grades I/II/III/IV. I: 0% to 50% obstruction. II: 51% to 70%. III: 71% to 99%. IV: no detectable lumen (complete obstruction). Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.cottonMyer,
    fields: [
      { dom: 'cm-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Cotton-Myer grade' },
    ],
  },
];
