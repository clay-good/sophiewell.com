// spec-v469 MCP wave: adapter for the Steinbrocker RA functional classification in lib/steinbrocker-ra-v469.js.
// The dom key mirrors the browser renderer (views/group-v469.js) and META['steinbrocker-ra'].example. `cls` is
// an enum (I..IV). The compute reports the class and its functional-capacity description. The example sets
// class II; its expected text carries no numeric facts (the description is word-only), so it flows through the
// default makeToArgs with no custom toArgs.

import * as C from '../../lib/steinbrocker-ra-v469.js';

export default [
  {
    id: 'steinbrocker-ra',
    summary: 'The Steinbrocker functional classification of rheumatoid arthritis, by global functional capacity, classes I/II/III/IV. I: complete capacity, all usual duties. II: adequate for normal activities despite discomfort or limited joint mobility. III: adequate for little or none of the usual occupation or self-care. IV: largely or wholly incapacitated. Reports the functional class, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.steinbrockerRa,
    fields: [
      { dom: 'steinbrocker-class', arg: 'cls', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Steinbrocker class' },
    ],
  },
];
