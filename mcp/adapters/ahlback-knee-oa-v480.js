// spec-v480 MCP wave: adapter for the Ahlback knee osteoarthritis grading in lib/ahlback-knee-oa-v480.js. The
// dom key mirrors the browser renderer (views/group-v480.js) and META['ahlback-knee-oa'].example. `grade` is an
// enum (I..V). The compute reports the grade and its joint-space/attrition description. The example sets grade
// III; its expected text carries the "0 to 5 mm" fact, so the default makeToArgs flows through with no custom
// toArgs.

import * as C from '../../lib/ahlback-knee-oa-v480.js';

export default [
  {
    id: 'ahlback-knee-oa',
    summary: 'The Ahlback classification of knee osteoarthritis, by radiographic joint-space loss and bone attrition, grades I/II/III/IV/V. I: joint-space narrowing. II: joint-space obliteration (bone-to-bone). III: minor bone attrition (0-5 mm). IV: moderate bone attrition (5-10 mm). V: severe bone attrition (>10 mm), often with subluxation. Reports the radiographic grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.ahlbackKneeOa,
    fields: [
      { dom: 'ahlback-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Ahlback grade' },
    ],
  },
];
