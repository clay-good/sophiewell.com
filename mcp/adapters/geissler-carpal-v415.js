// spec-v415 MCP wave: adapter for the Geissler arthroscopic classification of interosseous carpal-ligament
// injury in lib/geissler-carpal-v415.js. The dom key mirrors the browser renderer (views/group-v415.js) and
// META['geissler-carpal'].example. `grade` is an enum (I/II/III/IV). The compute reports the grade and its
// arthroscopic-appearance description. The example sets grade II; its expected text carries no numeric facts
// (the grade description is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/geissler-carpal-v415.js';

export default [
  {
    id: 'geissler-carpal',
    summary: 'Geissler arthroscopic classification of an interosseous (scapholunate / lunotriquetral) carpal-ligament injury, grades I/II/III/IV, by what is seen from the radiocarpal vs midcarpal joint and whether a probe or arthroscope passes the interval. I: radiocarpal attenuation, midcarpal alignment congruent. II: added midcarpal incongruency, no probe passage. III: incongruency from both joints, a probe passes. IV: gross instability, a 2.7 mm arthroscope passes (drive-through sign). Reports the grade, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.geisslerCarpal,
    fields: [
      { dom: 'gc-grade', arg: 'grade', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Geissler grade' },
    ],
  },
];
