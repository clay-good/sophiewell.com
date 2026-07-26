// spec-v467 MCP wave: adapter for the Bromage neuraxial motor-block scale in lib/bromage-scale-v467.js. The
// dom key mirrors the browser renderer (views/group-v467.js) and META['bromage-scale'].example. `grade` is an
// enum (I..IV). The compute reports the grade and its residual-movement description. The example sets grade II;
// its expected text carries no numeric facts (the description is word-only), so it flows through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/bromage-scale-v467.js';

export default [
  {
    id: 'bromage-scale',
    summary: 'The Bromage scale of motor block after neuraxial (epidural / spinal) anesthesia, by residual lower-limb movement, grades I/II/III/IV. I: nil (free knees and feet). II: partial (just able to flex the knees). III: almost complete (unable to flex the knees, some foot movement). IV: complete (unable to move the legs or feet). Reports the motor-block grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.bromageScale,
    fields: [
      { dom: 'bromage-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Bromage grade' },
    ],
  },
];
