// spec-v492 MCP wave: adapter for the Hattrup-Johnson hallux rigidus grading in lib/hattrup-johnson-v492.js.
// The dom key mirrors the browser renderer (views/group-v492.js) and META['hattrup-johnson'].example. `grade`
// is an enum (I/II/III). The compute reports the grade and its osteophyte/joint-space description. The example
// sets grade II; its expected text carries no numeric facts (the description is word-only), so it flows through
// the default makeToArgs with no custom toArgs.

import * as C from '../../lib/hattrup-johnson-v492.js';

export default [
  {
    id: 'hattrup-johnson',
    summary: 'The Hattrup-Johnson classification of hallux rigidus (first MTP osteoarthritis), by radiographic osteophyte formation and joint-space change, grades I/II/III. I: mild (dorsal osteophyte, preserved joint space). II: moderate (dorsal/medial/lateral osteophytes with narrowing and sclerosis). III: severe (marked osteophytes with joint-space loss and subchondral cysts). Reports the radiographic grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.hattrupJohnson,
    fields: [
      { dom: 'hattrup-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III'], label: 'Hattrup-Johnson grade' },
    ],
  },
];
