// spec-v496 MCP wave: adapter for the Lodwick bone-lesion grading in lib/lodwick-grade-v496.js.
// The dom key mirrors the browser renderer (views/group-v496.js) and META['lodwick-grade'].example. `grade`
// is an enum (IA/IB/IC/II/III - bare I is deliberately absent because it is ambiguous across IA/IB/IC). The
// compute reports the grade and its margin / destruction-pattern description. The example sets grade IC; its
// expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/lodwick-grade-v496.js';

export default [
  {
    id: 'lodwick-grade',
    summary: 'The Lodwick grading of how aggressive a focal bone lesion looks on radiographs, read from the lesion margin and the pattern of bone destruction, grades IA / IB / IC / II / III. IA: geographic with a sclerotic margin. IB: geographic, well-defined, no sclerotic rim. IC: geographic with an ill-defined margin. II: geographic with moth-eaten or permeative areas. III: moth-eaten or permeative throughout. A higher grade indicates a faster-growing, more aggressive-appearing lesion, not a specific tumor. Reports the radiographic grade, not a diagnosis, a benign-or-malignant call, or a biopsy decision.',
    compute: C.lodwickGrade,
    fields: [
      { dom: 'lodwick-grade', arg: 'grade', kind: 'enum', values: ['IA', 'IB', 'IC', 'II', 'III'], label: 'Lodwick grade' },
    ],
  },
];
