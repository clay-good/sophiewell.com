// spec-v298 MCP wave: adapter for the Graduated Return-to-Sport (RTS) strategy
// in lib/concussion-rts-v298.js. The single dom key mirrors the browser renderer
// (views/group-v298.js) and META['concussion-rts'].example. `step` is a required
// enum over the 6 RTS steps; the compute returns the exercise strategy, the
// activity, the goal, and the symptom-resolution / HCP-clearance gate flags. The
// `band` carries the "Step 4" example, so it round-trips through the default
// makeToArgs with no custom toArgs.

import * as C from '../../lib/concussion-rts-v298.js';

export default [
  {
    id: 'concussion-rts',
    summary: 'Graduated Return-to-Sport (RTS) strategy after sport-related concussion (Amsterdam 2022 consensus): given the RTS step (1-6), reports the exercise strategy, the activity at that step, the goal, and the progression gates - Steps 4-6 begin only after full symptom resolution (including after exertion), and a written HCP determination of readiness is required before unrestricted return to sport. Reports the consensus strategy descriptor, not a clearance decision.',
    compute: C.concussionRtsStep,
    fields: [
      { dom: 'crts-step', arg: 'step', kind: 'enum', required: true, values: ['1', '2', '3', '4', '5', '6'], label: 'Return-to-sport step' },
    ],
  },
];
