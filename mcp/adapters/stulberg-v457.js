// spec-v457 MCP wave: adapter for the Stulberg Perthes residual-deformity classification in
// lib/stulberg-v457.js. The dom key mirrors the browser renderer (views/group-v457.js) and
// META['stulberg'].example. `cls` is an enum (I..V). The compute reports the class and its sphericity /
// congruency description. The example sets class III; its expected text carries no numeric facts (the
// description is word-only), so it flows through the default makeToArgs with no custom toArgs.

import * as C from '../../lib/stulberg-v457.js';

export default [
  {
    id: 'stulberg',
    summary: 'The Stulberg classification of the residual femoral head after Legg-Calve-Perthes disease, by sphericity and joint congruency at maturity, classes I/II/III/IV/V. I: normal spherical head. II: spherical but with coxa magna, a short neck, or an abnormal acetabulum. III: non-spherical (ovoid/mushroom/umbrella) but not flat. IV: flat head, congruent. V: flat head, incongruent. Reports the radiographic class, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.stulberg,
    fields: [
      { dom: 'stulberg-class', arg: 'cls', kind: 'enum', values: ['I', 'II', 'III', 'IV', 'V'], label: 'Stulberg class' },
    ],
  },
];
