// spec-v465 MCP wave: adapter for the Stamey stress-incontinence grading in lib/stamey-incontinence-v465.js.
// The dom key mirrors the browser renderer (views/group-v465.js) and META['stamey-incontinence'].example.
// `grade` is an enum (1/2/3). The compute reports the grade and its provoking-stress description. The example
// sets grade 2; its expected text carries no numeric facts beyond the word-only description, so it flows
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/stamey-incontinence-v465.js';

export default [
  {
    id: 'stamey-incontinence',
    summary: 'The Stamey grading of stress urinary incontinence, by the degree of physical stress that provokes leakage, grades 1/2/3. 1: sudden increases in abdominal pressure (cough, sneeze, laugh), not at night. 2: lesser stress (walking, standing, sitting up). 3: total, continuous incontinence regardless of activity or position. Reports the severity grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.stameyIncontinence,
    fields: [
      { dom: 'stamey-grade', arg: 'grade', kind: 'enum', values: ['1', '2', '3'], label: 'Stamey grade' },
    ],
  },
];
