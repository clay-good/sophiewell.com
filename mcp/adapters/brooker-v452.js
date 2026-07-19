// spec-v452 MCP wave: adapter for the Brooker heterotopic-ossification classification in
// lib/brooker-v452.js. The dom key mirrors the browser renderer (views/group-v452.js) and
// META['brooker'].example. `cls` is an enum (I..IV). The compute reports the class and its radiographic
// description. The example sets class II; its expected text carries the "1 cm" gap fact, so the default
// makeToArgs flows through with no custom toArgs.

import * as C from '../../lib/brooker-v452.js';

export default [
  {
    id: 'brooker',
    summary: 'The Brooker classification of heterotopic (ectopic) ossification about the hip, by the radiographic extent of ectopic bone, classes I/II/III/IV. I: islands of bone in soft tissue. II: spurs leaving at least 1 cm between opposing surfaces. III: spurs reducing the gap to less than 1 cm. IV: apparent bony ankylosis. Reports the radiographic class, not a diagnosis, a treatment decision, or a prognosis.',
    compute: C.brooker,
    fields: [
      { dom: 'brooker-class', arg: 'cls', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Brooker class' },
    ],
  },
];
