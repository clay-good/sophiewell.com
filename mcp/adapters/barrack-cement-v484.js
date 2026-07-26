// spec-v484 MCP wave: adapter for the Barrack cement mantle grading in lib/barrack-cement-v484.js. The dom key
// mirrors the browser renderer (views/group-v484.js) and META['barrack-cement'].example. `grade` is an enum
// (A/B/C/D). The compute reports the grade and its cement-mantle-quality description. The example sets grade C;
// its expected text carries the "50% to 99%" fact, so the default makeToArgs flows through with no custom
// toArgs.

import * as C from '../../lib/barrack-cement-v484.js';

export default [
  {
    id: 'barrack-cement',
    summary: 'The Barrack classification of the cement mantle around a cemented femoral stem, by the quality of cementing on the immediate postoperative radiograph, grades A/B/C/D. A: complete filling ("white-out"). B: slight radiolucency, nearly complete filling. C: radiolucency over 50-99% of the interface, or a mantle defect. D: radiolucency over 100%, or an unfilled canal. Reports the radiographic grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.barrackCement,
    fields: [
      { dom: 'barrack-grade', arg: 'grade', kind: 'enum', values: ['A', 'B', 'C', 'D'], label: 'Barrack grade' },
    ],
  },
];
