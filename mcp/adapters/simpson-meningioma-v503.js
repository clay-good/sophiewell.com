// spec-v503 MCP wave: adapter for the Simpson meningioma-resection grading in lib/simpson-meningioma-v503.js.
// The dom key mirrors the browser renderer (views/group-v503.js) and META['simpson-meningioma'].example.
// `grade` is an enum (I/II/III/IV/V). The compute reports the grade and its resection description. The example
// sets grade II; its expected text carries no numeric facts (the description is word-only), so it flows
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/simpson-meningioma-v503.js';

export default [
  {
    id: 'simpson-meningioma',
    summary: 'The Simpson grade of how complete a meningioma resection was, recorded by the surgeon at operation, grades I-V. I: macroscopically complete removal with excision of the dural attachment and abnormal bone. II: complete removal with coagulation of the dural attachment. III: complete removal without treating the dural attachment. IV: partial removal, tumor left in situ. V: simple decompression. Lower grades were associated with a lower reported recurrence rate. Reports the grade the surgeon has recorded and the general association Simpson reported, not a diagnosis, an individual recurrence prediction, or an adjuvant-radiotherapy decision.',
    compute: C.simpsonMeningioma,
    fields: [
      { dom: 'simpson-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Simpson grade' },
    ],
  },
];
