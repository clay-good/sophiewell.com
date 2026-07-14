// spec-v308 MCP wave: adapter for the Graduated Return-to-Learn (RTL) strategy in
// lib/concussion-rtl-v308.js. The single dom key mirrors the browser renderer
// (views/group-v308.js) and META['concussion-rtl'].example. `step` is a required
// enum over the 4 RTL steps; the compute returns the mental activity, the activity,
// and the goal. The `band` carries the "Step 3 of 4" example, so it round-trips
// through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/concussion-rtl-v308.js';

export default [
  {
    id: 'concussion-rtl',
    summary: 'Graduated Return-to-Learn (RTL) strategy after sport-related concussion (Amsterdam 2022 consensus), the school companion to the return-to-sport ladder: given the RTL step (1-4), returns the mental activity, the activity at that step, and the goal. Progression is symptom-limited, and a full RTL is completed before unrestricted return to sport. Reports the consensus strategy descriptor, not a clearance decision.',
    compute: C.concussionRtlStep,
    fields: [
      { dom: 'crtl-step', arg: 'step', kind: 'enum', required: true, values: ['1', '2', '3', '4'], label: 'Return-to-learn step' },
    ],
  },
];
