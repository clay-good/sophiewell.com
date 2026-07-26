// spec-v500 MCP wave: adapter for the Tegner activity scale in lib/tegner-activity-v500.js.
// The dom key mirrors the browser renderer (views/group-v500.js) and META['tegner-activity'].example.
// `level` is an enum ('0' through '10'). The compute reports the level and its work / sport anchors. The
// example sets level 5; the only number in its expected text is the level itself, which the result band
// carries, so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/tegner-activity-v500.js';

export default [
  {
    id: 'tegner-activity',
    summary: 'The Tegner activity scale, a knee activity level from 0 to 10, normally reported alongside the Lysholm knee score: the score measures symptoms, the scale records the activity level those symptoms are measured against. 0 is sick leave or a disability pension because of knee problems; 1-3 sedentary to light labor; 4-5 moderately heavy to heavy labor with recreational then competitive cycling and jogging; 6-7 recreational racquet sports up to competitive tennis or running; 8-10 competitive sport, topping out at national elite team sport. An activity-level descriptor, not a pathology grade: no level is abnormal. Reports the level, not a diagnosis, a return-to-sport clearance, or a prediction of what the knee will tolerate.',
    compute: C.tegnerActivity,
    fields: [
      { dom: 'tegner-level', arg: 'level', kind: 'enum', values: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], label: 'Tegner activity level' },
    ],
  },
];
