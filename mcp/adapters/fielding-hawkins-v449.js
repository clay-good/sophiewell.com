// spec-v449 MCP wave: adapter for the Fielding-Hawkins classification in lib/fielding-hawkins-v449.js. The
// dom key mirrors the browser renderer (views/group-v449.js) and META['fielding-hawkins'].example. `type` is
// an enum (I..IV). The compute reports the type and its displacement description. The example sets type II;
// its expected numbers (3 to 5 mm) appear in the result band, so it flows through the default makeToArgs with
// no custom toArgs.

import * as C from '../../lib/fielding-hawkins-v449.js';

export default [
  {
    id: 'fielding-hawkins',
    summary: 'The Fielding-Hawkins classification of atlantoaxial rotatory subluxation / fixation, by the direction and degree of atlas displacement on the axis, types I/II/III/IV. I: no anterior displacement (ADI <= 3 mm), odontoid pivot. II: anterior 3-5 mm, transverse ligament deficient. III: anterior > 5 mm, transverse and alar ligaments deficient. IV: posterior displacement. Reports the imaging type, not a diagnosis, a stability determination, a treatment decision, or a prognosis.',
    compute: C.fieldingHawkins,
    fields: [
      { dom: 'fh-type', arg: 'type', kind: 'enum', values: ['I', 'II', 'III', 'IV'], label: 'Fielding-Hawkins type' },
    ],
  },
];
